import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ProductArchiveServer } from "@/components/product-archive/product-archive-server";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { getProductCategoryArchiveBanner } from "@/lib/graphql/fetch-product-category-banner";
import { termArchiveFaqToFaqItems } from "@/lib/graphql/term-archive-normalize";
import { getAllProductCategorySlugs } from "@/lib/products/archive-static-params";
import {
  buildProductsPageMeta,
  mergeProductCategoryPageHero,
} from "@/lib/products/page-meta";
import { buildCategoryHref } from "@/lib/products/paths";
import {
  resolveCategoryArchiveDocumentTitle,
  resolveCategoryArchiveIntro,
  resolveCategoryArchiveMetaDescription,
  shouldNoindexCategoryArchive,
} from "@/lib/seo/category-archive-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/schema";

/**
 * Statically prerendered at build time (see generateStaticParams). Freshness
 * comes primarily from the WordPress product-save webhook
 * (/api/revalidate/products); the long ISR window is only a safety net.
 * Query-string filters (?brand=, ?onSale=, ?q=) are applied client-side in
 * ProductArchiveLoader so they never force dynamic rendering.
 */
export const revalidate = 604800; // 7 days

type ProductCategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllProductCategorySlugs();
  return slugs.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: ProductCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categorySlug = decodeURIComponent(category);
  const filterParams = { category: categorySlug };
  const wpCategory = await getProductCategoryArchiveBanner(categorySlug);
  const { title, subtitle } = mergeProductCategoryPageHero(
    filterParams,
    wpCategory
  );
  return buildPageMetadata({
    title: resolveCategoryArchiveDocumentTitle(categorySlug, title),
    description: resolveCategoryArchiveMetaDescription(
      categorySlug,
      subtitle,
      title
    ),
    path: buildCategoryHref(categorySlug),
    robots: shouldNoindexCategoryArchive(categorySlug)
      ? { index: false, follow: false }
      : undefined,
  });
}

export default async function ProductCategoryPage({
  params,
}: ProductCategoryPageProps) {
  const { category } = await params;
  const categorySlug = decodeURIComponent(category);

  const filterParams = { category: categorySlug };
  const wpCategory = await getProductCategoryArchiveBanner(categorySlug);
  const meta = buildProductsPageMeta(filterParams);
  const hero = mergeProductCategoryPageHero(filterParams, wpCategory);
  const { title, bannerImage } = hero;
  const subtitle = resolveCategoryArchiveIntro(categorySlug, hero.subtitle);
  const documentTitle = resolveCategoryArchiveDocumentTitle(categorySlug, title);
  const metaDescription = resolveCategoryArchiveMetaDescription(
    categorySlug,
    hero.subtitle,
    hero.title
  );
  const { breadcrumbs, onSaleOnly, brandSlug, searchQuery } = meta;
  const pagePath = buildCategoryHref(categorySlug);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);
  const collectionSchema = buildCollectionPageSchema({
    path: pagePath,
    name: documentTitle,
    description: metaDescription,
  });
  const bottomBlocks = wpCategory?.bottomBlocks ?? [];
  const faqItems = termArchiveFaqToFaqItems(wpCategory?.faqItems ?? []);

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
        faqCollectionLabel={wpCategory?.name ?? title}
        breadcrumbs={breadcrumbs}
        onSaleOnly={onSaleOnly}
        categorySlug={categorySlug}
        brandSlug={brandSlug}
        searchQuery={searchQuery}
      />
    </StorefrontPageShell>
  );
}
