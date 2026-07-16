import { createHmac, createPublicKey, timingSafeEqual, verify as verifySignature } from "node:crypto";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function decodePart(value, label) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw new AuthError(`Malformed ${label}`);
  }
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function getHeader(headers, name) {
  if (typeof headers?.get === "function") return headers.get(name) || "";
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function validateClaims(claims, config, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!claims.sub || typeof claims.sub !== "string") throw new AuthError("Access token is missing a subject");
  if (!Number.isFinite(claims.exp) || claims.exp <= nowSeconds) throw new AuthError("Access token has expired");
  if (claims.nbf && claims.nbf > nowSeconds + 30) throw new AuthError("Access token is not active");
  if (config.authIssuer && claims.iss !== config.authIssuer) throw new AuthError("Invalid token issuer");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (config.authAudience && !audiences.includes(config.authAudience)) throw new AuthError("Invalid token audience");
  return claims;
}

function list(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map(String).filter(Boolean).slice(0, 20);
}

function clerkOwnership(user) {
  const metadata = user?.private_metadata?.ehtravel || user?.privateMetadata?.ehtravel || {};
  return {
    orderIds: list(metadata.orderIds || metadata.order_ids),
    bookingReferences: list(metadata.bookingReferences || metadata.booking_references).map((value) => value.toUpperCase()),
  };
}

const jwksCache = new Map();
const userCache = new Map();

export class AuthError extends Error {
  constructor(message = "Authentication required", status = 401, code = "UNAUTHENTICATED") {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
}

export function signToken(claims, secret, header = { alg: "HS256", typ: "JWT" }) {
  if (!secret) throw new Error("A signing secret is required");
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaims = base64url(JSON.stringify(claims));
  const signature = createHmac("sha256", secret).update(`${encodedHeader}.${encodedClaims}`).digest("base64url");
  return `${encodedHeader}.${encodedClaims}.${signature}`;
}

export function verifyToken(token, config, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!token || typeof token !== "string") throw new AuthError();
  const parts = token.split(".");
  if (parts.length !== 3) throw new AuthError("Malformed access token");
  const header = decodePart(parts[0], "token header");
  const claims = decodePart(parts[1], "token claims");
  if (header.alg !== "HS256" || header.typ !== "JWT") throw new AuthError("Unsupported access token");
  const expected = createHmac("sha256", config.authSecret).update(`${parts[0]}.${parts[1]}`).digest("base64url");
  if (!safeEqual(parts[2], expected)) throw new AuthError("Invalid access token");
  return validateClaims(claims, config, nowSeconds);
}

async function clerkFetch(config, path, fetchImpl = fetch) {
  const response = await fetchImpl(`${config.clerkApiUrl}${path}`, {
    headers: { Authorization: `Bearer ${config.clerkSecretKey}`, Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new AuthError("Authentication service is temporarily unavailable", 503, "AUTH_SERVICE_UNAVAILABLE");
  return response.json();
}

async function clerkJwks(config, fetchImpl) {
  const cacheKey = config.clerkIssuer || config.clerkSecretKey.slice(0, 16);
  const cached = jwksCache.get(cacheKey);
  if (cached?.expiresAt > Date.now()) return cached.keys;
  const payload = await clerkFetch(config, "/v1/jwks", fetchImpl);
  if (!Array.isArray(payload?.keys) || !payload.keys.length) throw new AuthError("Authentication keys are unavailable", 503, "AUTH_SERVICE_UNAVAILABLE");
  jwksCache.set(cacheKey, { keys: payload.keys, expiresAt: Date.now() + 5 * 60 * 1000 });
  return payload.keys;
}

export async function verifyClerkToken(token, config, fetchImpl = fetch, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!token || typeof token !== "string") throw new AuthError();
  const parts = token.split(".");
  if (parts.length !== 3) throw new AuthError("Malformed access token");
  const header = decodePart(parts[0], "token header");
  const claims = decodePart(parts[1], "token claims");
  if (header.alg !== "RS256" || !header.kid) throw new AuthError("Unsupported access token");
  const keys = await clerkJwks(config, fetchImpl);
  const jwk = keys.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) throw new AuthError("Invalid access token");
  const valid = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    createPublicKey({ key: jwk, format: "jwk" }),
    Buffer.from(parts[2], "base64url"),
  );
  if (!valid) throw new AuthError("Invalid access token");
  validateClaims(claims, {
    ...config,
    authIssuer: config.clerkIssuer || config.authIssuer,
    authAudience: config.clerkAudience || "",
  }, nowSeconds);
  if (!claims.azp || !config.clerkAuthorizedParties.includes(claims.azp)) throw new AuthError("Access token came from an unauthorized application");
  return claims;
}

async function clerkUserClaims(subject, config, fetchImpl) {
  const cacheKey = `${config.clerkIssuer || config.clerkApiUrl}:${subject}`;
  const cached = userCache.get(cacheKey);
  if (cached?.expiresAt > Date.now()) return cached.claims;
  const user = await clerkFetch(config, `/v1/users/${encodeURIComponent(subject)}`, fetchImpl);
  const ownership = clerkOwnership(user);
  const claims = {
    order_ids: ownership.orderIds,
    booking_references: ownership.bookingReferences,
  };
  userCache.set(cacheKey, { claims, expiresAt: Date.now() + config.clerkUserCacheMs });
  return claims;
}

export function requireServiceKey(headers, config) {
  const provided = getHeader(headers, "x-assistant-service-key");
  if (!config.serviceKey || !safeEqual(provided, config.serviceKey)) {
    throw new AuthError("Assistant middleware request was not trusted", 403, "FORBIDDEN");
  }
}

export async function identityFromHeaders(headers, config, { requireUser = false, fetchImpl = fetch } = {}) {
  const authorization = getHeader(headers, "authorization");
  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    if (!match) throw new AuthError("Malformed authorization header");
    const clerk = Boolean(config.clerkSecretKey);
    const verified = clerk
      ? await verifyClerkToken(match[1], config, fetchImpl)
      : verifyToken(match[1], config);
    const ownershipClaims = clerk ? await clerkUserClaims(verified.sub, config, fetchImpl) : {};
    const claims = { ...verified, ...ownershipClaims };
    const tenantId = String(claims.org_id || claims.tenant_id || "clerk");
    return {
      anonymous: false,
      sub: claims.sub,
      tenantId,
      claims,
      key: `${tenantId}:${claims.sub}`,
    };
  }

  if (requireUser || !config.allowAnonymous) throw new AuthError();
  const sessionId = String(getHeader(headers, "x-ehtravel-session-id") || "");
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(sessionId)) {
    throw new AuthError("A valid browser session is required");
  }
  return {
    anonymous: true,
    sub: `anonymous:${sessionId}`,
    tenantId: "anonymous",
    claims: {},
    key: `anonymous:${sessionId}`,
  };
}

export function publicIdentity(identity) {
  return { anonymous: identity.anonymous, subject: identity.sub, tenantId: identity.tenantId };
}
