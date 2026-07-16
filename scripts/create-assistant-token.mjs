import { signToken } from "../services/assistant/auth.mjs";

const subject = process.argv[2] || "demo-user";
const tenantId = process.argv[3] || "demo-tenant";
const secret = process.env.EHT_AUTH_SECRET;
if (!secret) {
  console.error("Set EHT_AUTH_SECRET before creating a development access token.");
  process.exit(1);
}
const now = Math.floor(Date.now() / 1000);
const token = signToken({
  sub: subject,
  tenant_id: tenantId,
  iat: now,
  exp: now + 60 * 60,
  iss: process.env.EHT_AUTH_ISSUER || undefined,
  aud: process.env.EHT_AUTH_AUDIENCE || undefined,
}, secret);
process.stdout.write(`${token}\n`);
