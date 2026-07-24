import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrderById } from "@/lib/account/server-account";
import { getSessionFromCookies } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.json(
      { ok: false, error: "Du må logge inn for å se ordren." },
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
    const order = await getCustomerOrderById(session.token, orderId);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Fant ikke ordren." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Økten er ugyldig. Logg inn på nytt." },
        { status: 401 }
      );
    }
    console.error("Failed to load customer order", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke hente ordren akkurat nå." },
      { status: 502 }
    );
  }
}
