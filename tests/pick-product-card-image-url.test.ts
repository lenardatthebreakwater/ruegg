import { describe, expect, it } from "vitest";

import { pickProductCardImageUrl } from "@/lib/graphql/pick-product-card-image-url";

const FULL =
  "https://peisbutikken.no/wp-content/uploads/2023/10/product.webp";
const THUMB =
  "https://peisbutikken.no/wp-content/uploads/2023/10/product-300x300.webp";
const SINGLE =
  "https://peisbutikken.no/wp-content/uploads/2023/10/product-700x700.webp";

describe("pickProductCardImageUrl", () => {
  it("returns null without a full sourceUrl", () => {
    expect(pickProductCardImageUrl(null)).toBeNull();
    expect(pickProductCardImageUrl({})).toBeNull();
  });

  it("falls back to full when mediaDetails.sizes is empty (e.g. AVIF)", () => {
    expect(
      pickProductCardImageUrl({
        sourceUrl: FULL,
        mediaDetails: { width: 800, height: 800, sizes: [] },
      })
    ).toBe(FULL);
  });

  it("prefers woocommerce_thumbnail when present", () => {
    expect(
      pickProductCardImageUrl({
        sourceUrl: FULL,
        mediaDetails: {
          sizes: [
            { name: "woocommerce_single", sourceUrl: SINGLE, width: 700 },
            { name: "woocommerce_thumbnail", sourceUrl: THUMB, width: 300 },
            { name: "medium", sourceUrl: THUMB, width: 300 },
          ],
        },
      })
    ).toBe(THUMB);
  });

  it("never invents a size URL that is not in the payload", () => {
    expect(
      pickProductCardImageUrl({
        sourceUrl: FULL,
        mediaDetails: {
          sizes: [{ name: "thumbnail", sourceUrl: null, width: 150 }],
        },
      })
    ).toBe(FULL);
  });

  it("picks closest useful width when preferred names are missing", () => {
    expect(
      pickProductCardImageUrl({
        sourceUrl: FULL,
        mediaDetails: {
          sizes: [
            { name: "custom_a", sourceUrl: `${FULL}?a`, width: 120 },
            { name: "custom_b", sourceUrl: `${FULL}?b`, width: 450 },
            { name: "custom_c", sourceUrl: `${FULL}?c`, width: 1200 },
          ],
        },
      })
    ).toBe(`${FULL}?b`);
  });

  it("accepts width/height as strings from WPGraphQL", () => {
    expect(
      pickProductCardImageUrl({
        sourceUrl: FULL,
        mediaDetails: {
          sizes: [
            {
              name: "woocommerce_thumbnail",
              sourceUrl: THUMB,
              width: "300" as unknown as number,
              height: "300" as unknown as number,
            },
          ],
        },
      })
    ).toBe(THUMB);
  });
});
