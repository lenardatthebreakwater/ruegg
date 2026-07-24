import { NextRequest, NextResponse } from "next/server";
import { getMinPeisDetail } from "@/lib/account/min-peis";
import { getSessionFromCookies } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.json(
      { ok: false, error: "Du må logge inn for å se Min peis." },
      { status: 401 }
    );
  }

  const { slug } = await context.params;

  try {
    const payload = await getMinPeisDetail(session.token, slug);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "Fant ikke denne peisen på kontoen din." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, ...payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Økten er ugyldig. Logg inn på nytt." },
        { status: 401 }
      );
    }
    console.error("Failed to load Min peis detail", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke hente peisen akkurat nå." },
      { status: 502 }
    );
  }
}
