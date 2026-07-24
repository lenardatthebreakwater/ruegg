-- Contact form leads (canonical store). Attachments live in R2.
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY NOT NULL,
  submitted_at TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  form_id TEXT NOT NULL,
  form_name TEXT NOT NULL,
  product_name TEXT NOT NULL DEFAULT '',
  page_url TEXT NOT NULL DEFAULT '',
  page_title TEXT NOT NULL DEFAULT '',
  user_ip TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  attachments_json TEXT NOT NULL DEFAULT '[]',
  email_status TEXT NOT NULL DEFAULT 'pending',
  email_error TEXT,
  email_sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at
  ON contact_submissions (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email_status
  ON contact_submissions (email_status);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_form_id
  ON contact_submissions (form_id);
