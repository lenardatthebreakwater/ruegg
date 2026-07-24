import { getReservedelerSectionBrand } from "@/lib/reservedeler/section-brand";
import type { ReservedelerItemCard } from "@/lib/reservedeler/types";

export { getReservedelerSectionBrand } from "@/lib/reservedeler/section-brand";

/** Canonical order for reservedeler brand sections and filter options. */
export const RESERVED_BRAND_ORDER = [
  "aduro",
  "asgard",
  "dovre",
  "jydepejsen",
  "nordpeis",
] as const;

export type ReservedBrandSlug = (typeof RESERVED_BRAND_ORDER)[number];

export type ReservedelerBrandFilter = "all" | ReservedBrandSlug;

/**
 * Parses the `?brand=` query for /reservedeler/. Invalid, empty, or unknown
 * values resolve to "all" (show all brands).
 */
export function parseReservedelerBrandParam(
  raw: string | null | undefined
): ReservedelerBrandFilter {
  if (raw == null) return "all";
  const normalized = raw.trim().toLocaleLowerCase("nb-NO");
  if (!normalized) return "all";
  if ((RESERVED_BRAND_ORDER as readonly string[]).includes(normalized)) {
    return normalized as ReservedBrandSlug;
  }
  return "all";
}

/** User-facing labels for reservedeler filters and sections (Bokmål, title case). */
const RESERVEDELER_BRAND_LABELS: Record<ReservedBrandSlug, string> = {
  aduro: "Aduro",
  asgard: "Asgård",
  dovre: "Dovre",
  jydepejsen: "Jydepejsen",
  nordpeis: "Nordpeis",
};

/**
 * Display name for reservedeler brand filters and headings.
 * Keeps Aduro / Asgård distinct from merker menu all-caps styling.
 */
export function getReservedelerBrandLabel(slug: string): string {
  if (
    (RESERVED_BRAND_ORDER as readonly string[]).includes(slug)
  ) {
    return RESERVEDELER_BRAND_LABELS[slug as ReservedBrandSlug];
  }
  return (
    slug.charAt(0).toLocaleUpperCase("nb-NO") +
    slug.slice(1).replace(/-/g, " ")
  );
}

/** Groups by display section brand (splits Asgård from Aduro when API sends `aduro`). */
export function groupItemsByBrand(
  items: ReservedelerItemCard[]
): Map<string, ReservedelerItemCard[]> {
  const grouped = new Map<string, ReservedelerItemCard[]>();
  for (const item of items) {
    const key = getReservedelerSectionBrand(item);
    const existing = grouped.get(key) ?? [];
    existing.push(item);
    grouped.set(key, existing);
  }
  return grouped;
}

export function getOrderedBrandSlugs(
  groupedByBrand: Map<string, ReservedelerItemCard[]>
): string[] {
  const orderedKnown = RESERVED_BRAND_ORDER.filter((slug) =>
    groupedByBrand.has(slug)
  );
  const rest = [...groupedByBrand.keys()].filter(
    (slug) =>
      !RESERVED_BRAND_ORDER.includes(slug as ReservedBrandSlug)
  );
  return [...orderedKnown, ...rest];
}
