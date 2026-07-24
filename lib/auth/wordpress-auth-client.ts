import { setDefaultResultOrder } from "node:dns";
import {
  getWordpressAuthLoginUrl,
  getWordpressAuthLogoutUrl,
  getWordpressAuthMeUrl,
  getWordpressAuthPasswordChangeUrl,
  getWordpressAuthPasswordRequestUrl,
  getWordpressAuthPasswordResetUrl,
  getWordpressAuthSignupUrl,
  getWordpressAuthSsoCodeUrl,
} from "@/lib/wordpress-urls";
import type {
  LoginInput,
  PasswordChangeInput,
  PasswordResetInput,
  PasswordResetRequestInput,
  SignupInput,
  WordpressAuthResponse,
} from "@/lib/auth/types";

const REQUEST_TIMEOUT_MS = 12_000;

// Some hosting/network setups resolve AAAA first and can time out for Node fetch.
// Prefer IPv4 first to avoid intermittent ETIMEDOUT when calling WordPress.
try {
  setDefaultResultOrder("ipv4first");
} catch {
  // Ignore; environment may not support overriding DNS result order.
}

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
};

function getSharedSecret(): string {
  return String(process.env.WORDPRESS_AUTH_SHARED_SECRET ?? "").trim();
}

async function callWordpressAuth(
  url: string | null,
  options: RequestOptions = {}
): Promise<WordpressAuthResponse> {
  if (!url) {
    return {
      ok: false,
      errorCode: "WORDPRESS_UNAVAILABLE",
      message: "WordPress auth URL er ikke konfigurert.",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const secret = getSharedSecret();
  if (secret) headers["X-PB-Auth-Secret"] = secret;
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: options.method ?? "POST",
      headers,
      body: options.body == null ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
      cache: "no-store",
    });

    const json = (await response.json().catch(() => null)) as WordpressAuthResponse | null;
    if (json && typeof json.ok === "boolean") return json;

    if (!response.ok) {
      return {
        ok: false,
        errorCode: "WORDPRESS_UNAVAILABLE",
        message: "Klarte ikke kontakte kontosystemet.",
      };
    }

    return {
      ok: false,
      errorCode: "UNKNOWN_ERROR",
      message: "Uventet svar fra kontosystemet.",
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        errorCode: "WORDPRESS_UNAVAILABLE",
        message: "Forespørselen mot kontosystemet tok for lang tid.",
      };
    }

    return {
      ok: false,
      errorCode: "WORDPRESS_UNAVAILABLE",
      message: "Klarte ikke kontakte kontosystemet.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function loginWithWordpress(input: LoginInput): Promise<WordpressAuthResponse> {
  return callWordpressAuth(getWordpressAuthLoginUrl(), { method: "POST", body: input });
}

export function signupWithWordpress(input: SignupInput): Promise<WordpressAuthResponse> {
  return callWordpressAuth(getWordpressAuthSignupUrl(), { method: "POST", body: input });
}

export function getWordpressCurrentUser(token: string): Promise<WordpressAuthResponse> {
  return callWordpressAuth(getWordpressAuthMeUrl(), { method: "GET", token });
}

export function logoutFromWordpress(token: string): Promise<WordpressAuthResponse> {
  return callWordpressAuth(getWordpressAuthLogoutUrl(), { method: "POST", token });
}

export function requestWordpressPasswordReset(
  input: PasswordResetRequestInput
): Promise<WordpressAuthResponse> {
  return callWordpressAuth(getWordpressAuthPasswordRequestUrl(), {
    method: "POST",
    body: input,
  });
}

export function resetWordpressPassword(
  input: PasswordResetInput
): Promise<WordpressAuthResponse> {
  return callWordpressAuth(getWordpressAuthPasswordResetUrl(), {
    method: "POST",
    body: input,
  });
}

export function changeWordpressPassword(
  token: string,
  input: PasswordChangeInput
): Promise<WordpressAuthResponse> {
  return callWordpressAuth(getWordpressAuthPasswordChangeUrl(), {
    method: "POST",
    body: input,
    token,
  });
}

/**
 * Mint a one-time WordPress SSO login URL for the current customer.
 * `redirectPath` must be a same-site relative path (e.g. order-pay URL).
 */
export function createWordpressSsoLoginUrl(
  token: string,
  redirectPath: string
): Promise<WordpressAuthResponse> {
  return callWordpressAuth(getWordpressAuthSsoCodeUrl(), {
    method: "POST",
    body: { redirect: redirectPath },
    token,
  });
}

