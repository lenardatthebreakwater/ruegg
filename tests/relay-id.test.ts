import { describe, expect, it } from "vitest";
import { decodeRelayDatabaseId } from "@/lib/graphql/relay-id";

describe("decodeRelayDatabaseId", () => {
  it("decodes a base64 WPGraphQL post id", () => {
    const globalId = Buffer.from("post:12345", "utf8").toString("base64");
    expect(decodeRelayDatabaseId(globalId)).toBe(12345);
  });

  it("decodes product-style relay ids", () => {
    const globalId = Buffer.from("product:99", "utf8").toString("base64");
    expect(decodeRelayDatabaseId(globalId)).toBe(99);
  });

  it("returns null for empty or invalid input", () => {
    expect(decodeRelayDatabaseId("")).toBeNull();
    expect(decodeRelayDatabaseId("%%%not-base64%%%")).toBeNull();
    const noDigits = Buffer.from("post:", "utf8").toString("base64");
    expect(decodeRelayDatabaseId(noDigits)).toBeNull();
  });
});
