import { aggregateArchiveProducts } from "@/lib/graphql/server-archive-aggregate";
import { getReservedelerItems } from "@/lib/reservedeler/server-items";
import { getReservedelerSectionBrand } from "@/lib/reservedeler/section-brand";

const FAMILY_BRANDS: Record<string, string[]> = {
  "aduro-deler": ["aduro", "asgard", "jydepejsen"],
  "dovre-deler": ["dovre"],
  "nordpeis-deler": ["nordpeis"],
};

/** User-facing family hub labels (breadcrumbs / UI). */
const FAMILY_LABELS: Record<string, string> = {
  "aduro-deler": "Aduro deler",
  "dovre-deler": "Dovre deler",
  "nordpeis-deler": "Nordpeis deler",
};

export function getBrandsForReservedelerFamily(familySlug: string): string[] {
  return FAMILY_BRANDS[familySlug] ?? [];
}

export function getReservedelerFamilyLabel(familySlug: string): string {
  return (
    FAMILY_LABELS[familySlug] ??
    familySlug.charAt(0).toLocaleUpperCase("nb-NO") +
      familySlug.slice(1).replace(/-/g, " ")
  );
}

export function getDefaultBrandForReservedelerFamily(
  familySlug: string
): string | null {
  return getBrandsForReservedelerFamily(familySlug)[0] ?? null;
}

export async function findReservedelerItemByFamilySlug(
  familySlug: string,
  itemSlug: string
) {
  const brands = new Set(getBrandsForReservedelerFamily(familySlug));
  if (brands.size === 0) return null;

  const normalizedItem = itemSlug.trim().toLocaleLowerCase("nb-NO");
  const allItems = await getReservedelerItems();
  return (
    allItems.find((item) => {
      if (item.itemSlug !== normalizedItem) return false;
      const section = getReservedelerSectionBrand(item);
      return brands.has(item.brandSlug) || brands.has(section);
    }) ?? null
  );
}

/**
 * All item slugs belonging to a family route (e.g. "aduro-deler"), used by
 * generateStaticParams to prerender every reservedeler item page at build
 * time. Returns [] if the WordPress items feed is unavailable — the routes
 * then fall back to on-demand ISR for unknown slugs.
 *
 * Also pre-warms the per-brand archive aggregates the item pages read.
 * generateStaticParams runs single-threaded before the parallel page
 * workers, so warming here means every item render is a cache hit — without
 * it, dozens of concurrent cold renders hammer WordPress and a single
 * transient GraphQL failure leaves a whole brand's pages prerendered as
 * skeletons until the next ISR pass.
 */
export async function getReservedelerItemSlugsForFamily(
  familySlug: string
): Promise<string[]> {
  const brands = new Set(getBrandsForReservedelerFamily(familySlug));
  if (brands.size === 0) return [];

  const allItems = await getReservedelerItems();
  const familyItems = allItems.filter((item) => {
    const section = getReservedelerSectionBrand(item);
    return brands.has(item.brandSlug) || brands.has(section);
  });

  const firstItemByBrand = new Map<string, string>();
  for (const item of familyItems) {
    if (!firstItemByBrand.has(item.brandSlug)) {
      firstItemByBrand.set(item.brandSlug, item.itemSlug);
    }
  }
  await Promise.all(
    [...firstItemByBrand.entries()].map(async ([brandSlug, itemSlug]) => {
      try {
        // Match the item-page query: brand-wide aggregate (no reservedeler
        // category filter) so accessories tagged with model terms are included.
        // The item slug only selects the "with term slugs" cache variant.
        await aggregateArchiveProducts({
          brandSlug,
          reservedelerItemSlug: itemSlug,
        });
      } catch {
        // Pages self-heal via 10-minute ISR + client-side fetch fallback.
      }
    })
  );

  return [...new Set(familyItems.map((item) => item.itemSlug))];
}
