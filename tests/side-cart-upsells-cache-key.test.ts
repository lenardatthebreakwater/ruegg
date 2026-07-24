import { describe, expect, it } from "vitest";
import { buildSideCartUpsellsCacheKey } from "@/lib/cart/side-cart-upsells-cache";

describe("buildSideCartUpsellsCacheKey", () => {
  it("normalizes product ids, quantities, and sort order", () => {
    const keyA = buildSideCartUpsellsCacheKey([
      { productId: 20.9, quantity: 2.7 },
      { productId: 10, quantity: 0 },
    ]);
    const keyB = buildSideCartUpsellsCacheKey([
      { productId: 10, quantity: 1 },
      { productId: 20, quantity: 2 },
    ]);
    expect(keyA).toBe(keyB);
    expect(keyA).toBe(
      JSON.stringify([
        { productId: 10, quantity: 1 },
        { productId: 20, quantity: 2 },
      ])
    );
  });

  it("drops non-positive product ids", () => {
    const key = buildSideCartUpsellsCacheKey([
      { productId: 0, quantity: 1 },
      { productId: -3, quantity: 2 },
      { productId: 5, quantity: 1 },
    ]);
    expect(key).toBe(JSON.stringify([{ productId: 5, quantity: 1 }]));
  });
});
