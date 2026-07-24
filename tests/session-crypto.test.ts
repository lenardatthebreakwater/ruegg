import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildSessionPayload,
  decodeSessionPayload,
  encodeSessionPayload,
} from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";

const TEST_SECRET = "unit-test-session-secret-not-for-production";

const sampleUser: SessionUser = {
  id: 1,
  email: "test@example.com",
  displayName: "Test User",
  firstName: "Test",
  lastName: "User",
};

describe("session crypto", () => {
  const previous = process.env.AUTH_SESSION_SECRET;

  beforeEach(() => {
    process.env.AUTH_SESSION_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.AUTH_SESSION_SECRET;
    } else {
      process.env.AUTH_SESSION_SECRET = previous;
    }
  });

  it("round-trips a valid payload", () => {
    const payload = buildSessionPayload("token-abc", sampleUser, 3600);
    const encoded = encodeSessionPayload(payload);
    expect(encoded.split(".")).toHaveLength(3);
    expect(encoded).not.toContain("token-abc");

    const decoded = decodeSessionPayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.token).toBe("token-abc");
    expect(decoded?.user.email).toBe("test@example.com");
  });

  it("rejects tampered ciphertext", () => {
    const payload = buildSessionPayload("token-abc", sampleUser, 3600);
    const encoded = encodeSessionPayload(payload);
    const [iv, body, tag] = encoded.split(".");
    const flipped = body.startsWith("A") ? `B${body.slice(1)}` : `A${body.slice(1)}`;
    const tampered = [iv, flipped, tag].join(".");
    expect(decodeSessionPayload(tampered)).toBeNull();
  });

  it("rejects expired payloads", () => {
    const payload = buildSessionPayload("token-abc", sampleUser, 3600);
    payload.expiresAt = Math.floor(Date.now() / 1000) - 10;
    const encoded = encodeSessionPayload(payload);
    expect(decodeSessionPayload(encoded)).toBeNull();
  });
});
