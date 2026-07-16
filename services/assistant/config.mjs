const MiB = 1024 * 1024;

function intEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function jsonEnv(name, fallback) {
  if (!process.env[name]) return fallback;
  try {
    return JSON.parse(process.env[name]);
  } catch {
    throw new Error(`${name} must contain valid JSON`);
  }
}

export function loadConfig(overrides = {}) {
  const production = (process.env.NODE_ENV || "development") === "production";
  const serviceKey = process.env.ASSISTANT_SERVICE_KEY || (production ? "" : "ehtravel-local-service-key");
  const authSecret = process.env.EHT_AUTH_SECRET || (production ? "" : "ehtravel-local-auth-secret-change-me");

  if (production && (!serviceKey || !authSecret)) {
    throw new Error("ASSISTANT_SERVICE_KEY and EHT_AUTH_SECRET are required in production");
  }

  return {
    production,
    port: intEnv("ASSISTANT_PORT", 4100),
    serviceKey,
    authSecret,
    authIssuer: process.env.EHT_AUTH_ISSUER || "",
    authAudience: process.env.EHT_AUTH_AUDIENCE || "",
    allowAnonymous: process.env.ASSISTANT_ALLOW_ANONYMOUS !== "false",
    allowedOrigins: (process.env.ASSISTANT_ALLOWED_ORIGINS || "http://localhost:3000,https://web-production-11001.up.railway.app,https://www.ehtravel.org")
      .split(",").map((value) => value.trim()).filter(Boolean),
    maxRequestBytes: intEnv("ASSISTANT_MAX_REQUEST_BYTES", 27 * MiB),
    maxFiles: intEnv("ASSISTANT_MAX_FILES", 5),
    maxFileBytes: intEnv("ASSISTANT_MAX_FILE_BYTES", 10 * MiB),
    maxTotalFileBytes: intEnv("ASSISTANT_MAX_TOTAL_FILE_BYTES", 25 * MiB),
    attachmentTtlMs: intEnv("ASSISTANT_ATTACHMENT_TTL_MS", 15 * 60 * 1000),
    maxMessageChars: intEnv("ASSISTANT_MAX_MESSAGE_CHARS", 8000),
    maxHistoryMessages: intEnv("ASSISTANT_MAX_HISTORY_MESSAGES", 12),
    rateWindowMs: intEnv("ASSISTANT_RATE_WINDOW_MS", 60 * 1000),
    rateMax: intEnv("ASSISTANT_RATE_MAX", 30),
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || "gpt-5.4-mini",
    transcriptionModel: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe",
    openaiBaseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    duffelToken: process.env.DUFFEL_API_TOKEN || "",
    duffelBaseUrl: (process.env.DUFFEL_API_BASE_URL || "https://api.duffel.com").replace(/\/$/, ""),
    orderAccess: jsonEnv("ORDER_ACCESS_JSON", {}),
    ...overrides,
  };
}

export { MiB };
