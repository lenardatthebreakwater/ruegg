import { after, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  collectAttachmentDisplayLines,
  toBase64,
  type UploadedContactAttachment,
  type ValidatedContactFile,
  validateContactFiles,
} from "@/lib/contact-file-utils";
import { getContactAttachmentMode, getContactUploadConfig } from "@/lib/contact-upload-config";
import {
  insertContactSubmissionToD1,
  updateContactSubmissionEmailStatus,
} from "@/lib/contact-d1";
import {
  persistContactSubmissionToR2,
  uploadContactFilesToR2,
} from "@/lib/contact-r2-client";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";
import {
  extractTurnstileToken,
  verifyTurnstileToken,
} from "@/lib/security/verify-turnstile";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";
import { SITE_CONTACT } from "@/lib/site-contact";

type ContactSubmitBody = {
  recipientEmail?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  formId?: string;
  formName?: string;
  productName?: string;
  pageUrl?: string;
  pageTitle?: string;
  turnstileToken?: string;
  "cf-turnstile-response"?: string;
};

type ContactSubmissionBase = {
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
};

type ContactSubmission = ContactSubmissionBase & {
  attachments: UploadedContactAttachment[];
};

type ParsedContactRequest = {
  submissionBase: ContactSubmissionBase;
  files: ValidatedContactFile[];
  turnstileToken: string;
};

const EMAIL_TIMEOUT_MS = 15_000;
/** Max contact submissions per client IP within the sliding window. */
const CONTACT_RATE_LIMIT_MAX = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
/** Cloudflare Email REST: total message size including attachments (see Cloudflare docs). */
const CLOUDFLARE_EMAIL_MAX_MESSAGE_BYTES = 5 * 1024 * 1024;
/** Leave headroom for JSON encoding and MIME structure. */
const CLOUDFLARE_EMAIL_SAFE_BINARY_BUDGET_BYTES = CLOUDFLARE_EMAIL_MAX_MESSAGE_BYTES - 64 * 1024;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeInline(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .trim();
}

function sanitizeMultiline(value: unknown): string {
  return String(value ?? "")
    .replace(/\r/g, "")
    .trim();
}

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/**
 * Never trust client `recipientEmail` — that would make this endpoint an open
 * mail relay. Placement recipients are allowlisted by `formId` (server-side).
 * Other forms use CONTACT_RECIPIENT_OVERRIDE or SITE_CONTACT.email.
 */
function getRecipientEmail(formId: string): string {
  if (formId === CONTACT_FORM_PLACEMENTS.accountSuggestions.formId) {
    const suggestionsOverride = sanitizeInline(
      process.env.CONTACT_SUGGESTIONS_RECIPIENT
    );
    if (suggestionsOverride && isValidEmail(suggestionsOverride)) {
      return suggestionsOverride;
    }
    return SITE_CONTACT.suggestionsEmail;
  }

  const override = sanitizeInline(process.env.CONTACT_RECIPIENT_OVERRIDE);
  if (override && isValidEmail(override)) return override;
  return SITE_CONTACT.email;
}

function buildEmailSubject(submission: ContactSubmission): string {
  if (submission.formId === CONTACT_FORM_PLACEMENTS.accountSuggestions.formId) {
    return submission.name
      ? `Nytt forslag fra ${submission.name}`
      : "Nytt forslag fra Min konto";
  }

  const base = submission.name
    ? `Ny henvendelse fra ${submission.name}`
    : "Ny henvendelse fra kontaktskjema";
  if (submission.productName) {
    return `${base} — ${submission.productName}`;
  }
  return base;
}

function buildEmailText(submission: ContactSubmission): string {
  const attachmentLines = collectAttachmentDisplayLines(submission.attachments);
  const lines = [
    `Submission ID: ${submission.submissionId}`,
    `Sendt: ${submission.submittedAt}`,
    `Skjema: ${submission.formName || "Kontakt oss"}`,
    ...(submission.productName
      ? [`Produkt: ${submission.productName}`]
      : []),
    `Navn: ${submission.name}`,
    `E-post: ${submission.email}`,
    `Telefon: ${submission.phone || "-"}`,
    "",
    "Melding:",
    submission.message,
    "",
    "Vedlegg:",
    ...attachmentLines,
  ];

  return lines.join("\n");
}

function getCloudflareAccountId(): string {
  const explicit = sanitizeInline(process.env.CLOUDFLARE_ACCOUNT_ID);
  if (explicit) return explicit;
  return sanitizeInline(process.env.CONTACT_R2_ACCOUNT_ID);
}

/**
 * API token for Email Sending only. Use `CONTACT_EMAIL_API_TOKEN` in production
 * (Workers env) so a narrow "Email Sending: Send" token is not conflated with
 * `CLOUDFLARE_API_TOKEN`, which Wrangler uses for deploy and R2 writes.
 */
function getContactEmailApiToken(): string {
  return (
    sanitizeInline(process.env.CONTACT_EMAIL_API_TOKEN) ||
    sanitizeInline(process.env.CLOUDFLARE_API_TOKEN)
  );
}

function estimateCloudflareMessageSizeBytes(textBody: string, files: ValidatedContactFile[]): number {
  let total = Buffer.byteLength(textBody, "utf8");
  for (const entry of files) {
    total += Math.ceil((entry.size * 4) / 3);
  }
  return total;
}

type CloudflareSendResult = {
  success?: boolean;
  errors?: unknown;
  result?: {
    delivered?: string[];
    permanent_bounces?: string[];
    queued?: string[];
  };
};

async function sendViaCloudflareEmail(
  submission: ContactSubmission,
  files: ValidatedContactFile[]
): Promise<void> {
  const accountId = getCloudflareAccountId();
  const apiToken = getContactEmailApiToken();
  const fromAddress = sanitizeInline(process.env.CONTACT_EMAIL_FROM);
  const fromName = sanitizeInline(process.env.CONTACT_EMAIL_FROM_NAME) || "Peisbutikken";

  if (!accountId || !apiToken || !fromAddress) {
    throw new Error("Cloudflare Email is not configured.");
  }

  const textBody = buildEmailText(submission);
  const mode = getContactAttachmentMode();
  let attachments:
    | Array<{
        content: string;
        filename: string;
        type: string;
        disposition: "attachment";
      }>
    | undefined;

  // Prefer URL-only email metadata whenever R2 already produced public links.
  // Base64 payloads duplicate file bytes in Worker memory and can approach the
  // 128 MiB isolate limit under multipart + R2 buffering.
  const hasR2Urls = submission.attachments.some(
    (attachment) => typeof attachment.url === "string" && attachment.url.length > 0
  );
  if (mode === "binary" && files.length > 0 && !hasR2Urls) {
    const estimated = estimateCloudflareMessageSizeBytes(textBody, files);
    if (estimated > CLOUDFLARE_EMAIL_SAFE_BINARY_BUDGET_BYTES) {
      console.warn(
        "[contact-submit] cloudflare email: binary attachments skipped (estimated size exceeds Cloudflare limit)",
        { estimatedBytes: estimated, limit: CLOUDFLARE_EMAIL_SAFE_BINARY_BUDGET_BYTES }
      );
    } else {
      attachments = await Promise.all(
        files.map(async (entry) => ({
          content: await toBase64(entry.file),
          filename: entry.name,
          type: entry.mimeType || "application/octet-stream",
          disposition: "attachment" as const,
        }))
      );
    }
  } else if (mode === "binary" && hasR2Urls) {
    console.info(
      "[contact-submit] cloudflare email: skipping base64 attachments; using R2 URLs in body"
    );
  }

  const payload: Record<string, unknown> = {
    to: submission.recipientEmail,
    from: { address: fromAddress, name: fromName },
    reply_to: submission.email,
    subject: buildEmailSubject(submission),
    text: textBody,
  };
  if (attachments && attachments.length > 0) {
    payload.attachments = attachments;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/email/sending/send`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    const raw = await response.text();
    let parsed: CloudflareSendResult | null = null;
    try {
      parsed = JSON.parse(raw) as CloudflareSendResult;
    } catch {
      parsed = null;
    }

    if (!response.ok || !parsed?.success) {
      throw new Error(`Cloudflare Email request failed (${response.status}): ${raw}`);
    }

    const bounces = parsed.result?.permanent_bounces ?? [];
    if (bounces.length > 0) {
      console.error("[contact-submit] cloudflare email permanent bounces", bounces);
      throw new Error(`Cloudflare Email permanent bounces: ${bounces.join(", ")}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendContactEmail(
  submission: ContactSubmission,
  files: ValidatedContactFile[]
): Promise<void> {
  await sendViaCloudflareEmail(submission, files);
}

function parseSubmissionBody(body: ContactSubmitBody, request: Request): ContactSubmissionBase | null {
  const name = sanitizeInline(body.name);
  const email = sanitizeInline(body.email).toLowerCase();
  const phone = sanitizeInline(body.phone);
  const message = sanitizeMultiline(body.message);
  const formId = sanitizeInline(body.formId) || "contact-form";
  const formName = sanitizeInline(body.formName) || "Kontakt oss";
  const productName = sanitizeInline(body.productName).slice(0, 300);
  const pageUrl = sanitizeInline(body.pageUrl);
  const pageTitle = sanitizeInline(body.pageTitle);
  const userIp = sanitizeInline(getClientIp(request));
  const userAgent = sanitizeInline(String(request.headers.get("user-agent") ?? ""));

  if (!name || !email || !message) return null;
  if (!isValidEmail(email)) return null;

  const safeFormId = formId.slice(0, 120);

  return {
    submissionId: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    recipientEmail: getRecipientEmail(safeFormId),
    name: name.slice(0, 120),
    email: email.slice(0, 320),
    phone: phone.slice(0, 50),
    message: message.slice(0, 4000),
    formId: safeFormId,
    formName: formName.slice(0, 120),
    productName,
    pageUrl: pageUrl.slice(0, 2048),
    pageTitle: pageTitle.slice(0, 320),
    userIp: userIp.slice(0, 120),
    userAgent: userAgent.slice(0, 500),
  };
}

async function parseSubmissionRequest(request: Request): Promise<ParsedContactRequest> {
  const contentType = String(request.headers.get("content-type") ?? "").toLowerCase();
  let body: ContactSubmitBody;
  let files: File[] = [];
  let turnstileToken = "";

  if (contentType.includes("application/json")) {
    body = (await request.json()) as ContactSubmitBody;
    turnstileToken = extractTurnstileToken(body as Record<string, unknown>);
  } else {
    const formData = await request.formData();
    body = {
      recipientEmail: String(formData.get("recipientEmail") ?? ""),
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
      formId: String(formData.get("formId") ?? ""),
      formName: String(formData.get("formName") ?? ""),
      productName: String(formData.get("productName") ?? ""),
      pageUrl: String(formData.get("pageUrl") ?? ""),
      pageTitle: String(formData.get("pageTitle") ?? ""),
    };
    turnstileToken = extractTurnstileToken(formData);
    files = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File && value.size > 0);
  }

  const submissionBase = parseSubmissionBody(body, request);
  if (!submissionBase) {
    throw new Error("VALIDATION:Vennligst fyll inn gyldig navn, e-post og melding.");
  }

  const fileValidation = validateContactFiles(files, getContactUploadConfig());
  if (!fileValidation.ok) {
    throw new Error(`VALIDATION:${fileValidation.error}`);
  }

  return { submissionBase, files: fileValidation.files, turnstileToken };
}

async function uploadContactAttachments(
  files: ValidatedContactFile[],
  submissionBase: ContactSubmissionBase
): Promise<UploadedContactAttachment[]> {
  return uploadContactFilesToR2(files, {
    submissionId: submissionBase.submissionId,
    submittedAt: submissionBase.submittedAt,
  });
}

/**
 * Keep the Worker alive after the HTTP response (Cloudflare), or use Next
 * `after()` locally. Do not await email before returning success to the user.
 * Lead is already durable in D1 (and optionally R2 JSON).
 */
function scheduleContactBackgroundWork(
  submission: ContactSubmission,
  files: ValidatedContactFile[]
): void {
  const work = (async () => {
    try {
      await sendContactEmail(submission, files);
      await updateContactSubmissionEmailStatus({
        submissionId: submission.submissionId,
        status: "sent",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[contact-submit] background email failed", {
        submissionId: submission.submissionId,
        error,
      });
      await updateContactSubmissionEmailStatus({
        submissionId: submission.submissionId,
        status: "failed",
        error: message,
      });
    }
  })();

  void (async () => {
    try {
      const { ctx } = await getCloudflareContext({ async: true });
      ctx.waitUntil(work);
      return;
    } catch {
      // Local `next dev` / no Workers context — fall through to `after()`.
    }
    after(async () => {
      await work;
    });
  })();
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request) || "unknown";
  const rate = checkRateLimit(`contact-submit:${clientIp}`, {
    maxRequests: CONTACT_RATE_LIMIT_MAX,
    windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "For mange forespørsler. Prøv igjen om litt.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      }
    );
  }

  let parsedRequest: ParsedContactRequest;
  try {
    parsedRequest = await parseSubmissionRequest(request);
  } catch (error) {
    const message =
      error instanceof Error && error.message.startsWith("VALIDATION:")
        ? error.message.slice("VALIDATION:".length)
        : "Ugyldig forespørsel. Kunne ikke lese melding.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const turnstile = await verifyTurnstileToken({
    token: parsedRequest.turnstileToken,
    remoteip: clientIp,
  });
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, error: turnstile.error },
      { status: 403 }
    );
  }

  let attachments: UploadedContactAttachment[] = [];
  try {
    attachments = await uploadContactAttachments(parsedRequest.files, parsedRequest.submissionBase);
  } catch (error) {
    console.error("[contact-submit] r2 upload failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Kunne ikke laste opp vedlegg. Prøv igjen om litt.",
      },
      { status: 502 }
    );
  }

  const submission: ContactSubmission = {
    ...parsedRequest.submissionBase,
    attachments,
  };

  // Durable accept in D1 (canonical), optional R2 JSON backup, then return ok.
  // Email runs via waitUntil / after() so the UI is not blocked ~5s.
  // Local without D1: fall back to sync email (no Elementor/WP).
  try {
    await insertContactSubmissionToD1(submission);
  } catch (persistError) {
    console.warn(
      "[contact-submit] D1 insert failed; falling back to sync email",
      persistError
    );
    try {
      await sendContactEmail(submission, parsedRequest.files);
    } catch (error) {
      console.error("[contact-submit] email failed", error);
      return NextResponse.json(
        {
          ok: false,
          error: "Kunne ikke sende e-post akkurat nå. Prøv igjen om litt.",
        },
        { status: 502 }
      );
    }
    try {
      await persistContactSubmissionToR2(submission);
    } catch (r2Error) {
      console.warn("[contact-submit] r2 submission backup failed after sync email", r2Error);
    }
    return NextResponse.json({ ok: true, submissionId: submission.submissionId });
  }

  try {
    await persistContactSubmissionToR2(submission);
  } catch (r2Error) {
    // D1 is the source of truth; R2 JSON is best-effort backup.
    console.warn("[contact-submit] r2 submission backup failed", r2Error);
  }

  scheduleContactBackgroundWork(submission, parsedRequest.files);

  return NextResponse.json({ ok: true, submissionId: submission.submissionId });
}
