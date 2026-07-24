/**
 * Shared contact-form upload constraints.
 * Defaults are used by both the client dropzone UI and server validation.
 * Server env vars can still override MIME/extension allowlists at runtime.
 */

/**
 * Worker memory budget (~128 MiB) must cover multipart parse + R2 upload
 * buffers. Keep totals well under the Next body limit (~12.5 MiB) so a
 * request cannot allocate multiple large copies of the same payload.
 */
export const DEFAULT_CONTACT_UPLOAD_MAX_FILES = 3;
/** Per-file cap (aligned with a safe Worker + multipart budget). */
export const DEFAULT_CONTACT_UPLOAD_MAX_FILE_BYTES = 2 * 1024 * 1024;
/** Aggregate attachment bytes per submission (all files combined). */
export const DEFAULT_CONTACT_UPLOAD_MAX_TOTAL_BYTES = 6 * 1024 * 1024;

/** MIME types accepted for fireplace-install contact attachments. */
export const DEFAULT_CONTACT_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/tiff",
  "image/tif",
  "application/pdf",
  "application/x-pdf",
] as const;

/**
 * File extensions accepted for fireplace-install contact attachments.
 * Includes common phone camera formats (HEIC/HEIF) and PDF plans/drawings.
 */
export const DEFAULT_CONTACT_UPLOAD_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".avif",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".pdf",
] as const;

/** `accept` attribute value for the native file picker. */
export const CONTACT_UPLOAD_ACCEPT_ATTR = [
  ...DEFAULT_CONTACT_UPLOAD_EXTENSIONS,
  ...DEFAULT_CONTACT_UPLOAD_MIME_TYPES,
].join(",");

/** Short Norwegian hint shown under the dropzone. */
export const CONTACT_UPLOAD_FORMAT_HINT =
  "JPG, PNG, GIF, BMP, WebP, AVIF, HEIC, TIFF eller PDF";

export type ContactUploadConfig = {
  maxFiles: number;
  maxFileBytes: number;
  maxTotalBytes: number;
  allowedMimeTypes: Set<string>;
  allowedExtensions: Set<string>;
};

export type ContactAttachmentMode = "off" | "url" | "binary";
export type ContactR2Config = {
  accountId: string;
  bucketName: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseCsvSet(value: string | undefined, fallback: readonly string[]): Set<string> {
  if (!value) return new Set(fallback);
  const values = value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  if (values.length === 0) return new Set(fallback);
  return new Set(values);
}

function parseRequiredString(value: string | undefined, envName: string): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }
  return normalized;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

/** Resolves the public file URL base; used for native R2 binding uploads (no S3 keys). */
export function getContactR2PublicBaseUrlFromEnv(): string | null {
  const raw = String(process.env.CONTACT_R2_PUBLIC_BASE_URL ?? "").trim();
  if (!raw) return null;
  return normalizeBaseUrl(raw);
}

export function getContactUploadConfig(): ContactUploadConfig {
  const maxFileBytes = parsePositiveInteger(
    process.env.CONTACT_UPLOAD_MAX_FILE_BYTES,
    DEFAULT_CONTACT_UPLOAD_MAX_FILE_BYTES
  );
  const maxTotalBytes = parsePositiveInteger(
    process.env.CONTACT_UPLOAD_MAX_TOTAL_BYTES,
    DEFAULT_CONTACT_UPLOAD_MAX_TOTAL_BYTES
  );

  return {
    maxFiles: parsePositiveInteger(
      process.env.CONTACT_UPLOAD_MAX_FILES,
      DEFAULT_CONTACT_UPLOAD_MAX_FILES
    ),
    maxFileBytes,
    // Never allow a total above a sane Worker budget even if env is mis-set.
    maxTotalBytes: Math.min(maxTotalBytes, 8 * 1024 * 1024),
    allowedMimeTypes: parseCsvSet(
      process.env.CONTACT_UPLOAD_ALLOWED_TYPES,
      DEFAULT_CONTACT_UPLOAD_MIME_TYPES
    ),
    allowedExtensions: parseCsvSet(
      process.env.CONTACT_UPLOAD_ALLOWED_EXTENSIONS,
      DEFAULT_CONTACT_UPLOAD_EXTENSIONS
    ),
  };
}

export function getContactAttachmentMode(): ContactAttachmentMode {
  const raw = String(process.env.CONTACT_EMAIL_ATTACHMENTS_MODE ?? "url")
    .trim()
    .toLowerCase();
  if (raw === "off" || raw === "url" || raw === "binary") return raw;
  return "url";
}

export function getContactR2Config(): ContactR2Config {
  const accountId = parseRequiredString(process.env.CONTACT_R2_ACCOUNT_ID, "CONTACT_R2_ACCOUNT_ID");
  const bucketName = parseRequiredString(
    process.env.CONTACT_R2_BUCKET_NAME,
    "CONTACT_R2_BUCKET_NAME"
  );
  const accessKeyId = parseRequiredString(
    process.env.CONTACT_R2_ACCESS_KEY_ID,
    "CONTACT_R2_ACCESS_KEY_ID"
  );
  const secretAccessKey = parseRequiredString(
    process.env.CONTACT_R2_SECRET_ACCESS_KEY,
    "CONTACT_R2_SECRET_ACCESS_KEY"
  );
  const publicBaseUrl = normalizeBaseUrl(
    parseRequiredString(process.env.CONTACT_R2_PUBLIC_BASE_URL, "CONTACT_R2_PUBLIC_BASE_URL")
  );

  return {
    accountId,
    bucketName,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
  };
}
