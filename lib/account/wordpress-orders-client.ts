import "server-only";

import { setDefaultResultOrder } from "node:dns";
import type {
  AccountOrderAddress,
  AccountOrderDetail,
  AccountOrderLineItem,
  AccountOrderSummary,
} from "@/lib/account/types";
import {
  getWordpressAuthOrderByIdUrl,
  getWordpressAuthOrderHideUrl,
  getWordpressAuthOrdersUrl,
} from "@/lib/wordpress-urls";

const REQUEST_TIMEOUT_MS = 15_000;

try {
  setDefaultResultOrder("ipv4first");
} catch {
  // Ignore; environment may not support overriding DNS result order.
}

type WordpressOrderLineItemRaw = {
  name?: string;
  slug?: string | null;
  quantity?: number;
  total?: string | null;
  image?: {
    sourceUrl?: string | null;
    altText?: string | null;
  } | null;
};

type WordpressOrdersListResponse = {
  ok: boolean;
  orders?: Array<{
    id?: number;
    orderNumber?: string;
    date?: string | null;
    status?: string;
    total?: string | null;
    orderKey?: string | null;
    needsPayment?: boolean;
    paymentMethodTitle?: string | null;
    lineItems?: WordpressOrderLineItemRaw[];
  }>;
  errorCode?: string;
  message?: string;
};

type WordpressOrderCustomerNoteRaw = {
  id?: number;
  type?: string;
  date?: string | null;
  content?: string;
};

type WordpressOrderDetailResponse = {
  ok: boolean;
  order?: {
    id?: number;
    orderNumber?: string;
    date?: string | null;
    status?: string;
    total?: string | null;
    orderKey?: string | null;
    needsPayment?: boolean;
    paymentMethodTitle?: string | null;
    lineItems?: WordpressOrderLineItemRaw[];
    billing?: AccountOrderAddress | null;
    shipping?: AccountOrderAddress | null;
    datePaid?: string | null;
    dateCompleted?: string | null;
    customerNotes?: WordpressOrderCustomerNoteRaw[];
  };
  errorCode?: string;
  message?: string;
};

function getSharedSecret(): string {
  return String(process.env.WORDPRESS_AUTH_SHARED_SECRET ?? "").trim();
}

async function callWordpressOrders<T extends { ok: boolean; errorCode?: string; message?: string }>(
  url: string | null,
  token: string,
  options: { method?: "GET" | "POST" } = {}
): Promise<T> {
  if (!url) {
    throw new Error("WORDPRESS_UNAVAILABLE");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const secret = getSharedSecret();
  if (secret) headers["X-PB-Auth-Secret"] = secret;
  headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    const json = (await response.json().catch(() => null)) as T | null;
    if (!json || typeof json.ok !== "boolean") {
      throw new Error("WORDPRESS_UNAVAILABLE");
    }

    if (!json.ok) {
      if (json.errorCode === "UNAUTHORIZED" || response.status === 401 || response.status === 403) {
        throw new Error("UNAUTHORIZED");
      }
      if (json.errorCode === "NOT_FOUND" || response.status === 404) {
        throw new Error("NOT_FOUND");
      }
      if (json.errorCode === "INVALID_INPUT" || response.status === 400) {
        throw new Error(json.message?.trim() || "Ugyldig forespørsel.");
      }
      throw new Error(json.message?.trim() || "WORDPRESS_UNAVAILABLE");
    }

    return json;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "UNAUTHORIZED" ||
        error.message === "NOT_FOUND" ||
        error.message === "WORDPRESS_UNAVAILABLE"
      ) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("WORDPRESS_UNAVAILABLE");
      }
      if (error.name === "AbortError") {
        throw new Error("WORDPRESS_UNAVAILABLE");
      }
      // Preserve INVALID_INPUT / validation messages from WordPress.
      if (error.message && error.message !== "fetch failed") {
        throw error;
      }
    }
    throw new Error("WORDPRESS_UNAVAILABLE");
  } finally {
    clearTimeout(timeoutId);
  }
}

export type WordpressOrderSummaryRaw = NonNullable<
  WordpressOrdersListResponse["orders"]
>[number];

export type WordpressOrderDetailRaw = NonNullable<
  WordpressOrderDetailResponse["order"]
>;

export type FetchCustomerOrdersOptions = {
  limit?: number;
  /** Woo status slug, e.g. `completed`. */
  status?: string;
  /** When true, list rows include line items (requires WP snippet support). */
  includeLineItems?: boolean;
};

function buildOrdersListUrl(options: FetchCustomerOrdersOptions): string | null {
  const base = getWordpressAuthOrdersUrl();
  if (!base) return null;

  const params = new URLSearchParams();
  const limit = options.limit ?? 30;
  params.set("limit", String(limit));
  if (options.status?.trim()) {
    params.set("status", options.status.trim());
  }
  if (options.includeLineItems) {
    params.set("includeLineItems", "1");
  }

  const query = params.toString();
  return `${base}${base.includes("?") ? "&" : "?"}${query}`;
}

export async function fetchWordpressCustomerOrders(
  token: string,
  limitOrOptions: number | FetchCustomerOrdersOptions = 30
): Promise<WordpressOrderSummaryRaw[]> {
  const options: FetchCustomerOrdersOptions =
    typeof limitOrOptions === "number"
      ? { limit: limitOrOptions }
      : limitOrOptions;
  const url = buildOrdersListUrl(options);
  const data = await callWordpressOrders<WordpressOrdersListResponse>(url, token);
  return data.orders ?? [];
}

export async function fetchWordpressCustomerOrderById(
  token: string,
  orderId: number
): Promise<WordpressOrderDetailRaw | null> {
  const url = getWordpressAuthOrderByIdUrl(orderId);
  try {
    const data = await callWordpressOrders<WordpressOrderDetailResponse>(url, token);
    return data.order ?? null;
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return null;
    }
    throw error;
  }
}

type WordpressOrderHideResponse = {
  ok: boolean;
  message?: string;
  orderId?: number;
  errorCode?: string;
};

/**
 * Hide an owned order from the customer account (WordPress meta flag).
 * Does not delete the WooCommerce order.
 */
export async function hideWordpressCustomerOrder(
  token: string,
  orderId: number
): Promise<{ message: string }> {
  if (!Number.isFinite(orderId) || orderId <= 0) {
    throw new Error("Ugyldig ordre-ID.");
  }

  const data = await callWordpressOrders<WordpressOrderHideResponse>(
    getWordpressAuthOrderHideUrl(orderId),
    token,
    { method: "POST" }
  );

  return {
    message: data.message?.trim() || "Ordren er skjult fra oversikten din.",
  };
}

export function mapWordpressLineItems(
  items: WordpressOrderDetailRaw["lineItems"]
): AccountOrderLineItem[] {
  return (items ?? []).map((item) => {
    const sourceUrl = item.image?.sourceUrl?.trim() || null;
    return {
      name: item.name?.trim() || "Produkt",
      slug: item.slug?.trim() || null,
      quantity: typeof item.quantity === "number" ? item.quantity : 0,
      total: item.total ?? null,
      image: sourceUrl
        ? {
            sourceUrl,
            altText: item.image?.altText?.trim() || null,
          }
        : null,
    };
  });
}

export function mapWordpressAddress(
  address: AccountOrderAddress | null | undefined
): AccountOrderAddress | null {
  if (!address) return null;
  return {
    firstName: address.firstName ?? null,
    lastName: address.lastName ?? null,
    address1: address.address1 ?? null,
    address2: address.address2 ?? null,
    postcode: address.postcode ?? null,
    city: address.city ?? null,
    country: address.country ?? null,
    email: address.email ?? null,
    phone: address.phone ?? null,
  };
}

export function mapWordpressCustomerNotes(
  notes: WordpressOrderDetailRaw["customerNotes"]
): AccountOrderDetail["customerNotes"] {
  if (!Array.isArray(notes)) return [];

  return notes
    .map((note) => {
      const id = typeof note.id === "number" && Number.isFinite(note.id) ? note.id : 0;
      const content = note.content?.trim() || "";
      if (!content) return null;

      const type = note.type === "sms" ? "sms" : note.type === "email" ? "email" : null;
      if (!type) return null;

      return {
        id,
        type,
        date: note.date ?? null,
        content,
      };
    })
    .filter((note): note is AccountOrderDetail["customerNotes"][number] => note != null);
}

export type { AccountOrderSummary, AccountOrderDetail };
