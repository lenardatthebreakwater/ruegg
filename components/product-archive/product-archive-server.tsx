import { Suspense } from "react";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ProductArchiveLoader } from "@/components/product-archive/product-archive-loader";
import { ProductArchiveSkeleton } from "@/components/product-archive/product-archive-skeleton";
import { aggregateArchiveProducts } from "@/lib/graphql/server-archive-aggregate";
import {
  buildArchiveItemListSchema,
  buildFaqSchema,
} from "@/lib/seo/schema";
import type { FAQItem } from "@/lib/data/homepage";
import type { TermArchiveBottomBlock } from "@/lib/graphql/types";
import type { Product } from "@/lib/types/product";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";

type ProductArchiveServerProps = {
  title: string;
  subtitle?: string;
  bannerImage?: { src: string; alt?: string } | null;
  imageFit?: "cover" | "contain";
  bottomBlocks?: TermArchiveBottomBlock[];
  faqItems?: FAQItem[];
  faqCollectionLabel?: string;
  breadcrumbs: BreadcrumbItem[];
  onSaleOnly?: boolean;
  categorySlug?: string;
  brandSlug?: string;
  reservedelerItemSlug?: string;
  searchQuery?: string;
  /** Skip archive banner when the page already has a hero (sale hubs). */
  hideBanner?: boolean;
};

function filterProductsByBrand(products: Product[], brandSlug?: string): Product[] {
  const normalizedBrandSlug = brandSlug?.trim().toLocaleLowerCase("nb-NO");
  if (!normalizedBrandSlug) return products;

  return products.filter(
    (product) =>
      product.brandSlug?.trim().toLocaleLowerCase("nb-NO") ===
      normalizedBrandSlug
  );
}

function filterProductsByReservedelerItem(
  products: Product[],
  reservedelerItemSlug?: string
): Product[] {
  const normalizedItemSlug = reservedelerItemSlug
    ?.trim()
    .toLocaleLowerCase("nb-NO");
  if (!normalizedItemSlug) return products;

  return products.filter((product) =>
    product.attributeTermSlugs?.some((slug) => slug === normalizedItemSlug)
  );
}

export async function ProductArchiveServer({
  title,
  subtitle,
  bannerImage,
  imageFit = "cover",
  bottomBlocks,
  faqItems,
  faqCollectionLabel,
  breadcrumbs,
  onSaleOnly = false,
  categorySlug,
  brandSlug,
  reservedelerItemSlug,
  searchQuery = "",
  hideBanner = false,
}: ProductArchiveServerProps) {
  let initialProducts: Product[] = [];
  let initialDataProvided = false;

  try {
    initialProducts = filterProductsByBrand(
      filterProductsByReservedelerItem(
        await aggregateArchiveProducts({
          onSaleOnly,
          categorySlug,
          brandSlug,
          reservedelerItemSlug,
        }),
        reservedelerItemSlug
      ),
      brandSlug
    );
    initialDataProvided = true;
  } catch (error) {
    console.error("Failed to load product archive on server render", error);
  }

  // Category-page structured data: ItemList of the products shown on the
  // first page. Skipped for search results (not a stable collection).
  const itemListSchema =
    initialDataProvided && initialProducts.length > 0 && !searchQuery.trim()
      ? buildArchiveItemListSchema({ products: initialProducts })
      : null;

  const faqSchema =
    faqItems && faqItems.length > 0 ? buildFaqSchema(faqItems) : null;

  return (
    <>
      {itemListSchema && <JsonLdScript data={itemListSchema} />}
      {faqSchema && <JsonLdScript data={faqSchema} />}
      {/* Suspense boundary: ProductArchiveLoader reads useSearchParams(),
          which requires one on statically prerendered pages. */}
      <Suspense
        fallback={
          <ProductArchiveSkeleton
            title={title}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
          />
        }
      >
        <ProductArchiveLoader
          title={title}
          subtitle={subtitle}
          bannerImage={bannerImage}
          imageFit={imageFit}
          bottomBlocks={bottomBlocks}
          faqItems={faqItems}
          faqCollectionLabel={faqCollectionLabel}
          breadcrumbs={breadcrumbs}
          onSaleOnly={onSaleOnly}
          categorySlug={categorySlug}
          brandSlug={brandSlug}
          reservedelerItemSlug={reservedelerItemSlug}
          searchQuery={searchQuery}
          initialProducts={initialProducts}
          initialDataProvided={initialDataProvided}
          hideBanner={hideBanner}
        />
      </Suspense>
    </>
  );
}
