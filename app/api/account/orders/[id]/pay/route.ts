import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrderById } from "@/lib/account/server-account";
import { getSessionFromCookies } from "@/lib/auth/session";
import { createWordpressSsoLoginUrl } from "@/lib/auth/wordpress-auth-client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * "Betal ordre" handoff. Mints a one-time WordPress SSO code and redirects
 * the browser through /pb/v1/auth/sso, which sets the WP login cookie and
 * forwards to the order-pay page — no login form in between.
 * Falls back to the plain order-pay URL if SSO is unavailable.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const backToOrders = new URL("/min-konto/ordrer/", request.url);

  const session = getSessionFromCookies(request.cookies);
  if (!session?.token) {
    return NextResponse.redirect(new URL("/min-konto/", request.url));
  }

  const { id } = await context.params;
  const orderId = Number.parseInt(id, 10);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.redirect(backToOrders);
  }

  try {
    const order = await getCustomerOrderById(session.token, orderId);
    if (!order?.payUrl) {
      return NextResponse.redirect(backToOrders);
    }

    const payUrl = new URL(order.payUrl);
    const redirectPath = `${payUrl.pathname}${payUrl.search}`;

    const sso = await createWordpressSsoLoginUrl(session.token, redirectPath);
    if (sso.ok && sso.loginUrl) {
      return NextResponse.redirect(sso.loginUrl);
    }

    // SSO endpoint missing/old snippet — plain link still lets the user log in manually.
    return NextResponse.redirect(order.payUrl);
  } catch (error) {
    console.error("Failed to start order-pay SSO handoff", error);
    return NextResponse.redirect(backToOrders);
  }
}
