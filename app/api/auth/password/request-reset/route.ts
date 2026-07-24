import { NextResponse } from "next/server";
import { requestWordpressPasswordReset } from "@/lib/auth/wordpress-auth-client";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";
import {
  extractTurnstileToken,
  verifyTurnstileToken,
} from "@/lib/security/verify-turnstile";

type RequestResetBody = {
  email?: string;
  turnstileToken?: string;
  "cf-turnstile-response"?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEUTRAL_MESSAGE = "Hvis e-posten finnes, sender vi deg en tilbakestillingslenke.";
const AUTH_RATE_LIMIT_MAX = 5;
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const clientIp = getClientIp(request) || "unknown";
  const rate = checkRateLimit(`auth-password-request:${clientIp}`, {
    maxRequests: AUTH_RATE_LIMIT_MAX,
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "For mange forespørsler. Prøv igjen om litt." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      }
    );
  }

  let body: RequestResetBody;
  try {
    body = (await request.json()) as RequestResetBody;
  } catch {
    return NextResponse.json({ ok: true, message: NEUTRAL_MESSAGE });
  }

  const turnstile = await verifyTurnstileToken({
    token: extractTurnstileToken(body as Record<string, unknown>),
    remoteip: clientIp,
  });
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, error: turnstile.error },
      { status: 403 }
    );
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ ok: true, message: NEUTRAL_MESSAGE });
  }

  await requestWordpressPasswordReset({ email });
  return NextResponse.json({ ok: true, message: NEUTRAL_MESSAGE });
}
