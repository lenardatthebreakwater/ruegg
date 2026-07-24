import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookies } from "@/lib/auth/session";
import { getWordpressCurrentUser } from "@/lib/auth/wordpress-auth-client";

export async function GET(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  if (!session) {
    return NextResponse.json({ ok: true, authenticated: false, user: null });
  }

  const result = await getWordpressCurrentUser(session.token);
  if (!result.ok || !result.user) {
    const response = NextResponse.json({ ok: true, authenticated: false, user: null });
    clearSessionCookie(response.cookies);
    return response;
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: result.user,
  });
}

