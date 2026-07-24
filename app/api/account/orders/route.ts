import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrders } from "@/lib/account/server-account";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.json(
      { ok: false, error: "Du må logge inn for å se ordrene dine." },
      { status: 401 }
    );
  }

  try {
    const orders = await getCustomerOrders(session.token);
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Økten er ugyldig. Logg inn på nytt." },
        { status: 401 }
      );
    }
    console.error("Failed to load customer orders", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke hente ordrer akkurat nå." },
      { status: 502 }
    );
  }
}
