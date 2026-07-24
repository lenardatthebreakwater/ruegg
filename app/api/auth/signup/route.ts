import { NextResponse } from "next/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { buildSessionPayload, setSessionCookie } from "@/lib/auth/session";
import { signupWithWordpress } from "@/lib/auth/wordpress-auth-client";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";
import {
  extractTurnstileToken,
  verifyTurnstileToken,
} from "@/lib/security/verify-turnstile";

type SignupRequestBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  turnstileToken?: string;
  "cf-turnstile-response"?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_RATE_LIMIT_MAX = 10;
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function sanitizeName(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, 120);
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request) || "unknown";
  const rate = checkRateLimit(`auth-signup:${clientIp}`, {
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

  let body: SignupRequestBody;
  try {
    body = (await request.json()) as SignupRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ugyldig forespørsel." },
      { status: 400 }
    );
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const firstName = sanitizeName(body.firstName);
  const lastName = sanitizeName(body.lastName);

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Vennligst skriv inn en gyldig e-postadresse." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Passordet må være minst 8 tegn." },
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

  const result = await signupWithWordpress({
    email,
    password,
    firstName,
    lastName,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: getAuthErrorMessage(result.errorCode, result.message),
      },
      { status: 400 }
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
