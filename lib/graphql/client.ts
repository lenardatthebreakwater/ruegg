/**
 * Minimal GraphQL client for WordPress / WooCommerce endpoint.
 * Uses fetch; no extra dependencies.
 */

/** Trim quotes/spaces and ensure an http(s) scheme (Vercel envs often omit https://). */
function normalizeGraphqlUrl(raw: string): string {
  let url = raw.trim().replace(/^['"]|['"]$/g, "");
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url.replace(/^\/\//, "")}`;
  }
  return url;
}

const getGraphqlUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
  if (!raw?.trim()) {
    throw new Error(
      "NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL is not set. Add it to .env.local (see .env.example)."
    );
  }
  const url = normalizeGraphqlUrl(raw);
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new Error(
      `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL is invalid ("${raw}"). Use e.g. https://ruegg.no/graphql`
    );
  }
  return url;
};

/** Interactive default: short wall clock so shopper requests fail fast. */
export const GRAPHQL_DEFAULT_TIMEOUT_MS = 8_000;
/** Build/admin ceiling when callers pass a longer explicit timeout. */
export const GRAPHQL_MAX_TIMEOUT_MS = 60_000;
export const GRAPHQL_DEFAULT_RETRY_ATTEMPTS = 1;
export const GRAPHQL_RETRY_BASE_DELAY_MS = 200;
export const GRAPHQL_RETRY_MAX_DELAY_MS = 1_200;
export const GRAPHQL_MAX_RETRY_ATTEMPTS = 3;

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

/**
 * Retry only idempotent transport failures. Do not retry GraphQL application
 * errors (4xx other than these, or JSON `errors` from WPGraphQL).
 */
export function isGraphqlRetryableStatusCode(status: number): boolean {
  return (
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

/** Parse/cap retry count from env or an explicit per-request override. */
export function resolveGraphqlRetryAttempts(
  envRaw: string | undefined,
  override?: number
): number {
  if (typeof override === "number" && Number.isFinite(override)) {
    return Math.min(
      Math.max(0, Math.trunc(override)),
      GRAPHQL_MAX_RETRY_ATTEMPTS
    );
  }
  const parsed = envRaw ? Number.parseInt(envRaw, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed < 0) {
    return GRAPHQL_DEFAULT_RETRY_ATTEMPTS;
  }
  return Math.min(parsed, GRAPHQL_MAX_RETRY_ATTEMPTS);
}

export function resolveGraphqlDefaultTimeoutMs(envRaw: string | undefined): number {
  const parsed = envRaw ? Number.parseInt(envRaw, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return GRAPHQL_DEFAULT_TIMEOUT_MS;
  }
  return Math.min(parsed, GRAPHQL_MAX_TIMEOUT_MS);
}

export function clampGraphqlTimeoutMs(
  timeoutMs: number,
  defaultTimeoutMs: number = GRAPHQL_DEFAULT_TIMEOUT_MS
): number {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return defaultTimeoutMs;
  }
  return Math.min(Math.max(1, Math.trunc(timeoutMs)), GRAPHQL_MAX_TIMEOUT_MS);
}

/**
 * Bounded exponential backoff with ±25% jitter.
 * Inject `random` for deterministic tests (0..1).
 */
export function getGraphqlRetryDelayMs(
  attempt: number,
  random: () => number = Math.random
): number {
  const expo = GRAPHQL_RETRY_BASE_DELAY_MS * 2 ** attempt;
  const capped = Math.min(expo, GRAPHQL_RETRY_MAX_DELAY_MS);
  const unit = Math.min(Math.max(random(), 0), 1);
  const jitter = capped * (0.75 + unit * 0.5);
  return Math.round(jitter);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type GraphqlVariables = Record<string, unknown>;
export type GraphqlRequestOptions = {
  /**
   * Per-request timeout. Interactive callers should omit this (uses ~8s).
   * Build/admin jobs may pass a longer value (capped at 60s).
   */
  timeoutMs?: number;
  /** Override retry count for this request (still capped). */
  retries?: number;
  signal?: AbortSignal;
  cache?: RequestCache;
  /** Optional Bearer token (PB Auth). Server-side only — never expose to the browser. */
  authorization?: string;
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

export class GraphqlRequestAbortedError extends Error {
  readonly reason: "timeout" | "aborted";

  constructor(reason: "timeout" | "aborted") {
    super(
      reason === "timeout"
        ? "Forespørselen tok for lang tid. Prøv igjen."
        : "Forespørselen ble avbrutt."
    );
    this.name = "GraphqlRequestAbortedError";
    this.reason = reason;
  }
}

export class GraphqlHttpError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(status: number, statusText: string) {
    super(`GraphQL request failed: ${status} ${statusText}`);
    this.name = "GraphqlHttpError";
    this.status = status;
    this.retryable = isGraphqlRetryableStatusCode(status);
  }
}

export class GraphqlApplicationError extends Error {
  readonly messages: string[];

  constructor(messages: string[]) {
    super(messages.join("; ") || "GraphQL error");
    this.name = "GraphqlApplicationError";
    this.messages = messages;
  }
}

export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: GraphqlVariables,
  options?: GraphqlRequestOptions
): Promise<T> {
  const defaultTimeoutMs = resolveGraphqlDefaultTimeoutMs(
    process.env.GRAPHQL_REQUEST_TIMEOUT_MS
  );
  const timeoutMs = clampGraphqlTimeoutMs(
    options?.timeoutMs ?? defaultTimeoutMs,
    defaultTimeoutMs
  );
  const retryAttempts = resolveGraphqlRetryAttempts(
    process.env.GRAPHQL_REQUEST_RETRIES,
    options?.retries
  );
  const externalSignal = options?.signal;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);

    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener("abort", onExternalAbort, { once: true });
      }
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const auth = options?.authorization?.trim();
      if (auth) {
        headers.Authorization = auth.startsWith("Bearer ")
          ? auth
          : `Bearer ${auth}`;
      }

      const res = await fetch(getGraphqlUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
        cache: options?.cache,
        next: options?.next,
      } as RequestInit & {
        next?: {
          revalidate?: number;
          tags?: string[];
        };
      });

      if (!res.ok) {
        const httpError = new GraphqlHttpError(res.status, res.statusText);
        if (attempt < retryAttempts && httpError.retryable) {
          lastError = httpError;
          await wait(getGraphqlRetryDelayMs(attempt));
          continue;
        }
        throw httpError;
      }

      const json = (await res.json()) as {
        data?: T;
        errors?: Array<{ message: string }>;
      };

      // Application-level GraphQL errors are not retried.
      if (json.errors?.length) {
        throw new GraphqlApplicationError(
          json.errors.map((e) => e.message).filter(Boolean)
        );
      }

      if (json.data === undefined) {
        throw new GraphqlApplicationError(["GraphQL response had no data"]);
      }

      return json.data;
    } catch (err) {
      if (err instanceof GraphqlApplicationError) {
        throw err;
      }

      if (err instanceof GraphqlHttpError) {
        throw err;
      }

      if (isAbortError(err)) {
        if (didTimeout && attempt < retryAttempts) {
          lastError = new GraphqlRequestAbortedError("timeout");
          await wait(getGraphqlRetryDelayMs(attempt));
          continue;
        }
        throw new GraphqlRequestAbortedError(didTimeout ? "timeout" : "aborted");
      }

      // Unknown transport/network failures: retry with backoff.
      lastError = err;
      if (attempt < retryAttempts) {
        await wait(getGraphqlRetryDelayMs(attempt));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener("abort", onExternalAbort);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("GraphQL request failed");
}
