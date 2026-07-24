import { getReservedelerSectionBrand } from "@/lib/reservedeler/section-brand";
import { normalizeReservedelerSearchText } from "@/lib/reservedeler/search-match";
import type { ReservedelerItemCard } from "@/lib/reservedeler/types";

export type FireplaceReservedelerMatchInput = {
  slug: string;
  name: string;
  brandSlug?: string | null;
  /** When present, prefer items whose itemSlug appears on the peis product. */
  attributeTermSlugs?: string[] | null;
};

const DELER_SUFFIX_RE = /-(reservedeler|deler)$/u;

/** Model key from a reservedeler catalog itemSlug (`aduro-15-deler` → `aduro-15`). */
export function getReservedelerModelKey(itemSlug: string): string {
  return itemSlug.trim().toLocaleLowerCase("nb-NO").replace(DELER_SUFFIX_RE, "");
}

function normalizeSlug(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase("nb-NO") ?? "";
}

/** Title equality helper: strip brand noise / "reservedeler" wording. */
function normalizeModelLabel(value: string): string {
  return normalizeReservedelerSearchText(value)
    .replace(/\b(reservedeler|deler)\b/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function brandsCompatible(
  peisBrandSlug: string | null | undefined,
  item: ReservedelerItemCard
): boolean {
  const peis = normalizeSlug(peisBrandSlug);
  if (!peis) return true;

  const section = getReservedelerSectionBrand(item);
  if (peis === section || peis === item.brandSlug) return true;

  // Aduro / Asgård share the aduro-deler family; keep section brands distinct.
  if (peis === "aduro") return section === "aduro";
  if (peis === "asgard") {
    return section === "asgard" || item.brandSlug === "asgard";
  }

  return false;
}

function preferBrandMatch(
  items: ReservedelerItemCard[],
  peisBrandSlug: string | null | undefined
): ReservedelerItemCard {
  const peis = normalizeSlug(peisBrandSlug);
  if (!peis || items.length === 1) return items[0]!;

  const sectionHit = items.find(
    (item) => getReservedelerSectionBrand(item) === peis
  );
  if (sectionHit) return sectionHit;

  const brandHit = items.find((item) => item.brandSlug === peis);
  return brandHit ?? items[0]!;
}

/**
 * Resolve the reservedeler catalog model for a fireplace.
 *
 * Matching order (storefront-aligned):
 * 1. `attributeTermSlugs` on the peis includes the catalog `itemSlug`
 * 2. Peis product slug equals the item model key (`aduro-15` ↔ `aduro-15-deler`)
 * 3. Normalized peis name equals normalized item title (single hit only)
 */
export function findReservedelerItemForFireplace(
  fireplace: FireplaceReservedelerMatchInput,
  items: ReservedelerItemCard[]
): ReservedelerItemCard | null {
  const peisSlug = normalizeSlug(fireplace.slug);
  if (!peisSlug || items.length === 0) return null;

  const pool = items.filter((item) =>
    brandsCompatible(fireplace.brandSlug, item)
  );
  if (pool.length === 0) return null;

  const termSlugs = new Set(
    (fireplace.attributeTermSlugs ?? [])
      .map((slug) => normalizeSlug(slug))
      .filter(Boolean)
  );
  if (termSlugs.size > 0) {
    const byTerm = pool.filter((item) => termSlugs.has(item.itemSlug));
    if (byTerm.length > 0) {
      return preferBrandMatch(byTerm, fireplace.brandSlug);
    }
  }

  const byModelKey = pool.filter(
    (item) => getReservedelerModelKey(item.itemSlug) === peisSlug
  );
  if (byModelKey.length > 0) {
    return preferBrandMatch(byModelKey, fireplace.brandSlug);
  }

  const byExactItemSlug = pool.filter((item) => item.itemSlug === peisSlug);
  if (byExactItemSlug.length > 0) {
    return preferBrandMatch(byExactItemSlug, fireplace.brandSlug);
  }

  const peisLabel = normalizeModelLabel(fireplace.name);
  if (!peisLabel) return null;

  const byName = pool.filter((item) => {
    const display = normalizeModelLabel(item.displayTitle);
    const raw = normalizeModelLabel(item.rawTitle);
    return display === peisLabel || raw === peisLabel;
  });
  if (byName.length === 1) return byName[0]!;

  return null;
}
