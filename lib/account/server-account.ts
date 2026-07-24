import "server-only";

import { getOrderStatusLabel, normalizeOrderStatus } from "@/lib/account/order-status";
import type { AccountOrderDetail, AccountOrderSummary } from "@/lib/account/types";
import {
  fetchWordpressCustomerOrderById,
  fetchWordpressCustomerOrders,
  hideWordpressCustomerOrder,
  mapWordpressAddress,
  mapWordpressCustomerNotes,
  mapWordpressLineItems,
  type WordpressOrderDetailRaw,
  type WordpressOrderSummaryRaw,
} from "@/lib/account/wordpress-orders-client";
import { getWordpressSiteUrl } from "@/lib/wordpress-urls";

const DEFAULT_ORDERS_FIRST = 30;

function buildPayUrl(
  orderId: number,
  orderKey: string | null | undefined,
  needsPayment: boolean
): string | null {
  if (!needsPayment || !orderKey?.trim()) return null;
  const base = getWordpressSiteUrl();
  if (!base) return null;
  const url = new URL(`${base}/checkout/order-pay/${orderId}/`);
  url.searchParams.set("pay_for_order", "true");
  url.searchParams.set("key", orderKey.trim());
  return url.toString();
}

function mapOrderSummary(raw: WordpressOrderSummaryRaw): AccountOrderSummary | null {
  const id = raw.id;
  if (typeof id !== "number" || !Number.isFinite(id) || id <= 0) return null;

  const status = normalizeOrderStatus(raw.status);
  const needsPayment = raw.needsPayment === true;
  const orderKey = raw.orderKey?.trim() || null;

  return {
    id,
    orderNumber: raw.orderNumber?.trim() || String(id),
    date: raw.date ?? null,
    status,
    statusLabel: getOrderStatusLabel(status),
    total: raw.total ?? null,
    needsPayment,
    paymentMethodTitle: raw.paymentMethodTitle ?? null,
    payUrl: buildPayUrl(id, orderKey, needsPayment),
  };
}

function mapOrderDetail(raw: WordpressOrderDetailRaw): AccountOrderDetail | null {
  const summary = mapOrderSummary(raw);
  if (!summary) return null;
  return {
    ...summary,
    lineItems: mapWordpressLineItems(raw.lineItems),
    billing: mapWordpressAddress(raw.billing),
    shipping: mapWordpressAddress(raw.shipping),
    datePaid: raw.datePaid ?? null,
    dateCompleted: raw.dateCompleted ?? null,
    customerNotes: mapWordpressCustomerNotes(raw.customerNotes),
  };
}

/**
 * Fetch the authenticated customer's orders via PB Auth REST
 * (thin wc_get_orders path — not WooGraphQL).
 */
export async function getCustomerOrders(
  token: string,
  first = DEFAULT_ORDERS_FIRST
): Promise<AccountOrderSummary[]> {
  const rows = await fetchWordpressCustomerOrders(token, first);
  return rows
    .map(mapOrderSummary)
    .filter((order): order is AccountOrderSummary => order != null);
}

const MAX_COMPLETED_ORDER_DETAIL_FALLBACK = 10;

/**
 * Completed orders with line items in one list call when WordPress supports
 * `?status=completed&includeLineItems=1`. Falls back to capped parallel detail fetches.
 */
export async function getCompletedOrdersWithLineItems(
  token: string,
  first = DEFAULT_ORDERS_FIRST
): Promise<AccountOrderDetail[]> {
  const rows = await fetchWordpressCustomerOrders(token, {
    limit: first,
    status: "completed",
    includeLineItems: true,
  });

  const listIncludesLineItems = rows.some((row) => Array.isArray(row.lineItems));

  if (listIncludesLineItems || rows.length === 0) {
    return rows
      .map((raw) => {
        const detail = mapOrderDetail({
          ...raw,
          lineItems: raw.lineItems ?? [],
          billing: null,
          shipping: null,
        });
        if (!detail || detail.status !== "completed") return null;
        return detail;
      })
      .filter((order): order is AccountOrderDetail => order != null);
  }

  const capped = rows.slice(0, MAX_COMPLETED_ORDER_DETAIL_FALLBACK);
  const details = await Promise.all(
    capped.map(async (row) => {
      const id = row.id;
      if (typeof id !== "number" || !Number.isFinite(id) || id <= 0) {
        return null;
      }
      return getCustomerOrderById(token, id);
    })
  );

  return details.filter(
    (order): order is AccountOrderDetail =>
      order != null && order.status === "completed"
  );
}

/**
 * Fetch a single order belonging to the authenticated customer.
 * Ownership is enforced on WordPress (customer_id must match token user).
 */
export async function getCustomerOrderById(
  token: string,
  orderId: number
): Promise<AccountOrderDetail | null> {
  if (!Number.isFinite(orderId) || orderId <= 0) return null;
  const raw = await fetchWordpressCustomerOrderById(token, orderId);
  if (!raw) return null;
  return mapOrderDetail(raw);
}

/**
 * Hide an order from the customer account overview (meta flag on WordPress).
 * Does not delete the WooCommerce order.
 */
export async function hideCustomerOrder(
  token: string,
  orderId: number
): Promise<{ message: string }> {
  if (!Number.isFinite(orderId) || orderId <= 0) {
    throw new Error("Ugyldig ordre-ID.");
  }
  return hideWordpressCustomerOrder(token, orderId);
}
