import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";
import type { UploadedContactAttachment, ValidatedContactFile } from "@/lib/contact-file-utils";
import { readWebFileToUint8Array, sanitizeFilename } from "@/lib/contact-file-utils";
import {
  getContactR2Config,
  getContactR2PublicBaseUrlFromEnv,
  type ContactR2Config,
} from "@/lib/contact-upload-config";

function getTimestampPrefix(submittedAtIso: string): string {
  return submittedAtIso.replace(/[:.]/g, "-");
}

function encodeObjectKeyForUrl(key: string): string {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export function createContactR2Client(config: ContactR2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    /**
     * AWS SDK ≥3.729 sends CRC checksum headers on PutObject by default; R2 returns
     * NotImplemented for those. See Cloudflare R2 + aws-sdk-js-v3 docs.
     */
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    // Cloudflare Workers (OpenNext) must use fetch, not Node's http stack.
    requestHandler: new FetchHttpHandler({}),
  });
}

export function buildContactAttachmentObjectKey(params: {
  submissionId: string;
  submittedAt: string;
  fileName: string;
  fileIndex: number;
}): string {
  const timestampPrefix = getTimestampPrefix(params.submittedAt);
  const safeName = sanitizeFilename(params.fileName) || `attachment-${params.fileIndex + 1}`;
  return [
    "contact-submissions",
    params.submissionId,
    `${timestampPrefix}-${params.fileIndex + 1}-${safeName}`,
  ].join("/");
}

export function buildContactSubmissionRecordKey(submissionId: string): string {
  return ["contact-submissions", submissionId, "submission.json"].join("/");
}

type ContactSubmissionRecord = {
  submissionId: string;
  submittedAt: string;
  recipientEmail: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  formId: string;
  formName: string;
  productName: string;
  pageUrl: string;
  pageTitle: string;
  userIp: string;
  userAgent: string;
  attachments: UploadedContactAttachment[];
};

/**
 * Durable receipt for a contact lead (JSON). Lets the API return success after
 * accept+persist while email / WordPress run in the background via waitUntil.
 */
export async function persistContactSubmissionToR2(
  submission: ContactSubmissionRecord
): Promise<void> {
  const key = buildContactSubmissionRecordKey(submission.submissionId);
  const body = JSON.stringify(submission, null, 0);
  const publicBaseForBinding = getContactR2PublicBaseUrlFromEnv();

  if (publicBaseForBinding) {
    let useBinding = false;
    let bucket: R2Bucket | undefined;
    try {
      const { env } = await getCloudflareContext({ async: true });
      bucket = env.CONTACT_ATTACHMENTS_R2;
      useBinding = Boolean(bucket);
    } catch {
      // Plain next / no Wrangler: use S3 below
    }
    if (useBinding && bucket) {
      await bucket.put(key, body, {
        httpMetadata: { contentType: "application/json; charset=utf-8" },
      });
      return;
    }
  }

  const config = getContactR2Config();
  const client = createContactR2Client(config);
  const bytes = new TextEncoder().encode(body);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: bytes,
      ContentType: "application/json; charset=utf-8",
      ContentLength: bytes.byteLength,
    })
  );
}

async function uploadOneViaS3Client(params: {
  client: S3Client;
  config: ContactR2Config;
  file: ValidatedContactFile;
  submissionId: string;
  submittedAt: string;
  fileIndex: number;
}): Promise<UploadedContactAttachment> {
  const key = buildContactAttachmentObjectKey({
    submissionId: params.submissionId,
    submittedAt: params.submittedAt,
    fileName: params.file.name,
    fileIndex: params.fileIndex,
  });

  const body = await readWebFileToUint8Array(params.file.file);
  await params.client.send(
    new PutObjectCommand({
      Bucket: params.config.bucketName,
      Key: key,
      Body: body,
      ContentType: params.file.mimeType,
      ContentLength: params.file.size,
    })
  );

  return {
    name: params.file.name,
    mimeType: params.file.mimeType,
    size: params.file.size,
    url: `${params.config.publicBaseUrl}/${encodeObjectKeyForUrl(key)}`,
  };
}

/**
 * Uploads contact form files to R2. On Cloudflare Workers, prefers the
 * `CONTACT_ATTACHMENTS_R2` native binding (reliable) and falls back to the S3
 * API for local development or if the binding is not configured.
 */
export async function uploadContactFilesToR2(
  files: ValidatedContactFile[],
  submission: { submissionId: string; submittedAt: string }
): Promise<UploadedContactAttachment[]> {
  if (files.length === 0) return [];

  const publicBaseForBinding = getContactR2PublicBaseUrlFromEnv();

  if (publicBaseForBinding) {
    // Only the Cloudflare context lookup is fallible: we fall back to S3 when
    // not running on OpenNext/Workers. Do NOT wrap R2 `put` in the same try —
    // a failed put must propagate (was previously swallowed, then S3 often failed
    // too — especially noticeable on larger bodies ~500 KiB+).
    let useBinding = false;
    let bucket: R2Bucket | undefined;
    try {
      const { env } = await getCloudflareContext({ async: true });
      bucket = env.CONTACT_ATTACHMENTS_R2;
      useBinding = Boolean(bucket);
    } catch {
      // Plain `next start` / no Wrangler: use S3 below
    }
    if (useBinding && bucket) {
      const uploads: UploadedContactAttachment[] = [];
      for (const [index, file] of files.entries()) {
        const key = buildContactAttachmentObjectKey({
          submissionId: submission.submissionId,
          submittedAt: submission.submittedAt,
          fileName: file.name,
          fileIndex: index,
        });
        const data = await readWebFileToUint8Array(file.file);
        await bucket.put(key, data, {
          httpMetadata: {
            contentType: file.mimeType || "application/octet-stream",
          },
        });
        uploads.push({
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          url: `${publicBaseForBinding}/${encodeObjectKeyForUrl(key)}`,
        });
      }
      return uploads;
    }
  }

  const config = getContactR2Config();
  const client = createContactR2Client(config);
  const fallback: UploadedContactAttachment[] = [];
  for (const [index, file] of files.entries()) {
    fallback.push(
      await uploadOneViaS3Client({
        client,
        config,
        file,
        submissionId: submission.submissionId,
        submittedAt: submission.submittedAt,
        fileIndex: index,
      })
    );
  }
  return fallback;
}
