import { createHmac, timingSafeEqual } from "node:crypto";

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
  if (!claims.sub || typeof claims.sub !== "string") throw new AuthError("Access token is missing a subject");
  if (!Number.isFinite(claims.exp) || claims.exp <= nowSeconds) throw new AuthError("Access token has expired");
  if (claims.nbf && claims.nbf > nowSeconds + 30) throw new AuthError("Access token is not active");
  if (config.authIssuer && claims.iss !== config.authIssuer) throw new AuthError("Invalid token issuer");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (config.authAudience && !audiences.includes(config.authAudience)) throw new AuthError("Invalid token audience");
  return claims;
}

function getHeader(headers, name) {
  if (typeof headers?.get === "function") return headers.get(name) || "";
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export function requireServiceKey(headers, config) {
  const provided = getHeader(headers, "x-assistant-service-key");
  if (!config.serviceKey || !safeEqual(provided, config.serviceKey)) {
    throw new AuthError("Assistant middleware request was not trusted", 403, "FORBIDDEN");
  }
}

export function identityFromHeaders(headers, config, { requireUser = false } = {}) {
  const authorization = getHeader(headers, "authorization");
  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    if (!match) throw new AuthError("Malformed authorization header");
    const claims = verifyToken(match[1], config);
    return {
      anonymous: false,
      sub: claims.sub,
      tenantId: String(claims.tenant_id || claims.org_id || "default"),
      claims,
      key: `${String(claims.tenant_id || claims.org_id || "default")}:${claims.sub}`,
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
