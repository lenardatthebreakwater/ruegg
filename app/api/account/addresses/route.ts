import { NextRequest, NextResponse } from "next/server";
import {
  fetchWordpressAddresses,
  updateWordpressAddresses,
} from "@/lib/account/wordpress-account-client";
import type { AccountCustomerAddress } from "@/lib/account/types";
import { getSessionFromCookies } from "@/lib/auth/session";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Du må logge inn for å se adressene dine." },
    { status: 401 }
  );
}

export async function GET(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) return unauthorized();

  try {
    const addresses = await fetchWordpressAddresses(session.token);
    return NextResponse.json({ ok: true, ...addresses });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") return unauthorized();
    console.error("Failed to load customer addresses", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke hente adressene akkurat nå." },
      { status: 502 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) return unauthorized();

  let body: {
    billing?: Partial<AccountCustomerAddress>;
    shipping?: Partial<AccountCustomerAddress>;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ugyldig forespørsel." },
      { status: 400 }
    );
  }

  if (!body?.billing && !body?.shipping) {
    return NextResponse.json(
      { ok: false, error: "Mangler faktura- eller leveringsadresse." },
      { status: 400 }
    );
  }

  try {
    const addresses = await updateWordpressAddresses(session.token, body);
    return NextResponse.json({
      ok: true,
      ...addresses,
      message: "Adressene er oppdatert.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message && message !== "WORDPRESS_UNAVAILABLE" && message !== "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }
    console.error("Failed to update customer addresses", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke lagre adressene akkurat nå." },
      { status: 502 }
    );
  }
}
