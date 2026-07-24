import { NextResponse } from "next/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { resetWordpressPassword } from "@/lib/auth/wordpress-auth-client";

type ResetBody = {
  login?: string;
  key?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  let body: ResetBody;
  try {
    body = (await request.json()) as ResetBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ugyldig forespørsel." },
      { status: 400 }
    );
  }

  const login = String(body.login ?? "").trim();
  const key = String(body.key ?? "").trim();
  const newPassword = String(body.newPassword ?? "");

  if (!login || !key || newPassword.length < 8) {
    return NextResponse.json(
      {
        ok: false,
        error: "Fyll inn alle felter. Passordet må være minst 8 tegn.",
      },
      { status: 400 }
    );
  }

  const result = await resetWordpressPassword({ login, key, newPassword });
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: getAuthErrorMessage(result.errorCode, result.message),
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message ?? "Passordet er oppdatert.",
  });
}

