import { NextResponse } from "next/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { buildSessionPayload, setSessionCookie } from "@/lib/auth/session";
import { loginWithWordpress } from "@/lib/auth/wordpress-auth-client";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";
import {
  extractTurnstileToken,
  verifyTurnstileToken,
} from "@/lib/security/verify-turnstile";

type LoginRequestBody = {
  email?: string;
  password?: string;
  turnstileToken?: string;
  "cf-turnstile-response"?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_RATE_LIMIT_MAX = 15;
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const clientIp = getClientIp(request) || "unknown";
  const rate = checkRateLimit(`auth-login:${clientIp}`, {
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

  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ugyldig forespørsel." },
      { status: 400 }
    );
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!EMAIL_REGEX.test(email) || !password) {
    return NextResponse.json(
      { ok: false, error: "Vennligst skriv inn gyldig e-post og passord." },
      { status: 400 }
    );
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

  const result = await loginWithWordpress({ email, password });
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: getAuthErrorMessage(result.errorCode, result.message),
      },
      { status: 401 }
    );
  }
  if (!result.token || !result.user) {
    return NextResponse.json(
      {
        ok: false,
        error: "Uventet svar fra kontosystemet.",
      },
      { status: 502 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    user: result.user,
  });
  setSessionCookie(
    response.cookies,
    buildSessionPayload(result.token, result.user, result.expiresIn)
  );
  return response;
}
