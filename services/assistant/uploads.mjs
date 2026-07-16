import { randomUUID } from "node:crypto";
import { extname } from "node:path";

const DANGEROUS_EXTENSIONS = new Set([
  ".7z", ".apk", ".app", ".bat", ".bin", ".cmd", ".com", ".dmg", ".exe", ".gz",
  ".html", ".htm", ".iso", ".jar", ".js", ".msi", ".ps1", ".rar", ".sh", ".svg",
  ".tar", ".vbs", ".xlsm", ".docm", ".pptm", ".zip",
]);

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".csv", ".json", ".xml"]);
const OFFICE_EXTENSIONS = new Set([".doc", ".docx", ".rtf", ".odt", ".ppt", ".pptx", ".xls", ".xlsx"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".m4a", ".ogg", ".webm"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);

export class UploadError extends Error {
  constructor(message, status = 400, code = "INVALID_ATTACHMENT") {
    super(message);
    this.name = "UploadError";
    this.status = status;
    this.code = code;
  }
}

export function sanitizeFilename(name) {
  const cleaned = String(name || "attachment")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return cleaned || "attachment";
}

function startsWith(buffer, bytes) {
  return bytes.every((byte, index) => buffer[index] === byte);
}

function ascii(buffer, start = 0, end = buffer.length) {
  return buffer.subarray(start, end).toString("latin1");
}

function imageDimensions(buffer, extension) {
  if (extension === ".png" && buffer.length >= 24) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if ((extension === ".jpg" || extension === ".jpeg") && startsWith(buffer, [0xff, 0xd8])) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  if (extension === ".webp" && buffer.length >= 30 && ascii(buffer, 0, 4) === "RIFF" && ascii(buffer, 8, 12) === "WEBP") {
    const chunk = ascii(buffer, 12, 16);
    if (chunk === "VP8X") {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { width, height };
    }
  }
  return null;
}

function validateText(buffer) {
  if (buffer.includes(0)) throw new UploadError("Binary content cannot be uploaded as a text document");
  const decoded = buffer.toString("utf8");
  const replacementCount = (decoded.match(/\uFFFD/g) || []).length;
  if (replacementCount > Math.max(2, decoded.length * 0.01)) throw new UploadError("Text document is not valid UTF-8");
}

function validateOffice(buffer, extension) {
  const compound = startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  const zip = startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]);
  if ([".doc", ".xls", ".ppt"].includes(extension) && !compound) throw new UploadError("Office document signature does not match its extension");
  if (extension === ".rtf" && ascii(buffer, 0, 5) !== "{\\rtf") throw new UploadError("RTF signature does not match its extension");
  if (extension === ".odt" && !zip) throw new UploadError("ODT signature does not match its extension");
  if ([".docx", ".xlsx", ".pptx"].includes(extension)) {
    if (!zip) throw new UploadError("Office document signature does not match its extension");
    const directoryNames = ascii(buffer);
    const marker = extension === ".docx" ? "word/" : extension === ".xlsx" ? "xl/" : "ppt/";
    if (!directoryNames.includes("[Content_Types].xml") || !directoryNames.includes(marker)) {
      throw new UploadError("The uploaded archive is not a supported Office document");
    }
  }
}

function validatePdf(buffer) {
  if (ascii(buffer, 0, 5) !== "%PDF-") throw new UploadError("PDF signature does not match its extension");
  const body = ascii(buffer);
  if (/\/Encrypt\b/.test(body)) throw new UploadError("Password-protected PDFs are not supported");
  if (/\/(JavaScript|JS|Launch|EmbeddedFile)\b/.test(body)) throw new UploadError("PDF contains active or embedded content and was rejected");
  const pages = (body.match(/\/Type\s*\/Page\b/g) || []).length;
  if (pages > 50) throw new UploadError("PDF exceeds the 50-page processing limit");
}

function detectKind(buffer, filename, declaredType = "") {
  const extension = extname(filename).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(extension)) throw new UploadError(`Files ending in ${extension} are not supported`);
  const beginning = ascii(buffer, 0, Math.min(buffer.length, 512)).trimStart().toLowerCase();
  if (beginning.startsWith("<svg") || beginning.startsWith("<!doctype html") || beginning.startsWith("<html")) {
    throw new UploadError("Active web documents are not supported");
  }
  if (ascii(buffer).includes("EICAR-STANDARD-ANTIVIRUS-TEST-FILE")) throw new UploadError("Attachment failed the malware check", 422, "ATTACHMENT_REJECTED");

  if (extension === ".pdf") { validatePdf(buffer); return { kind: "document", mimeType: "application/pdf" }; }
  if (TEXT_EXTENSIONS.has(extension)) { validateText(buffer); return { kind: "document", mimeType: declaredType || "text/plain" }; }
  if (OFFICE_EXTENSIONS.has(extension)) { validateOffice(buffer, extension); return { kind: "document", mimeType: declaredType || "application/octet-stream" }; }
  if (IMAGE_EXTENSIONS.has(extension)) {
    const valid = extension === ".png" ? startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      : (extension === ".jpg" || extension === ".jpeg") ? startsWith(buffer, [0xff, 0xd8, 0xff])
      : ascii(buffer, 0, 4) === "RIFF" && ascii(buffer, 8, 12) === "WEBP";
    if (!valid) throw new UploadError("Image signature does not match its extension");
    const dimensions = imageDimensions(buffer, extension);
    if (dimensions && (dimensions.width > 8192 || dimensions.height > 8192 || dimensions.width * dimensions.height > 25_000_000)) {
      throw new UploadError("Image exceeds the 25-megapixel or 8192-pixel dimension limit");
    }
    const mimeType = extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
    return { kind: "image", mimeType, dimensions };
  }

  if (VIDEO_EXTENSIONS.has(extension) && String(declaredType).startsWith("video/")) {
    const valid = extension === ".webm" ? startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3]) : ascii(buffer, 4, 8) === "ftyp";
    if (!valid) throw new UploadError("Video signature does not match its extension");
    return { kind: "video", mimeType: extension === ".mp4" ? "video/mp4" : "video/webm" };
  }

  if (AUDIO_EXTENSIONS.has(extension)) {
    const valid = extension === ".mp3" ? (ascii(buffer, 0, 3) === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0))
      : extension === ".wav" ? ascii(buffer, 0, 4) === "RIFF" && ascii(buffer, 8, 12) === "WAVE"
      : extension === ".ogg" ? ascii(buffer, 0, 4) === "OggS"
      : extension === ".webm" ? startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3])
      : ascii(buffer, 4, 8) === "ftyp";
    if (!valid) throw new UploadError("Audio signature does not match its extension");
    const mimeType = declaredType && declaredType !== "application/octet-stream" ? declaredType : `audio/${extension.slice(1)}`;
    return { kind: "audio", mimeType };
  }

  throw new UploadError("This file type is not supported. Try PDF, text, Office, PNG/JPEG/WebP, audio, or MP4/WebM video.", 415, "UNSUPPORTED_ATTACHMENT");
}

export function validateAttachment({ buffer, filename, mimeType, config }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw new UploadError("Attachment is empty");
  if (buffer.length > config.maxFileBytes) throw new UploadError(`Attachment exceeds the ${Math.floor(config.maxFileBytes / 1024 / 1024)} MiB limit`, 413, "ATTACHMENT_TOO_LARGE");
  const safeName = sanitizeFilename(filename);
  const detected = detectKind(buffer, safeName, mimeType);
  return { ...detected, name: safeName, size: buffer.length };
}

export class AttachmentStore {
  constructor(config, now = () => Date.now()) {
    this.config = config;
    this.now = now;
    this.items = new Map();
  }

  cleanup() {
    const now = this.now();
    for (const [id, item] of this.items) if (item.expiresAt <= now) this.items.delete(id);
  }

  add(identity, file) {
    this.cleanup();
    const validated = validateAttachment({ ...file, config: this.config });
    const id = randomUUID();
    const item = { id, ownerKey: identity.key, buffer: file.buffer, ...validated, expiresAt: this.now() + this.config.attachmentTtlMs };
    this.items.set(id, item);
    return this.metadata(item);
  }

  metadata(item) {
    return { id: item.id, name: item.name, mimeType: item.mimeType, kind: item.kind, size: item.size, expiresAt: new Date(item.expiresAt).toISOString() };
  }

  getOwned(identity, ids) {
    this.cleanup();
    if (!Array.isArray(ids) || ids.length > this.config.maxFiles) throw new UploadError(`At most ${this.config.maxFiles} attachments are allowed`);
    const unique = [...new Set(ids)];
    return unique.map((id) => {
      const item = this.items.get(id);
      if (!item || item.ownerKey !== identity.key) throw new UploadError("One or more attachments are unavailable", 404, "ATTACHMENT_NOT_FOUND");
      return item;
    });
  }

  consume(items) {
    for (const item of items) this.items.delete(item.id);
  }
}

export async function filesFromMultipart(body, contentType, config) {
  if (!/^multipart\/form-data;/i.test(contentType || "")) throw new UploadError("Uploads require multipart/form-data", 415);
  const request = new Request("http://assistant.local/v1/uploads", { method: "POST", headers: { "content-type": contentType }, body });
  let form;
  try {
    form = await request.formData();
  } catch {
    throw new UploadError("Malformed multipart upload");
  }
  const files = form.getAll("files").filter((value) => typeof value?.arrayBuffer === "function");
  if (!files.length) throw new UploadError("Select at least one file");
  if (files.length > config.maxFiles) throw new UploadError(`At most ${config.maxFiles} files may be uploaded`, 413);
  const total = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
  if (total > config.maxTotalFileBytes) throw new UploadError("Combined attachments exceed the upload limit", 413, "ATTACHMENTS_TOO_LARGE");
  return Promise.all(files.map(async (file) => ({
    buffer: Buffer.from(await file.arrayBuffer()),
    filename: file.name,
    mimeType: file.type,
  })));
}

export function attachmentDataUrl(item) {
  return `data:${item.mimeType || "application/octet-stream"};base64,${item.buffer.toString("base64")}`;
}
