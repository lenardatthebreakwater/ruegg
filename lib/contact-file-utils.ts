import type { ContactUploadConfig } from "@/lib/contact-upload-config";

export type ValidatedContactFile = {
  file: File;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
};

export type UploadedContactAttachment = {
  name: string;
  url: string;
  mimeType: string;
  size: number;
  mediaId?: number;
};

function getLowerExtension(filename: string): string {
  const match = filename.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
}

export function sanitizeFilename(value: string): string {
  const trimmed = value.trim();
  const collapsed = trimmed.replace(/\s+/g, "-");
  return collapsed.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 180);
}

export function collectAttachmentDisplayLines(
  attachments: UploadedContactAttachment[]
): string[] {
  if (attachments.length === 0) return ["Ingen vedlegg."];
  return attachments.map(
    (attachment, index) => `${index + 1}. ${attachment.name} (${attachment.url})`
  );
}

/**
 * Read multipart `File` bytes in Cloudflare OpenNext. Do not use
 * `file.arrayBuffer()` / `file.stream()` for uploads here: the unenv `File`
 * polyfill can back onto a temp path and call `fs.readFile`, which is not
 * available on Workers (`[unenv] fs.readFile is not implemented yet!`).
 * `Response` + `arrayBuffer` uses the web body path instead.
 */
export async function readWebFileToUint8Array(file: File): Promise<Uint8Array> {
  return new Uint8Array(await new Response(file).arrayBuffer());
}

export async function toBase64(file: File): Promise<string> {
  const buffer = await readWebFileToUint8Array(file);
  return Buffer.from(buffer).toString("base64");
}

export function validateContactFiles(
  files: File[],
  config: ContactUploadConfig
): { ok: true; files: ValidatedContactFile[] } | { ok: false; error: string } {
  if (files.length > config.maxFiles) {
    return {
      ok: false,
      error: `Du kan laste opp maks ${config.maxFiles} filer.`,
    };
  }

  const validated: ValidatedContactFile[] = [];
  let totalBytes = 0;

  for (const file of files) {
    const sanitizedName = sanitizeFilename(file.name);
    if (!sanitizedName) {
      return { ok: false, error: "Én av filene mangler gyldig filnavn." };
    }

    const extension = getLowerExtension(sanitizedName);
    const mimeType = String(file.type ?? "").toLowerCase();
    if (!extension || !config.allowedExtensions.has(extension)) {
      return {
        ok: false,
        error: `Filtypen for "${file.name}" er ikke tillatt.`,
      };
    }
    // Browsers often omit MIME for HEIC/HEIF (and some camera exports). Trust the
    // extension allowlist when type is empty; reject only when a type is present
    // and not in the allowlist.
    if (mimeType && !config.allowedMimeTypes.has(mimeType)) {
      return {
        ok: false,
        error: `Innholdstypen for "${file.name}" er ikke tillatt.`,
      };
    }
    if (file.size <= 0) {
      return { ok: false, error: `Filen "${file.name}" er tom.` };
    }
    if (file.size > config.maxFileBytes) {
      const maxMb = Math.round(config.maxFileBytes / (1024 * 1024));
      return {
        ok: false,
        error: `Filen "${file.name}" er for stor. Maks ${maxMb} MB per fil.`,
      };
    }

    totalBytes += file.size;
    if (totalBytes > config.maxTotalBytes) {
      const maxMb = Math.round(config.maxTotalBytes / (1024 * 1024));
      return {
        ok: false,
        error: `Samlet størrelse på vedlegg er for stor. Maks ${maxMb} MB totalt.`,
      };
    }

    validated.push({
      file,
      name: sanitizedName,
      extension,
      mimeType: mimeType || guessMimeFromExtension(extension),
      size: file.size,
    });
  }

  return { ok: true, files: validated };
}

function guessMimeFromExtension(extension: string): string {
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".bmp":
      return "image/bmp";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    case ".tif":
    case ".tiff":
      return "image/tiff";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
