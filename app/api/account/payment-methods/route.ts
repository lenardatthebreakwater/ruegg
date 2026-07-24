import { NextRequest, NextResponse } from "next/server";
import { fetchWordpressPaymentMethods } from "@/lib/account/wordpress-account-client";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.json(
      { ok: false, error: "Du må logge inn for å se betalingsmetodene dine." },
      { status: 401 }
    );
  }

  try {
    const paymentMethods = await fetchWordpressPaymentMethods(session.token);
    return NextResponse.json({ ok: true, paymentMethods });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Økten er ugyldig. Logg inn på nytt." },
        { status: 401 }
      );
    }
    console.error("Failed to load payment methods", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke hente betalingsmetoder akkurat nå." },
      { status: 502 }
    );
  }
}
