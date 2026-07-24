import type { Metadata } from "next";
import { ReservedelerFamilyPage } from "@/components/reservedeler/reservedeler-family-page";
import {
  findReservedelerItemByFamilySlug,
  getDefaultBrandForReservedelerFamily,
  getReservedelerItemSlugsForFamily,
} from "@/lib/reservedeler/families";
import { buildReservedelerItemPageMeta } from "@/lib/reservedeler/item-page-meta";
import { buildPageMetadata } from "@/lib/seo/metadata";

const FAMILY_SLUG = "dovre-deler";

// Matches the 10-minute reservedeler items feed; product data is fresher
// still via the product-save webhook tags.
export const revalidate = 600;

/**
 * Prerender every item page at build time (they all share a handful of
 * cached brand aggregates, so this is cheap). Slugs added later are still
 * served via on-demand ISR.
 */
export async function generateStaticParams(): Promise<Array<{ item: string }>> {
  const slugs = await getReservedelerItemSlugsForFamily(FAMILY_SLUG);
  return slugs.map((item) => ({ item }));
}

type ReservedelerFamilyPageProps = {
  params: Promise<{ item: string }>;
};

export async function generateMetadata({
  params,
}: ReservedelerFamilyPageProps): Promise<Metadata> {
  const { item } = await params;
  const itemSlug = decodeURIComponent(item);
  const itemData = await findReservedelerItemByFamilySlug(FAMILY_SLUG, itemSlug);
  const fallbackBrandSlug =
    getDefaultBrandForReservedelerFamily(FAMILY_SLUG) ?? "dovre";
  const meta = await buildReservedelerItemPageMeta({
    itemSlug,
    itemData,
    fallbackBrandSlug,
  });
  return buildPageMetadata(meta);
}

export default async function DovreReservedelerItemPage({
  params,
}: ReservedelerFamilyPageProps) {
  const { item } = await params;
  const itemSlug = decodeURIComponent(item);
  const itemData = await findReservedelerItemByFamilySlug(FAMILY_SLUG, itemSlug);
  const resolvedBrandSlug =
    itemData?.brandSlug ??
    getDefaultBrandForReservedelerFamily(FAMILY_SLUG) ??
    "dovre";
  return (
    <ReservedelerFamilyPage brandSlug={resolvedBrandSlug} itemSlug={itemSlug} />
  );
}
