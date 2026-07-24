import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { UploadedContactAttachment } from "@/lib/contact-file-utils";

export type ContactEmailStatus = "pending" | "sent" | "failed";

export type ContactSubmissionRecord = {
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

async function getContactSubmissionsDb(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.CONTACT_SUBMISSIONS_DB ?? null;
  } catch {
    return null;
  }
}

/** True when the Worker binding is available (production OpenNext). */
export async function isContactSubmissionsDbAvailable(): Promise<boolean> {
  return Boolean(await getContactSubmissionsDb());
}

export async function insertContactSubmissionToD1(
  submission: ContactSubmissionRecord
): Promise<void> {
  const db = await getContactSubmissionsDb();
  if (!db) {
    throw new Error("CONTACT_SUBMISSIONS_DB binding is not available.");
  }

  await db
    .prepare(
      `INSERT INTO contact_submissions (
        id, submitted_at, recipient_email, name, email, phone, message,
        form_id, form_name, product_name, page_url, page_title,
        user_ip, user_agent, attachments_json, email_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
    .bind(
      submission.submissionId,
      submission.submittedAt,
      submission.recipientEmail,
      submission.name,
      submission.email,
      submission.phone,
      submission.message,
      submission.formId,
      submission.formName,
      submission.productName,
      submission.pageUrl,
      submission.pageTitle,
      submission.userIp,
      submission.userAgent,
      JSON.stringify(submission.attachments)
    )
    .run();
}

export async function updateContactSubmissionEmailStatus(params: {
  submissionId: string;
  status: Exclude<ContactEmailStatus, "pending">;
  error?: string | null;
}): Promise<void> {
  const db = await getContactSubmissionsDb();
  if (!db) return;

  const sentAt = params.status === "sent" ? new Date().toISOString() : null;
  const errorText =
    params.status === "failed"
      ? String(params.error ?? "unknown").slice(0, 2000)
      : null;

  await db
    .prepare(
      `UPDATE contact_submissions
       SET email_status = ?, email_error = ?, email_sent_at = ?
       WHERE id = ?`
    )
    .bind(params.status, errorText, sentAt, params.submissionId)
    .run();
}
