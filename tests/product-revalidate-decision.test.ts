import { describe, expect, it } from "vitest";
import { decideProductRevalidate } from "@/lib/cache/product-revalidate-decision";

describe("decideProductRevalidate", () => {
  it("rejects ambiguous empty payloads with 400", () => {
    const decision = decideProductRevalidate({});
    expect(decision).toEqual({
      ok: false,
      status: 400,
      error:
        "Missing product slugs. Pass { slug } / { slugs }, or { revalidateAll: true } for a global purge.",
    });
  });

  it("rejects whitespace-only slug lists without revalidateAll", () => {
    const decision = decideProductRevalidate({ slug: "  ", slugs: ["", " "] });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.status).toBe(400);
  });

  it("scopes slug saves without the global products tag", () => {
    const decision = decideProductRevalidate({
      slug: "nordpeis-quito",
      slugs: [" aduro-9-5 ", "nordpeis-quito"],
    });
    expect(decision).toEqual({
      ok: true,
      revalidateAll: false,
      slugs: ["nordpeis-quito", "aduro-9-5"],
      includeGlobalProductsTag: false,
    });
  });

  it("allows explicit global purge via revalidateAll", () => {
    const decision = decideProductRevalidate({ revalidateAll: true });
    expect(decision).toEqual({
      ok: true,
      revalidateAll: true,
      slugs: [],
      includeGlobalProductsTag: true,
    });
  });

  it("keeps includeGlobalProductsTag true when slugs accompany revalidateAll", () => {
    const decision = decideProductRevalidate({
      revalidateAll: true,
      slug: "one",
    });
    expect(decision).toMatchObject({
      ok: true,
      revalidateAll: true,
      slugs: ["one"],
      includeGlobalProductsTag: true,
    });
  });
});
