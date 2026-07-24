import { getAttributeTermArchive } from "@/lib/graphql/fetch-attribute-term-archive";
import {
  getReservedelerBrandLabel,
  getReservedelerSectionBrand,
} from "@/lib/reservedeler/brand-order";
import { normalizeReservedelerItemTitle } from "@/lib/reservedeler/normalize-item-title";
import { guessReservedelerTaxonomy } from "@/lib/reservedeler/taxonomy";
import type { ReservedelerItemCard } from "@/lib/reservedeler/types";
import { buildReservedelerItemHref } from "@/lib/products/paths";
import {
  resolveReservedelerItemDocumentTitle,
  resolveReservedelerItemMetaDescription,
} from "@/lib/seo/reservedeler-item-seo";

function formatSlugLabel(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

export async function buildReservedelerItemPageMeta(options: {
  itemSlug: string;
  itemData: ReservedelerItemCard | null;
  fallbackBrandSlug: string;
}): Promise<{
  title: string;
  description: string;
  path: string;
  socialImage?: { url: string; alt: string };
}> {
  const { itemSlug, itemData, fallbackBrandSlug } = options;
  const displayBrandSlug = itemData
    ? getReservedelerSectionBrand(itemData)
    : fallbackBrandSlug;
  const brandName = getReservedelerBrandLabel(displayBrandSlug);
  const itemName = itemData
    ? itemData.displayTitle
    : normalizeReservedelerItemTitle(formatSlugLabel(itemSlug));

  const taxonomy =
    itemData?.reservedelerTaxonomy?.trim() ||
    guessReservedelerTaxonomy(displayBrandSlug) ||
    guessReservedelerTaxonomy(fallbackBrandSlug);

  const termArchive = taxonomy
    ? await getAttributeTermArchive(taxonomy, itemSlug)
    : null;

  const displayName = termArchive?.name?.trim()
    ? normalizeReservedelerItemTitle(termArchive.name)
    : itemName;

  const title = resolveReservedelerItemDocumentTitle(itemSlug, displayName);
  const description = resolveReservedelerItemMetaDescription(
    itemSlug,
    termArchive?.descriptionPlain,
    displayName,
    brandName
  );

  const banner = termArchive?.bannerImage;
  const socialImage = banner?.src
    ? { url: banner.src, alt: banner.alt || displayName }
    : undefined;

  return {
    title,
    description,
    path: buildReservedelerItemHref(displayBrandSlug, itemSlug),
    ...(socialImage ? { socialImage } : {}),
  };
}
