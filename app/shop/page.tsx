import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ProductArchiveServer } from "@/components/product-archive/product-archive-server";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { buildProductsPageMeta } from "@/lib/products/page-meta";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/schema";

/**
 * Statically prerendered at build time. Freshness comes primarily from the
 * WordPress product-save webhook (/api/revalidate/products); the long ISR
 * window is only a safety net. Query-string filters (?category=, ?brand=,
 * ?onSale=, ?q=) are applied client-side in ProductArchiveLoader so they
 * never force dynamic rendering.
 */
export const revalidate = 604800; // 7 days

export function generateMetadata(): Metadata {
  const { title, subtitle } = buildProductsPageMeta({});

  return buildPageMetadata({
    title,
    description: subtitle || "Utforsk produkter og finn peisen som passer ditt hjem.",
    path: "/shop/",
  });
}

export default function ShopPage() {
  const {
    title,
    subtitle,
    breadcrumbs,
    onSaleOnly,
    categorySlug,
    brandSlug,
    searchQuery,
  } = buildProductsPageMeta({});
  const pagePath = "/shop/";
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);
  const collectionSchema = buildCollectionPageSchema({
    path: pagePath,
    name: title,
    description: subtitle || "Utforsk produkter",
  });

  return (
    <StorefrontPageShell>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={collectionSchema} />
      <ProductArchiveServer
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        onSaleOnly={onSaleOnly}
        categorySlug={categorySlug}
        brandSlug={brandSlug}
        searchQuery={searchQuery}
      />
    </StorefrontPageShell>
  );
}
