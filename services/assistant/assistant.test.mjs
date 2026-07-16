import assert from "node:assert/strict";
import { generateKeyPairSync, sign as signSignature } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import { signToken, verifyToken, identityFromHeaders, AuthError } from "./auth.mjs";
import { loadConfig, MiB } from "./config.mjs";
import { AttachmentStore, UploadError, validateAttachment } from "./uploads.mjs";
import { OrderService } from "./orders.mjs";
import { AssistantModel } from "./openai.mjs";
import { createAssistantServer } from "./server.mjs";

function config(overrides = {}) {
  return loadConfig({
    production: false,
    serviceKey: "test-service-key",
    authSecret: "test-auth-secret-with-enough-entropy",
    authIssuer: "https://identity.test/",
    authAudience: "ehtravel-test",
    clerkSecretKey: "",
    clerkPublishableKey: "",
    clerkIssuer: "",
    clerkAudience: "",
    clerkAuthorizedParties: ["https://app.test"],
    clerkApiUrl: "https://api.clerk.test",
    clerkUserCacheMs: 60_000,
    allowedOrigins: ["https://app.test"],
    allowAnonymous: true,
    maxFileBytes: 10 * MiB,
    maxTotalFileBytes: 25 * MiB,
    maxFiles: 5,
    maxRequestBytes: 27 * MiB,
    attachmentTtlMs: 60_000,
    maxMessageChars: 8000,
    maxHistoryMessages: 12,
    rateWindowMs: 60_000,
    rateMax: 30,
    openaiApiKey: "",
    duffelToken: "duffel-server-test-value",
    orderAccess: {},
    ...overrides,
  });
}

function tokenFor(subject, tenant = "tenant-a", overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return signToken({
    sub: subject,
    tenant_id: tenant,
    iss: "https://identity.test/",
    aud: "ehtravel-test",
    iat: now,
    exp: now + 3600,
    ...overrides,
  }, "test-auth-secret-with-enough-entropy");
}

function pngFile(name = "receipt.png") {
  return {
    filename: name,
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
  };
}

test("JWT verification rejects tampering, expiry, and wrong audience", () => {
  const cfg = config();
  const valid = tokenFor("user-a");
  assert.equal(verifyToken(valid, cfg).sub, "user-a");
  assert.throws(() => verifyToken(`${valid.slice(0, -1)}x`, cfg), AuthError);
  assert.throws(() => verifyToken(tokenFor("user-a", "tenant-a", { exp: 1 }), cfg), /expired/);
  assert.throws(() => verifyToken(tokenFor("user-a", "tenant-a", { aud: "other" }), cfg), /audience/);
});

test("anonymous identities require an unpredictable browser session identifier", async () => {
  const cfg = config();
  await assert.rejects(() => identityFromHeaders({}, cfg), /browser session/);
  const identity = await identityFromHeaders({ "x-ehtravel-session-id": "browser_session_123456789" }, cfg);
  assert.equal(identity.anonymous, true);
});

test("Clerk tokens require an authorized application and load ownership from private metadata", async () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const kid = `test-key-${Date.now()}`;
  const jwk = { ...publicKey.export({ format: "jwk" }), kid, use: "sig", alg: "RS256" };
  const now = Math.floor(Date.now() / 1000);
  const token = (azp) => {
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      sub: `user_${kid}`,
      iss: "https://clerk.test",
      azp,
      iat: now,
      exp: now + 3600,
    })).toString("base64url");
    const signature = signSignature("RSA-SHA256", Buffer.from(`${header}.${payload}`), privateKey).toString("base64url");
    return `${header}.${payload}.${signature}`;
  };
  const calls = [];
  const fakeFetch = async (url) => {
    calls.push(String(url));
    if (String(url).endsWith("/v1/jwks")) return { ok: true, json: async () => ({ keys: [jwk] }) };
    return {
      ok: true,
      json: async () => ({
        private_metadata: { ehtravel: { orderIds: ["ord_owned"], bookingReferences: ["abc123"] } },
      }),
    };
  };
  const cfg = config({
    clerkSecretKey: "sk_live_test",
    clerkIssuer: "https://clerk.test",
    clerkAuthorizedParties: ["https://app.test"],
  });

  const identity = await identityFromHeaders(
    { authorization: `Bearer ${token("https://app.test")}` },
    cfg,
    { requireUser: true, fetchImpl: fakeFetch },
  );
  assert.equal(identity.sub, `user_${kid}`);
  assert.deepEqual(identity.claims.order_ids, ["ord_owned"]);
  assert.deepEqual(identity.claims.booking_references, ["ABC123"]);
  assert.equal(calls.some((url) => url.includes(`/v1/users/user_${kid}`)), true);
  await assert.rejects(
    () => identityFromHeaders(
      { authorization: `Bearer ${token("https://evil.test")}` },
      cfg,
      { requireUser: true, fetchImpl: fakeFetch },
    ),
    /unauthorized application/,
  );
});

test("attachments enforce signatures, active-content rejection, size, and ownership", () => {
  const cfg = config({ maxFileBytes: 1000 });
  const owner = { key: "tenant-a:user-a" };
  const foreign = { key: "tenant-a:user-b" };
  const store = new AttachmentStore(cfg);
  const metadata = store.add(owner, pngFile("..\\proof.png"));
  assert.equal(metadata.name, ".._proof.png");
  assert.equal(metadata.kind, "image");
  assert.throws(() => store.getOwned(foreign, [metadata.id]), /unavailable/);
  assert.equal(store.getOwned(owner, [metadata.id])[0].id, metadata.id);
  assert.throws(() => validateAttachment({ ...pngFile("spoof.jpg"), config: cfg }), /signature/);
  assert.throws(() => validateAttachment({ filename: "active.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7 /JavaScript /Type /Page"), config: cfg }), /active/);
  assert.throws(() => validateAttachment({ filename: "large.txt", mimeType: "text/plain", buffer: Buffer.alloc(1001, 65), config: cfg }), (error) => error instanceof UploadError && error.status === 413);
});

test("order service never calls Duffel until the requested order is owned", async () => {
  const calls = [];
  const cfg = config({ orderAccess: { "tenant-a:user-a": [{ id: "ord_owned" }, { bookingReference: "ABC123" }] } });
  const fakeFetch = async (url) => {
    calls.push(String(url));
    const order = {
      id: "ord_owned", booking_reference: "ABC123", status: "confirmed",
      total_amount: "120.00", total_currency: "USD", slices: [],
    };
    return { ok: true, json: async () => ({ data: String(url).includes("booking_reference") ? [order] : order }) };
  };
  const service = new OrderService(cfg, fakeFetch);
  const identity = await identityFromHeaders({ authorization: `Bearer ${tokenFor("user-a")}` }, cfg, { requireUser: true });

  assert.deepEqual(await service.list(identity, "FOREIGN999"), []);
  assert.equal(calls.length, 0, "foreign reference must not trigger a provider lookup");
  const orders = await service.list(identity, "ABC123");
  assert.equal(orders[0].bookingReference, "ABC123");
  assert.equal(calls.length, 1);
});

test("an order-ID ownership mapping can resolve its booking reference without trusting that reference", async () => {
  const calls = [];
  const cfg = config({ orderAccess: { "tenant-a:user-a": [{ id: "ord_owned" }] } });
  const service = new OrderService(cfg, async (url) => {
    calls.push(String(url));
    return { ok: true, json: async () => ({ data: { id: "ord_owned", booking_reference: "ABC123", status: "confirmed", slices: [] } }) };
  });
  const identity = await identityFromHeaders({ authorization: `Bearer ${tokenFor("user-a")}` }, cfg, { requireUser: true });
  assert.equal((await service.list(identity, "ABC123"))[0].id, "ord_owned");
  assert.equal(calls[0].endsWith("/air/orders/ord_owned"), true);
  assert.deepEqual(await service.list(identity, "NOTMINE"), []);
});

test("model fallback never fabricates order data during a provider outage", async () => {
  const model = new AssistantModel(config({ openaiApiKey: "" }));
  const response = await model.respond({
    identity: { anonymous: false },
    conversationId: null,
    message: "What is my flight status?",
    history: [],
    attachments: [],
    orders: [],
    orderLookupUnavailable: true,
  });
  assert.match(response.message, /couldn't verify your live flight orders/i);
  assert.match(response.message, /No booking details were inferred/i);
});

async function startServer(options = {}) {
  const app = createAssistantServer(options);
  app.server.listen(0, "127.0.0.1");
  await once(app.server, "listening");
  const address = app.server.address();
  return { ...app, baseUrl: `http://127.0.0.1:${address.port}` };
}

test("HTTP boundary enforces CORS, service trust, auth, attachment ownership, and consume-on-use", async (t) => {
  const cfg = config({ duffelToken: "", orderAccess: {} });
  const app = await startServer({ config: cfg });
  t.after(() => app.server.close());

  let response = await fetch(`${app.baseUrl}/v1/uploads`, {
    method: "OPTIONS",
    headers: { Origin: "https://evil.test" },
  });
  assert.equal(response.status, 403);

  response = await fetch(`${app.baseUrl}/v1/orders`);
  assert.equal(response.status, 403);

  response = await fetch(`${app.baseUrl}/v1/orders`, {
    headers: { "X-Assistant-Service-Key": cfg.serviceKey, "X-EHTravel-Session-ID": "browser_session_123456789" },
  });
  assert.equal(response.status, 401);

  const sessionA = "browser_session_A_123456789";
  const form = new FormData();
  const png = pngFile();
  form.append("files", new Blob([png.buffer], { type: png.mimeType }), png.filename);
  response = await fetch(`${app.baseUrl}/v1/uploads`, {
    method: "POST",
    headers: { Origin: "https://app.test", "X-EHTravel-Session-ID": sessionA },
    body: form,
  });
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://app.test");
  const attachment = (await response.json()).attachments[0];

  response = await fetch(`${app.baseUrl}/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Assistant-Service-Key": cfg.serviceKey, "X-EHTravel-Session-ID": "browser_session_B_123456789" },
    body: JSON.stringify({ message: "analyze this", attachmentIds: [attachment.id], history: [] }),
  });
  assert.equal(response.status, 404);

  const chatRequest = () => fetch(`${app.baseUrl}/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Assistant-Service-Key": cfg.serviceKey, "X-EHTravel-Session-ID": sessionA },
    body: JSON.stringify({ message: "analyze this", attachmentIds: [attachment.id], history: [] }),
  });
  response = await chatRequest();
  assert.equal(response.status, 200);
  const reply = await response.json();
  assert.match(reply.message, /model is not configured/i);
  assert.equal(reply.attachments[0].id, attachment.id);

  response = await chatRequest();
  assert.equal(response.status, 404, "processed attachments must not be reusable");
});
