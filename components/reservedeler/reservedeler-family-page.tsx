import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ProductArchiveServer } from "@/components/product-archive/product-archive-server";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { getAttributeTermArchive } from "@/lib/graphql/fetch-attribute-term-archive";
import { termArchiveFaqToFaqItems } from "@/lib/graphql/term-archive-normalize";
import { buildReservedelerItemBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import {
  getReservedelerBrandLabel,
  getReservedelerSectionBrand,
} from "@/lib/reservedeler/brand-order";
import { getReservedelerFamilyLabel } from "@/lib/reservedeler/families";
import { getReservedelerItemByRoute } from "@/lib/reservedeler/server-items";
import { normalizeReservedelerItemTitle } from "@/lib/reservedeler/normalize-item-title";
import { guessReservedelerTaxonomy } from "@/lib/reservedeler/taxonomy";
import {
  buildReservedelerHref,
  buildReservedelerItemHref,
  getReservedelerFamilySlug,
} from "@/lib/products/paths";
import {
  resolveReservedelerItemDocumentTitle,
  resolveReservedelerItemIntro,
  resolveReservedelerItemMetaDescription,
} from "@/lib/seo/reservedeler-item-seo";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/schema";

type ReservedelerFamilyPageProps = {
  brandSlug: string;
  itemSlug: string;
};

function formatSlugLabel(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

export async function ReservedelerFamilyPage({
  brandSlug,
  itemSlug,
}: ReservedelerFamilyPageProps) {
  const itemData = await getReservedelerItemByRoute(brandSlug, itemSlug);

  const displayBrandSlug = itemData
    ? getReservedelerSectionBrand(itemData)
    : brandSlug;
  const brandName = getReservedelerBrandLabel(displayBrandSlug);
  const itemName = itemData
    ? itemData.displayTitle
    : normalizeReservedelerItemTitle(formatSlugLabel(itemSlug));

  const taxonomy =
    itemData?.reservedelerTaxonomy?.trim() ||
    guessReservedelerTaxonomy(displayBrandSlug) ||
    guessReservedelerTaxonomy(brandSlug);

  const termArchive = taxonomy
    ? await getAttributeTermArchive(taxonomy, itemSlug)
    : null;

  const title = termArchive?.name?.trim() || itemName;
  const displayName = normalizeReservedelerItemTitle(title);
  const fallbackIntro = `Reservedeler for ${displayName} fra ${brandName}.`;
  const subtitle =
    resolveReservedelerItemIntro(
      itemSlug,
      termArchive?.descriptionPlain || fallbackIntro
    ) ?? fallbackIntro;
  const metaDescription = resolveReservedelerItemMetaDescription(
    itemSlug,
    termArchive?.descriptionPlain,
    displayName,
    brandName
  );
  const documentTitle = resolveReservedelerItemDocumentTitle(
    itemSlug,
    displayName
  );
  const bannerImage = termArchive?.bannerImage ?? null;
  const bottomBlocks = termArchive?.bottomBlocks ?? [];
  const faqItems = termArchiveFaqToFaqItems(termArchive?.faqItems ?? []);

  const familySlug =
    getReservedelerFamilySlug(displayBrandSlug) ??
    getReservedelerFamilySlug(brandSlug);
  const breadcrumbs = familySlug
    ? buildReservedelerItemBreadcrumbs({
        familySlug,
        familyLabel: getReservedelerFamilyLabel(familySlug),
        itemLabel: displayName,
      })
    : [
        { href: "/", label: "Hjem" },
        { href: buildReservedelerHref(), label: "Reservedeler" },
        { label: displayName },
      ];

  const pagePath = buildReservedelerItemHref(displayBrandSlug, itemSlug);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);
  const collectionSchema = buildCollectionPageSchema({
    path: pagePath,
    name: documentTitle,
    description: metaDescription,
  });

  return (
    <StorefrontPageShell>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={collectionSchema} />
      <ProductArchiveServer
        title={title}
        subtitle={subtitle}
        bannerImage={bannerImage}
        imageFit="contain"
        bottomBlocks={bottomBlocks}
        faqItems={faqItems}
        faqCollectionLabel={displayName}
        breadcrumbs={breadcrumbs}
        // Brand + model attribute only — do not require the "reservedeler"
        // category. Accessories (e.g. Dovre Hanske in tilbehør) that are
        // tagged with the model term should still appear as upsells.
        brandSlug={itemData != null ? itemData.brandSlug : brandSlug}
        reservedelerItemSlug={itemSlug}
      />
    </StorefrontPageShell>
  );
}
