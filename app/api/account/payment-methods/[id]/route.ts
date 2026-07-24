import { NextRequest, NextResponse } from "next/server";
import { deleteWordpressPaymentMethod } from "@/lib/account/wordpress-account-client";
import { getSessionFromCookies } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.json(
      { ok: false, error: "Du må logge inn for å slette betalingsmetoden." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const methodId = Number.parseInt(id, 10);
  if (!Number.isFinite(methodId) || methodId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Ugyldig betalingsmetode." },
      { status: 400 }
    );
  }

  try {
    await deleteWordpressPaymentMethod(session.token, methodId);
    return NextResponse.json({
      ok: true,
      message: "Betalingsmetoden er slettet.",
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
        { ok: false, error: "Fant ikke betalingsmetoden." },
        { status: 404 }
      );
    }
    console.error("Failed to delete payment method", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke slette betalingsmetoden akkurat nå." },
      { status: 502 }
    );
  }
}
