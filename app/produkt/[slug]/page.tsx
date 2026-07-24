import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ProductDetailLoader } from "@/components/product-detail";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { getProductDetailBySlug } from "@/lib/graphql/server-products";
import { getAllProductSlugs } from "@/lib/products/archive-static-params";
import {
  buildCategoryHref,
  buildProductHref,
  buildProductsArchiveHref,
} from "@/lib/products/paths";
import { resolveProductDescriptionText } from "@/lib/products/description-cards";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildProductSchema } from "@/lib/seo/schema";

/**
 * Freshness comes primarily from the WordPress product-save webhook
 * (`/api/revalidate/products`), which purges the per-slug cache tag.
 * The long ISR window is only a safety net so Cloudflare does not
 * mass-regenerate the catalog on a short timer.
 */
export const revalidate = 604800; // 7 days

/**
 * Prerender every published (non-hidden) PDP at local build time so the
 * deploy artifact already contains the HTML. That avoids cold first-hit
 * Worker/WordPress work on Cloudflare. New slugs after deploy still render
 * on demand (`dynamicParams` default true).
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function getProductDetailBySlugSafe(slug: string) {
  try {
    return await getProductDetailBySlug(slug);
  } catch (error) {
    // WordPress GraphQL can 500 under full-catalog prerender load. Bail this
    // slug out of static generation so the rest of the build can finish; the
    // PDP will render on first request instead.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.error(
        `PDP prerender deferred to on-demand for "${slug}":`,
        error instanceof Error ? error.message : error
      );
      await connection();
    }
    throw error instanceof Error ? error : new Error("Product detail fetch failed");
  }
}

function resolveProductSocialImage(product: Awaited<ReturnType<typeof getProductDetailBySlug>>["product"]) {
  if (!product) return undefined;

  const galleryImage = product.images?.find((image) => Boolean(image.sourceUrl))?.sourceUrl;
  if (galleryImage) return galleryImage;

  if (product.image?.sourceUrl) return product.image.sourceUrl;
  return undefined;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await getProductDetailBySlugSafe(decodedSlug);

  if (!data.product) {
    return buildPageMetadata({
      title: "Produkt ikke funnet",
      description: "Produktet finnes ikke eller er ikke tilgjengelig.",
      path: buildProductHref(decodedSlug),
    });
  }

  const description =
    resolveProductDescriptionText(data.product) ||
    `Se detaljer for ${data.product.name} hos Peisbutikken.`;
  const socialImage = resolveProductSocialImage(data.product);

  return buildPageMetadata({
    title: data.product.name,
    description,
    path: buildProductHref(data.product.slug),
    socialImage,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await getProductDetailBySlugSafe(decodedSlug);
  const product = data.product;
  if (!product) {
    notFound();
  }
  const primaryCategory = product.categories?.[0] ?? null;

  const currentPath = buildProductHref(decodedSlug);
  const breadcrumbItems = [
    { label: "Hjem", href: "/" },
    { label: "Produkter", href: buildProductsArchiveHref() },
    ...(primaryCategory
      ? [
          {
            label: primaryCategory.name,
            href: buildCategoryHref(primaryCategory.slug),
          },
        ]
      : []),
    { label: product.name },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems, currentPath);
  const productSchema = buildProductSchema(product);

  return (
    <StorefrontPageShell>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={productSchema} />
      <ProductDetailLoader
        slug={decodedSlug}
        initialProduct={product}
        breadcrumbs={breadcrumbItems}
      />
    </StorefrontPageShell>
  );
}
