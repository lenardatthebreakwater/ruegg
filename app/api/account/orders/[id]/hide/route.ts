import { NextRequest, NextResponse } from "next/server";
import { hideCustomerOrder } from "@/lib/account/server-account";
import { getSessionFromCookies } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.json(
      { ok: false, error: "Du må logge inn for å skjule ordren." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const orderId = Number.parseInt(id, 10);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Ugyldig ordre-ID." },
      { status: 400 }
    );
  }

  try {
    const result = await hideCustomerOrder(session.token, orderId);
    return NextResponse.json({
      ok: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Økten er ugyldig. Logg inn på nytt." },
        { status: 401 }
      );
    }
    if (message === "NOT_FOUND") {
      return NextResponse.json(
        { ok: false, error: "Fant ikke ordren." },
        { status: 404 }
      );
    }
    if (message === "WORDPRESS_UNAVAILABLE") {
      console.error("Failed to hide customer order", error);
      return NextResponse.json(
        { ok: false, error: "Kunne ikke skjule ordren akkurat nå." },
        { status: 502 }
      );
    }
    if (message) {
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }
    console.error("Failed to hide customer order", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke skjule ordren akkurat nå." },
      { status: 502 }
    );
  }
}
