import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookies } from "@/lib/auth/session";
import { logoutFromWordpress } from "@/lib/auth/wordpress-auth-client";

export async function POST(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  if (session?.token) {
    await logoutFromWordpress(session.token);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response.cookies);
  return response;
}

