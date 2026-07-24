import { describe, expect, it } from "vitest";
import {
  clampGraphqlTimeoutMs,
  getGraphqlRetryDelayMs,
  GRAPHQL_DEFAULT_RETRY_ATTEMPTS,
  GRAPHQL_DEFAULT_TIMEOUT_MS,
  GRAPHQL_MAX_TIMEOUT_MS,
  GRAPHQL_RETRY_BASE_DELAY_MS,
  GRAPHQL_RETRY_MAX_DELAY_MS,
  GraphqlHttpError,
  isGraphqlRetryableStatusCode,
  resolveGraphqlDefaultTimeoutMs,
  resolveGraphqlRetryAttempts,
} from "@/lib/graphql/client";

describe("GraphQL retry classification", () => {
  it("retries only selected transport statuses", () => {
    for (const status of [408, 425, 429, 502, 503, 504]) {
      expect(isGraphqlRetryableStatusCode(status)).toBe(true);
      expect(new GraphqlHttpError(status, "x").retryable).toBe(true);
    }
    for (const status of [400, 401, 403, 404, 500, 501, 505]) {
      expect(isGraphqlRetryableStatusCode(status)).toBe(false);
      expect(new GraphqlHttpError(status, "x").retryable).toBe(false);
    }
  });
});

describe("GraphQL retry / timeout options", () => {
  it("defaults and caps retry attempts", () => {
    expect(resolveGraphqlRetryAttempts(undefined)).toBe(
      GRAPHQL_DEFAULT_RETRY_ATTEMPTS
    );
    expect(resolveGraphqlRetryAttempts("2")).toBe(2);
    expect(resolveGraphqlRetryAttempts("99")).toBe(3);
    expect(resolveGraphqlRetryAttempts("bad")).toBe(
      GRAPHQL_DEFAULT_RETRY_ATTEMPTS
    );
    expect(resolveGraphqlRetryAttempts("1", 5)).toBe(3);
    expect(resolveGraphqlRetryAttempts("1", -2)).toBe(0);
  });

  it("defaults and caps timeouts", () => {
    expect(resolveGraphqlDefaultTimeoutMs(undefined)).toBe(
      GRAPHQL_DEFAULT_TIMEOUT_MS
    );
    expect(resolveGraphqlDefaultTimeoutMs("15000")).toBe(15_000);
    expect(resolveGraphqlDefaultTimeoutMs("999999")).toBe(GRAPHQL_MAX_TIMEOUT_MS);
    expect(clampGraphqlTimeoutMs(0)).toBe(GRAPHQL_DEFAULT_TIMEOUT_MS);
    expect(clampGraphqlTimeoutMs(12_000)).toBe(12_000);
    expect(clampGraphqlTimeoutMs(90_000)).toBe(GRAPHQL_MAX_TIMEOUT_MS);
  });

  it("computes bounded exponential backoff with injectable jitter", () => {
    expect(getGraphqlRetryDelayMs(0, () => 0)).toBe(
      Math.round(GRAPHQL_RETRY_BASE_DELAY_MS * 0.75)
    );
    expect(getGraphqlRetryDelayMs(0, () => 1)).toBe(
      Math.round(GRAPHQL_RETRY_BASE_DELAY_MS * 1.25)
    );
    expect(getGraphqlRetryDelayMs(10, () => 0.5)).toBe(
      Math.round(GRAPHQL_RETRY_MAX_DELAY_MS)
    );
  });
});
