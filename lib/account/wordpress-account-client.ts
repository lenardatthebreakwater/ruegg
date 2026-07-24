import "server-only";

import { setDefaultResultOrder } from "node:dns";
import type {
  AccountAddresses,
  AccountCustomerAddress,
  AccountPaymentMethod,
} from "@/lib/account/types";
import {
  getWordpressAuthAddressesUrl,
  getWordpressAuthPaymentMethodByIdUrl,
  getWordpressAuthPaymentMethodDefaultUrl,
  getWordpressAuthPaymentMethodsUrl,
} from "@/lib/wordpress-urls";

const REQUEST_TIMEOUT_MS = 15_000;

try {
  setDefaultResultOrder("ipv4first");
} catch {
  // Ignore; environment may not support overriding DNS result order.
}

type WordpressEnvelope = {
  ok: boolean;
  errorCode?: string;
  message?: string;
};

function getSharedSecret(): string {
  return String(process.env.WORDPRESS_AUTH_SHARED_SECRET ?? "").trim();
}

async function callWordpressAccount<T extends WordpressEnvelope>(
  url: string | null,
  token: string,
  options: { method?: "GET" | "PUT" | "POST" | "DELETE"; body?: unknown } = {}
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
  if (options.body != null) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body == null ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
      cache: "no-store",
    });

    const json = (await response.json().catch(() => null)) as T | null;
    if (!json || typeof json.ok !== "boolean") {
      throw new Error("WORDPRESS_UNAVAILABLE");
    }

    if (!json.ok) {
      if (
        json.errorCode === "UNAUTHORIZED" ||
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error("UNAUTHORIZED");
      }
      if (json.errorCode === "NOT_FOUND" || response.status === 404) {
        throw new Error("NOT_FOUND");
      }
      if (json.errorCode === "INVALID_INPUT" || response.status === 400) {
        throw new Error(json.message?.trim() || "Ugyldig inndata.");
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

function emptyAddress(): AccountCustomerAddress {
  return {
    firstName: null,
    lastName: null,
    company: null,
    address1: null,
    address2: null,
    postcode: null,
    city: null,
    state: null,
    country: null,
    email: null,
    phone: null,
  };
}

function mapAddress(
  raw: Partial<AccountCustomerAddress> | null | undefined
): AccountCustomerAddress {
  const base = emptyAddress();
  if (!raw) return base;
  return {
    firstName: raw.firstName ?? null,
    lastName: raw.lastName ?? null,
    company: raw.company ?? null,
    address1: raw.address1 ?? null,
    address2: raw.address2 ?? null,
    postcode: raw.postcode ?? null,
    city: raw.city ?? null,
    state: raw.state ?? null,
    country: raw.country ?? null,
    email: raw.email ?? null,
    phone: raw.phone ?? null,
  };
}

export async function fetchWordpressAddresses(
  token: string
): Promise<AccountAddresses> {
  const data = await callWordpressAccount<
    WordpressEnvelope & {
      billing?: Partial<AccountCustomerAddress>;
      shipping?: Partial<AccountCustomerAddress>;
    }
  >(getWordpressAuthAddressesUrl(), token);

  return {
    billing: mapAddress(data.billing),
    shipping: mapAddress(data.shipping),
  };
}

export async function updateWordpressAddresses(
  token: string,
  payload: {
    billing?: Partial<AccountCustomerAddress>;
    shipping?: Partial<AccountCustomerAddress>;
  }
): Promise<AccountAddresses> {
  const data = await callWordpressAccount<
    WordpressEnvelope & {
      billing?: Partial<AccountCustomerAddress>;
      shipping?: Partial<AccountCustomerAddress>;
    }
  >(getWordpressAuthAddressesUrl(), token, {
    method: "PUT",
    body: payload,
  });

  return {
    billing: mapAddress(data.billing),
    shipping: mapAddress(data.shipping),
  };
}

function mapPaymentMethod(
  raw: Partial<AccountPaymentMethod> | null | undefined
): AccountPaymentMethod | null {
  const id = raw?.id;
  if (typeof id !== "number" || !Number.isFinite(id) || id <= 0) return null;
  return {
    id,
    type: raw?.type?.trim() || "unknown",
    gatewayId: raw?.gatewayId ?? null,
    gatewayTitle: raw?.gatewayTitle ?? null,
    brand: raw?.brand ?? null,
    last4: raw?.last4 ?? null,
    expiryMonth: raw?.expiryMonth ?? null,
    expiryYear: raw?.expiryYear ?? null,
    isDefault: raw?.isDefault === true,
    display: raw?.display?.trim() || "Lagret betalingsmetode",
  };
}

export async function fetchWordpressPaymentMethods(
  token: string
): Promise<AccountPaymentMethod[]> {
  const data = await callWordpressAccount<
    WordpressEnvelope & { paymentMethods?: Array<Partial<AccountPaymentMethod>> }
  >(getWordpressAuthPaymentMethodsUrl(), token);

  return (data.paymentMethods ?? [])
    .map(mapPaymentMethod)
    .filter((method): method is AccountPaymentMethod => method != null);
}

export async function deleteWordpressPaymentMethod(
  token: string,
  methodId: number
): Promise<void> {
  await callWordpressAccount(
    getWordpressAuthPaymentMethodByIdUrl(methodId),
    token,
    { method: "DELETE" }
  );
}

export async function setDefaultWordpressPaymentMethod(
  token: string,
  methodId: number
): Promise<AccountPaymentMethod | null> {
  const data = await callWordpressAccount<
    WordpressEnvelope & { paymentMethod?: Partial<AccountPaymentMethod> }
  >(getWordpressAuthPaymentMethodDefaultUrl(methodId), token, {
    method: "POST",
  });
  return mapPaymentMethod(data.paymentMethod);
}
