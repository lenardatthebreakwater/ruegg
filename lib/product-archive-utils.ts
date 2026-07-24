import type { Product } from "@/lib/types/product";
import type {
  ProductArchiveFilters,
  ProductArchiveSortOrder,
} from "@/lib/types/product-archive";
import {
  getCanonicalArchiveAttribute,
  normalizeArchiveToken,
} from "@/lib/product-archive-attributes";
import { isProductMatchingSearch } from "@/lib/search/product-search";

function normalizeFilterValue(value: string): string {
  return normalizeArchiveToken(value);
}

function splitFilterValues(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isMultiValueMatch(
  productValue: string | null | undefined,
  selectedValues: string[]
): boolean {
  if (selectedValues.length === 0) return true;
  const productTokens = splitFilterValues(productValue).map(normalizeFilterValue);
  if (productTokens.length === 0) return false;
  const selectedTokens = selectedValues.map(normalizeFilterValue);
  return selectedTokens.some((selected) => productTokens.includes(selected));
}

export function filterProducts(
  products: Product[],
  filters: ProductArchiveFilters
): Product[] {
  return products.filter((p) => {
    if (filters.searchQuery && !isProductMatchingSearch(p, filters.searchQuery)) {
      return false;
    }

    // Keep products without a Woo price (e.g. quote packages). Only apply the
    // price slider to products that actually have a numeric price.
    if (p.priceNumeric != null) {
      if (
        p.priceNumeric < filters.priceRange[0] ||
        p.priceNumeric > filters.priceRange[1]
      ) {
        return false;
      }
    }

    if (p.maxPower != null) {
      if (p.maxPower < filters.maxPowerRange[0] || p.maxPower > filters.maxPowerRange[1])
        return false;
    }

    if (p.nominalPower != null) {
      if (
        p.nominalPower < filters.nominalPowerRange[0] ||
        p.nominalPower > filters.nominalPowerRange[1]
      ) {
        return false;
      }
    }

    if (filters.brands.length > 0) {
      if (!p.brand || !filters.brands.includes(p.brand)) return false;
    }

    if (!isMultiValueMatch(p.fireplaceType, filters.fireplaceTypes))
      return false;

    if (!isMultiValueMatch(p.color, filters.colors))
      return false;

    for (const [attributeLabel, selectedValues] of Object.entries(
      filters.attributeFilters
    )) {
      if (selectedValues.length === 0) continue;
      const attributeKey = normalizeFilterValue(attributeLabel);
      const attribute = p.attributes?.find(
        (attr) => {
          const canonical = getCanonicalArchiveAttribute(attr.label);
          if (canonical) {
            return normalizeFilterValue(canonical.key) === attributeKey;
          }
          return normalizeFilterValue(attr.label) === attributeKey;
        }
      );
      if (!attribute) return false;
      if (!isMultiValueMatch(attribute.value, selectedValues)) return false;
    }

    return true;
  });
}

export function getDefaultFilters(products: Product[]): ProductArchiveFilters {
  const prices = products
    .map((p) => p.priceNumeric)
    .filter((n): n is number => typeof n === "number");
  const powers = products
    .map((p) => p.maxPower)
    .filter((n): n is number => typeof n === "number");
  const nominalPowers = products
    .map((p) => p.nominalPower)
    .filter((n): n is number => typeof n === "number");
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 100000;
  const minPower = powers.length ? Math.min(...powers) : 0;
  const maxPower = powers.length ? Math.max(...powers) : 15;
  const minNominalPower = nominalPowers.length ? Math.min(...nominalPowers) : 0;
  const maxNominalPower = nominalPowers.length ? Math.max(...nominalPowers) : 15;
  return {
    searchQuery: "",
    priceRange: [minPrice, maxPrice],
    maxPowerRange: [minPower, maxPower],
    nominalPowerRange: [minNominalPower, maxNominalPower],
    brands: [],
    fireplaceTypes: [],
    colors: [],
    attributeFilters: {},
  };
}

/** Parse `?page=` from the archive URL. Invalid / missing → 1. */
export function parseArchivePageParam(
  raw: string | null | undefined
): number {
  if (raw == null || raw.trim() === "") return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/** Clamp a 1-based page into `[1, totalPages]` (totalPages at least 1). */
export function clampArchivePage(page: number, totalPages: number): number {
  const max = Math.max(1, totalPages);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), max);
}

export function sortProducts(
  products: Product[],
  sortOrder: ProductArchiveSortOrder
): Product[] {
  const arr = [...products];
  switch (sortOrder) {
    case "relevance":
      return arr;
    case "name-asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name, "nb-NO"));
    case "name-desc":
      return arr.sort((a, b) => b.name.localeCompare(a.name, "nb-NO"));
    case "price-asc":
      return arr.sort((a, b) => {
        if (a.priceNumeric == null && b.priceNumeric == null) return 0;
        if (a.priceNumeric == null) return 1;
        if (b.priceNumeric == null) return -1;
        return a.priceNumeric - b.priceNumeric;
      });
    case "price-desc":
      return arr.sort((a, b) => {
        if (a.priceNumeric == null && b.priceNumeric == null) return 0;
        if (a.priceNumeric == null) return 1;
        if (b.priceNumeric == null) return -1;
        return b.priceNumeric - a.priceNumeric;
      });
    default:
      return arr;
  }
}
