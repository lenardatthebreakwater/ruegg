import { NextRequest, NextResponse } from "next/server";
import { getMinPeisList } from "@/lib/account/min-peis";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.json(
      { ok: false, error: "Du må logge inn for å se Min peis." },
      { status: 401 }
    );
  }

  try {
    const payload = await getMinPeisList(session.token);
    return NextResponse.json({ ok: true, ...payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Økten er ugyldig. Logg inn på nytt." },
        { status: 401 }
      );
    }
    console.error("Failed to load Min peis list", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke hente Min peis akkurat nå." },
      { status: 502 }
    );
  }
}
