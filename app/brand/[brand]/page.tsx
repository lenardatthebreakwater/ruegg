import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ProductArchiveServer } from "@/components/product-archive/product-archive-server";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { getProductBrandArchiveBanner } from "@/lib/graphql/fetch-product-brand-banner";
import { termArchiveFaqToFaqItems } from "@/lib/graphql/term-archive-normalize";
import { getAllProductBrandSlugs } from "@/lib/products/archive-static-params";
import {
  buildProductsPageMeta,
  mergeProductBrandPageHero,
} from "@/lib/products/page-meta";
import { buildBrandHref } from "@/lib/products/paths";
import {
  resolveBrandArchiveDocumentTitle,
  resolveBrandArchiveIntro,
  resolveBrandArchiveMetaDescription,
} from "@/lib/seo/brand-archive-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/schema";

/**
 * Statically prerendered at build time (see generateStaticParams). Freshness
 * comes primarily from the WordPress product-save webhook
 * (/api/revalidate/products); the long ISR window is only a safety net.
 * Query-string filters (?category=, ?onSale=, ?q=) are applied client-side in
 * ProductArchiveLoader so they never force dynamic rendering.
 */
export const revalidate = 604800; // 7 days

type BrandPageProps = {
  params: Promise<{ brand: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllProductBrandSlugs();
  return slugs.map((brand) => ({ brand }));
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { brand } = await params;
  const brandSlug = decodeURIComponent(brand);
  const filterParams = { brand: brandSlug };
  const wpBrand = await getProductBrandArchiveBanner(brandSlug);
  const { title, subtitle } = mergeProductBrandPageHero(filterParams, wpBrand);

  return buildPageMetadata({
    title: resolveBrandArchiveDocumentTitle(brandSlug, title),
    description: resolveBrandArchiveMetaDescription(brandSlug, subtitle, title),
    path: buildBrandHref(brandSlug),
  });
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { brand } = await params;
  const brandSlug = decodeURIComponent(brand);
  const filterParams = { brand: brandSlug };
  const wpBrand = await getProductBrandArchiveBanner(brandSlug);
  const meta = buildProductsPageMeta(filterParams);
  const hero = mergeProductBrandPageHero(filterParams, wpBrand);
  const { title, bannerImage } = hero;
  const subtitle = resolveBrandArchiveIntro(brandSlug, hero.subtitle);
  const documentTitle = resolveBrandArchiveDocumentTitle(brandSlug, title);
  const metaDescription = resolveBrandArchiveMetaDescription(
    brandSlug,
    hero.subtitle,
    hero.title
  );
  const breadcrumbs = meta.breadcrumbs.map((item, idx, arr) =>
    idx === arr.length - 1 ? { ...item, label: hero.title } : item
  );
  const { onSaleOnly, categorySlug, searchQuery } = meta;
  const pagePath = buildBrandHref(brandSlug);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);
  const collectionSchema = buildCollectionPageSchema({
    path: pagePath,
    name: documentTitle,
    description: metaDescription,
  });
  const bottomBlocks = wpBrand?.bottomBlocks ?? [];
  const faqItems = termArchiveFaqToFaqItems(wpBrand?.faqItems ?? []);

  return (
    <StorefrontPageShell>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={collectionSchema} />
      <ProductArchiveServer
        title={title}
        subtitle={subtitle}
        bannerImage={bannerImage}
        bottomBlocks={bottomBlocks}
        faqItems={faqItems}
        faqCollectionLabel={wpBrand?.name ?? title}
        breadcrumbs={breadcrumbs}
        onSaleOnly={onSaleOnly}
        categorySlug={categorySlug}
        brandSlug={brandSlug}
        searchQuery={searchQuery}
      />
    </StorefrontPageShell>
  );
}
