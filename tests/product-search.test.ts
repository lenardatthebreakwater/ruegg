import { describe, expect, it } from "vitest";
import {
  getSearchScore,
  normalizeSearchQuery,
  rankProductsByQuery,
} from "@/lib/search/product-search";

const catalog = [
  {
    name: "Aduro 9.5 Bestselger",
    brand: "Aduro",
    sku: "ADURO-9.5",
    categories: [{ name: "Vedovn", slug: "vedovn" }],
  },
  {
    name: "Aduro 15.5",
    brand: "Aduro",
    sku: "ADURO-15.5",
    categories: [{ name: "Vedovn", slug: "vedovn" }],
  },
  {
    name: "Nordpeis Salzburg M",
    brand: "Nordpeis",
    sku: "NP-SALZ-M",
    categories: [{ name: "Peisovn", slug: "peisovn" }],
  },
  {
    name: "Reservedel pakning 95",
    brand: "Generic",
    sku: "PKT-95",
    categories: [{ name: "Reservedeler", slug: "reservedeler" }],
  },
  {
    name: "Glass 5 mm",
    brand: "Aduro",
    sku: "GLASS-5",
    categories: [{ name: "Reservedeler", slug: "reservedeler" }],
  },
];

describe("normalizeSearchQuery", () => {
  it("keeps model decimals as one token unit", () => {
    expect(normalizeSearchQuery("aduro 9.5")).toBe("aduro 9.5");
    expect(normalizeSearchQuery("aduro 9,5")).toBe("aduro 9.5");
  });
});

describe("rankProductsByQuery", () => {
  it("does not inflate aduro 9.5 into every SKU with digits 9 and 5", () => {
    const ranked = rankProductsByQuery(catalog, "aduro 9.5");
    const names = ranked.map((entry) => entry.product.name);

    expect(names).toContain("Aduro 9.5 Bestselger");
    expect(names).not.toContain("Aduro 15.5");
    expect(names).not.toContain("Reservedel pakning 95");
    expect(names).not.toContain("Glass 5 mm");
    expect(names).not.toContain("Nordpeis Salzburg M");
    expect(ranked.length).toBe(1);
  });

  it("still finds brand-only queries", () => {
    const ranked = rankProductsByQuery(catalog, "aduro");
    expect(ranked.map((entry) => entry.product.name)).toEqual(
      expect.arrayContaining(["Aduro 9.5 Bestselger", "Aduro 15.5", "Glass 5 mm"])
    );
  });

  it("matches hyphenated model tokens", () => {
    expect(getSearchScore(catalog[0], "9.5")).toBeGreaterThan(1.25);
  });
});
