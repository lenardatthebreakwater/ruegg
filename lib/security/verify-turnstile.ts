/**
 * Server-side Cloudflare Turnstile siteverify.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Intentionally skipped (reliability over strictness):
 * - Hostname allowlist — peisbutikken.no / www / preview hosts would false-reject.
 * - `action` checks — contact + login/signup/password-reset share this helper;
 *   wiring per-form actions + expectedAction on every route risks mismatch without
 *   a clear reliability win. Revisit only if abuse needs action segmentation.
 */

export const TURNSTILE_TOKEN_FIELD = "cf-turnstile-response";
export const TURNSTILE_TOKEN_JSON_FIELD = "turnstileToken";

/** Cloudflare documents tokens as max 2048 chars; reject absurd payloads early. */
const MAX_TOKEN_LENGTH = 2048;

/** Fail closed if siteverify hangs. */
const SITEVERIFY_TIMEOUT_MS = 8_000;

export const TURNSTILE_MISSING_MESSAGE = "Bekreft at du ikke er en robot.";
export const TURNSTILE_FAILED_MESSAGE = "Sikkerhetskontroll feilet. Prøv igjen.";
export const TURNSTILE_LOAD_FAILED_MESSAGE =
  "Sikkerhetskontrollen kunne ikke lastes. Sjekk nettverket eller deaktiver annonseblokker, og prøv igjen.";
export const TURNSTILE_EXPIRED_HINT =
  "Sikkerhetskontrollen utløp. Bekreft på nytt.";
export const TURNSTILE_TIMEOUT_HINT =
  "Sikkerhetskontrollen tok for lang tid. Prøv igjen.";
export const TURNSTILE_TRANSIENT_ERROR_HINT =
  "Sikkerhetskontrollen feilet midlertidig. Prøver på nytt…";

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
  hostname?: string;
  action?: string;
};

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

function getTurnstileSecret(): string | null {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  return secret && secret.length > 0 ? secret : null;
}

/** True when the public sitekey is configured (widget should render). */
export function isTurnstileConfiguredClient(): boolean {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return Boolean(siteKey);
}

export function getTurnstileSiteKey(): string | null {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return siteKey && siteKey.length > 0 ? siteKey : null;
}

/**
 * Verifies a Turnstile token with Cloudflare.
 * Fail-closed in production when the secret is missing.
 * In development, missing secret also rejects (use Cloudflare dummy keys in .env.local).
 */
export async function verifyTurnstileToken(options: {
  token: string | null | undefined;
  remoteip?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = String(options.token ?? "").trim();
  if (!token) {
    return { ok: false, error: TURNSTILE_MISSING_MESSAGE };
  }

  if (token.length > MAX_TOKEN_LENGTH) {
    console.warn("[turnstile] token rejected: exceeds max length", token.length);
    return { ok: false, error: TURNSTILE_FAILED_MESSAGE };
  }

  const secret = getTurnstileSecret();
  if (!secret) {
    if (isProductionRuntime()) {
      console.error("[turnstile] TURNSTILE_SECRET_KEY is not set in production");
    } else {
      console.warn(
        "[turnstile] TURNSTILE_SECRET_KEY is not set — add Cloudflare dummy keys to .env.local"
      );
    }
    return { ok: false, error: TURNSTILE_FAILED_MESSAGE };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  const remoteip = String(options.remoteip ?? "").trim();
  if (remoteip && remoteip !== "unknown") {
    body.set("remoteip", remoteip);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      console.error("[turnstile] siteverify HTTP", response.status);
      return { ok: false, error: TURNSTILE_FAILED_MESSAGE };
    }

    const json = (await response.json()) as SiteverifyResponse;
    if (!json.success) {
      console.warn("[turnstile] siteverify failed", json["error-codes"] ?? []);
      return { ok: false, error: TURNSTILE_FAILED_MESSAGE };
    }

    return { ok: true };
  } catch (error) {
    const name =
      error instanceof Error
        ? error.name
        : typeof error === "object" &&
            error !== null &&
            "name" in error &&
            typeof (error as { name: unknown }).name === "string"
          ? (error as { name: string }).name
          : "unknown";
    if (name === "TimeoutError" || name === "AbortError") {
      console.error(
        `[turnstile] siteverify timed out after ${SITEVERIFY_TIMEOUT_MS}ms`
      );
    } else {
      console.error("[turnstile] siteverify request failed", error);
    }
    return { ok: false, error: TURNSTILE_FAILED_MESSAGE };
  }
}

/** Reads token from FormData (contact) or a plain object (JSON auth). */
export function extractTurnstileToken(
  source: FormData | Record<string, unknown>
): string {
  if (source instanceof FormData) {
    return String(
      source.get(TURNSTILE_TOKEN_FIELD) ??
        source.get(TURNSTILE_TOKEN_JSON_FIELD) ??
        ""
    ).trim();
  }

  return String(
    source[TURNSTILE_TOKEN_JSON_FIELD] ?? source[TURNSTILE_TOKEN_FIELD] ?? ""
  ).trim();
}
