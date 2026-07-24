import { NextRequest, NextResponse } from "next/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import {
  clearSessionCookie,
  getSessionFromCookies,
} from "@/lib/auth/session";
import { changeWordpressPassword } from "@/lib/auth/wordpress-auth-client";

type PasswordChangeBody = {
  currentPassword?: string;
  newPassword?: string;
};

export async function POST(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.json(
      { ok: false, error: "Du må logge inn for å endre passord." },
      { status: 401 }
    );
  }

  let body: PasswordChangeBody;
  try {
    body = (await request.json()) as PasswordChangeBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ugyldig forespørsel." },
      { status: 400 }
    );
  }

  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { ok: false, error: "Nåværende og nytt passord er påkrevd." },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Passordet må være minst 8 tegn." },
      { status: 400 }
    );
  }

  const result = await changeWordpressPassword(session.token, {
    currentPassword,
    newPassword,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: getAuthErrorMessage(result.errorCode, result.message),
      },
      { status: result.errorCode === "UNAUTHORIZED" ? 401 : 400 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    message: result.message ?? "Passordet er oppdatert. Logg inn på nytt.",
    requiresReauth: true,
  });
  // WP invalidates the PB token; clear the Next session cookie too.
  clearSessionCookie(response.cookies);
  return response;
}
