import http from "node:http";
import { pathToFileURL } from "node:url";
import { loadConfig } from "./config.mjs";
import { AuthError, identityFromHeaders, requireServiceKey } from "./auth.mjs";
import { AttachmentStore, UploadError, filesFromMultipart } from "./uploads.mjs";
import { OrderError, OrderService } from "./orders.mjs";
import { AssistantModel, ModelError } from "./openai.mjs";

class RequestError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

class RateLimiter {
  constructor(config, now = () => Date.now()) {
    this.config = config;
    this.now = now;
    this.entries = new Map();
  }

  check(key) {
    const now = this.now();
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + this.config.rateWindowMs });
      return;
    }
    current.count += 1;
    if (current.count > this.config.rateMax) throw new RequestError("Too many assistant requests. Please try again shortly.", 429, "RATE_LIMITED");
  }
}

function corsHeaders(req, config) {
  const origin = req.headers.origin;
  if (!origin) return {};
  if (!config.allowedOrigins.includes(origin)) throw new RequestError("Origin is not allowed", 403, "ORIGIN_NOT_ALLOWED");
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type,x-ehtravel-session-id",
    "Access-Control-Max-Age": "600",
  };
}

function sendJson(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(body);
}

async function readBody(req, maxBytes) {
  const declared = Number(req.headers["content-length"] || 0);
  if (declared > maxBytes) throw new RequestError("Request exceeds the assistant upload limit", 413, "REQUEST_TOO_LARGE");
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new RequestError("Request exceeds the assistant upload limit", 413, "REQUEST_TOO_LARGE");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseJson(buffer) {
  try {
    return JSON.parse(buffer.toString("utf8") || "{}");
  } catch {
    throw new RequestError("Request body must be valid JSON");
  }
}

function validateChatInput(input, config) {
  if (!input || typeof input !== "object") throw new RequestError("Assistant input is required");
  const message = String(input.message || "").trim();
  const attachmentIds = Array.isArray(input.attachmentIds) ? input.attachmentIds.map(String) : [];
  if (!message && !attachmentIds.length) throw new RequestError("Write a message or attach a file");
  if (message.length > config.maxMessageChars) throw new RequestError(`Messages may contain at most ${config.maxMessageChars} characters`);
  if (attachmentIds.length > config.maxFiles) throw new RequestError(`At most ${config.maxFiles} attachments are allowed`);
  const history = (Array.isArray(input.history) ? input.history : []).slice(-config.maxHistoryMessages).map((entry) => ({
    role: entry?.role === "ASSISTANT" ? "ASSISTANT" : "USER",
    text: String(entry?.text || "").slice(0, config.maxMessageChars),
  })).filter((entry) => entry.text);
  const conversationId = input.conversationId ? String(input.conversationId).slice(0, 100) : null;
  const bookingReference = input.bookingReference ? String(input.bookingReference).trim().toUpperCase().slice(0, 20) : "";
  return { message, attachmentIds, history, conversationId, bookingReference };
}

function inferredBookingReference(message) {
  const explicit = /(?:booking|reference|order)(?:\s+(?:reference|ref|number|id))?\s*[:#-]?\s*([A-Z0-9]{5,24})\b/i.exec(message);
  return explicit ? explicit[1].toUpperCase() : "";
}

function knownError(error) {
  if (error instanceof AuthError || error instanceof UploadError || error instanceof OrderError || error instanceof ModelError || error instanceof RequestError) return error;
  return new RequestError("The assistant request could not be completed", 500, "INTERNAL_ERROR");
}

export function createAssistantServer(options = {}) {
  const config = options.config || loadConfig();
  const attachments = options.attachments || new AttachmentStore(config);
  const orders = options.orders || new OrderService(config, options.fetchImpl || fetch);
  const model = options.model || new AssistantModel(config, options.fetchImpl || fetch);
  const limiter = options.limiter || new RateLimiter(config);

  const server = http.createServer(async (req, res) => {
    let cors = {};
    try {
      cors = corsHeaders(req, config);
      if (req.method === "OPTIONS") return sendJson(res, 204, {}, cors);
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

      if (req.method === "GET" && url.pathname === "/health") {
        return sendJson(res, 200, { status: "ok", modelConfigured: Boolean(config.openaiApiKey), orderProviderConfigured: Boolean(config.duffelToken) }, cors);
      }

      if (req.method === "POST" && url.pathname === "/v1/uploads") {
        const identity = identityFromHeaders(req.headers, config);
        limiter.check(`${identity.key}:uploads`);
        const body = await readBody(req, config.maxRequestBytes);
        const files = await filesFromMultipart(body, req.headers["content-type"], config);
        const uploaded = [];
        try {
          for (const file of files) uploaded.push(attachments.add(identity, file));
        } catch (error) {
          attachments.consume(uploaded.map((item) => ({ id: item.id })));
          throw error;
        }
        return sendJson(res, 201, { attachments: uploaded }, cors);
      }

      if (req.method === "GET" && url.pathname === "/v1/orders") {
        requireServiceKey(req.headers, config);
        const identity = identityFromHeaders(req.headers, config, { requireUser: true });
        limiter.check(`${identity.key}:orders`);
        const result = await orders.list(identity, url.searchParams.get("bookingReference") || "");
        return sendJson(res, 200, { orders: result }, cors);
      }

      if (req.method === "POST" && url.pathname === "/v1/chat") {
        requireServiceKey(req.headers, config);
        const identity = identityFromHeaders(req.headers, config);
        limiter.check(`${identity.key}:chat`);
        const input = validateChatInput(parseJson(await readBody(req, Math.min(config.maxRequestBytes, 1_000_000))), config);
        const ownedAttachments = attachments.getOwned(identity, input.attachmentIds);
        let ownedOrders = [];
        let orderLookupUnavailable = false;
        try {
          const reference = input.bookingReference || inferredBookingReference(input.message);
          ownedOrders = identity.anonymous ? [] : await orders.list(identity, reference);
        } catch (error) {
          if (!(error instanceof OrderError)) throw error;
          orderLookupUnavailable = true;
        }
        try {
          const reply = await model.respond({ identity, ...input, attachments: ownedAttachments, orders: ownedOrders, orderLookupUnavailable });
          return sendJson(res, 200, {
            ...reply,
            orders: ownedOrders,
            attachments: ownedAttachments.map((item) => attachments.metadata(item)),
          }, cors);
        } finally {
          attachments.consume(ownedAttachments);
        }
      }

      throw new RequestError("Not found", 404, "NOT_FOUND");
    } catch (rawError) {
      const error = knownError(rawError);
      sendJson(res, error.status || 500, { error: { code: error.code || "INTERNAL_ERROR", message: error.message } }, cors);
    }
  });

  return { server, config, attachments, orders, model };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { server, config } = createAssistantServer();
  server.listen(config.port, "0.0.0.0", () => {
    console.log(`EHTravel assistant middleware listening on :${config.port}`);
  });
}
