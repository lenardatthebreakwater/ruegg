import { describe, expect, it } from "vitest";
import {
  getRevalidateHeaderSecret,
  getSearchIndexRebuildHeaderSecret,
  isRevalidateAuthorized,
  isSearchIndexRebuildAuthorized,
  secretsMatchBySha256,
  sha256Hex,
} from "@/lib/security/webhook-secret";

describe("webhook secret helpers", () => {
  it("hashes deterministically without exposing plaintext", () => {
    const digest = sha256Hex("test-secret");
    expect(digest).toHaveLength(64);
    expect(digest).toMatch(/^[a-f0-9]+$/);
    expect(digest).not.toContain("test-secret");
  });

  it("matches equal secrets and rejects mismatches / empties", () => {
    expect(secretsMatchBySha256("abc", "abc")).toBe(true);
    expect(secretsMatchBySha256("abc", "xyz")).toBe(false);
    expect(secretsMatchBySha256(null, "abc")).toBe(false);
    expect(secretsMatchBySha256("abc", undefined)).toBe(false);
  });

  it("reads revalidate headers", () => {
    const viaPrimary = new Request("https://example.test", {
      headers: { "x-revalidate-secret": "primary" },
    });
    const viaWebhook = new Request("https://example.test", {
      headers: { "x-webhook-secret": "webhook" },
    });
    expect(getRevalidateHeaderSecret(viaPrimary)).toBe("primary");
    expect(getRevalidateHeaderSecret(viaWebhook)).toBe("webhook");
    expect(isRevalidateAuthorized(viaPrimary, "primary")).toBe(true);
    expect(isRevalidateAuthorized(viaPrimary, "other")).toBe(false);
  });

  it("reads search-index rebuild headers", () => {
    const req = new Request("https://example.test", {
      headers: { "x-search-index-secret": "search" },
    });
    expect(getSearchIndexRebuildHeaderSecret(req)).toBe("search");
    expect(isSearchIndexRebuildAuthorized(req, "search")).toBe(true);
    expect(isSearchIndexRebuildAuthorized(req, "nope")).toBe(false);
  });
});
