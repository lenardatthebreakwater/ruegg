import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { createWordpressSsoLoginUrl } from "@/lib/auth/wordpress-auth-client";
import {
  buildCartSyncRedirectUrl,
  getWordpressCartSyncUrl,
  getWordpressCheckoutUrl,
} from "@/lib/wordpress-urls";

type CheckoutLine = {
  productId?: number;
  quantity?: number;
};

type CheckoutBody = {
  items?: CheckoutLine[];
};

/**
 * Checkout handoff: build cart-sync URL, and if the customer has a Next session,
 * mint a WordPress SSO login that lands on cart-sync (same pattern as order-pay).
 */
export async function POST(request: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ugyldig forespørsel." },
      { status: 400 }
    );
  }

  const cartSyncUrl = getWordpressCartSyncUrl();
  const checkoutUrl = getWordpressCheckoutUrl();
  if (!cartSyncUrl || !checkoutUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "Kassen er ikke tilgjengelig akkurat nå. Prøv igjen om litt.",
      },
      { status: 503 }
    );
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const normalizedItems = rawItems
    .map((item) => {
      const productId =
        typeof item.productId === "number" && Number.isFinite(item.productId)
          ? Math.trunc(item.productId)
          : null;
      if (!productId || productId <= 0) return null;
      return {
        productId,
        quantity: Math.max(1, Math.trunc(Number(item.quantity) || 1)),
      };
    })
    .filter((item): item is { productId: number; quantity: number } => item !== null);

  if (normalizedItems.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Handlekurven mangler gyldige produkter. Oppdater siden og prøv igjen.",
      },
      { status: 400 }
    );
  }

  if (normalizedItems.length !== rawItems.length) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Noen produkter i handlekurven kunne ikke synkroniseres. Fjern dem eller åpne produktsiden og legg dem til på nytt.",
      },
      { status: 400 }
    );
  }

  const redirectUrl = buildCartSyncRedirectUrl(cartSyncUrl, normalizedItems);
  const session = getSessionFromCookies(request.cookies);

  if (session?.token) {
    try {
      const target = new URL(redirectUrl);
      const redirectPath = `${target.pathname}${target.search}`;
      const sso = await createWordpressSsoLoginUrl(session.token, redirectPath);
      if (sso.ok && sso.loginUrl) {
        return NextResponse.json({ ok: true, redirectUrl: sso.loginUrl });
      }
    } catch (error) {
      console.error("Checkout SSO handoff failed; falling back to guest cart-sync", error);
    }
  }

  return NextResponse.json({ ok: true, redirectUrl });
}
