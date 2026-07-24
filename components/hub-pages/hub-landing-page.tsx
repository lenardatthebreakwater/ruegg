import { HubBrandTeaserGrid } from "@/components/hub-pages/hub-brand-teaser-grid";
import { HubFeatureSplitSection } from "@/components/hub-pages/hub-feature-split-section";
import { HubHomeHeroSection } from "@/components/hub-pages/hub-home-hero-section";
import { HubProseSection } from "@/components/hub-pages/hub-prose-section";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { getHubLandingContent } from "@/lib/data/hub-pages/hub-landing-registry";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { getPopulaereSokHubById } from "@/lib/populaere-sok/menu-data";
import type { PopulaereSokHubId } from "@/lib/populaere-sok/types";
import {
  buildArchiveItemListSchema,
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/schema";
import type { Product } from "@/lib/types/product";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/** Prefer first occurrence when the same product appears in multiple carousels. */
function uniqueProductsBySlug(products: Product[]): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const product of products) {
    if (!product.slug || seen.has(product.slug)) continue;
    seen.add(product.slug);
    out.push(product);
  }
  return out;
}

type HubLandingPageProps = {
  hubId: PopulaereSokHubId;
  /** Rendered after the feature split section (e.g. category carousels on Peisovn). */
  afterFeature?: ReactNode;
  /**
   * Products already shown in hub carousels — emits ItemList JSON-LD only when
   * non-empty (no invented product lists).
   */
  itemListProducts?: Product[];
};

export function HubLandingPage({
  hubId,
  afterFeature,
  itemListProducts,
}: HubLandingPageProps) {
  const hub = getPopulaereSokHubById(hubId);
  const content = getHubLandingContent(hubId);
  if (!hub || !content) {
    notFound();
  }

  const breadcrumbs = buildFlatBreadcrumbs(hub.breadcrumbLabel);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, hub.path);
  const collectionSchema = buildCollectionPageSchema({
    path: hub.path,
    name: content.seo.title,
    description: content.seo.description,
  });
  const uniqueItemListProducts = itemListProducts?.length
    ? uniqueProductsBySlug(itemListProducts)
    : [];
  const itemListSchema =
    uniqueItemListProducts.length > 0
      ? buildArchiveItemListSchema({
          products: uniqueItemListProducts,
          limit: 12,
        })
      : null;
  const intro = content.brandTeaserIntro;

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={collectionSchema} />
      {itemListSchema ? <JsonLdScript data={itemListSchema} /> : null}
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <HubHomeHeroSection hero={content.hero} />
        <HubProseSection block={content.whyChoose} />
        <HubBrandTeaserGrid
          teasers={content.brandTeasers}
          imageAspectClass={content.brandTeaserImageAspectClass}
          sectionTitle={intro?.title}
          sectionDescription={intro?.description}
        />
        <HubFeatureSplitSection feature={content.feature} />
        {afterFeature}
      </SimpleStaticPageShell>
    </>
  );
}
