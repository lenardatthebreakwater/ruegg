import { getReservedelerBrandLabel } from "@/lib/reservedeler/brand-order";
import type { ReservedelerItemCard } from "@/lib/reservedeler/types";

/**
 * Normalize text for reservedeler model search: lowercase, treat punctuation /
 * separators as spaces so "1.1SK" and "1 1 sk" share the same tokens.
 */
export function normalizeReservedelerSearchText(value: string): string {
  return value
    .toLocaleLowerCase("nb-NO")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchHaystack(item: ReservedelerItemCard): {
  spaced: string;
  compact: string;
} {
  const spaced = normalizeReservedelerSearchText(
    [
      item.displayTitle,
      item.rawTitle,
      item.itemSlug,
      item.brandSlug,
      getReservedelerBrandLabel(item.brandSlug),
    ].join(" ")
  );
  return {
    spaced,
    compact: spaced.replace(/\s+/g, ""),
  };
}

/**
 * Match when every query token appears in the model title/slug/brand
 * (substring), so "aduro sk" hits "Aduro 1.1SK".
 */
export function reservedelerItemMatchesQuery(
  item: ReservedelerItemCard,
  query: string
): boolean {
  const tokens = normalizeReservedelerSearchText(query)
    .split(" ")
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const { spaced, compact } = buildSearchHaystack(item);
  return tokens.every(
    (token) => spaced.includes(token) || compact.includes(token)
  );
}
