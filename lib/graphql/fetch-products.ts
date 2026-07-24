import { graphqlRequest } from "@/lib/graphql/client";
import {
  ACCESSORIES_BY_CATEGORY_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  PRODUCTS_QUERY,
} from "@/lib/graphql/queries/products";
import type {
  WooAccessoriesByCategoryResponse,
  WooProductBySlugResponse,
  WooProductsResponse,
} from "@/lib/graphql/types";
import { enrichProductsEnergyMetaFromWooNodes } from "@/lib/graphql/enrich-energy-meta";
import { mapWooProductToProduct } from "@/lib/graphql/map-woo-product";
import type { Product } from "@/lib/types/product";

/**
 * Category slug for accessories (tilbehør).
 * WordPress has "peistilbehor" (Peistilbehør, 394) and "tilbehorpeis" (Tilbehør til peis, 25).
 * Override with NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG in .env.local if needed.
 */
const DEFAULT_ACCESSORIES_CATEGORY_SLUG = "peistilbehor";

function getAccessoriesCategorySlug(): string {
  if (typeof process.env.NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG === "string") {
    return process.env.NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG.trim();
  }
  return DEFAULT_ACCESSORIES_CATEGORY_SLUG;
}

/**
 * Fetch a single product by slug from WordPress/WooCommerce GraphQL.
 * Returns null if not found or on network/API error (so the page can show 404).
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const normalizedSlug = decodeURIComponent(slug).trim();
  if (!normalizedSlug) return null;
  try {
    const data = await graphqlRequest<WooProductBySlugResponse>(
      PRODUCT_BY_SLUG_QUERY,
      { slug: normalizedSlug }
    );
    if (!data.product) return null;
    const product = mapWooProductToProduct(data.product);
    await enrichProductsEnergyMetaFromWooNodes([product], [data.product]);
    return product;
  } catch {
    return null;
  }
}

const DEBUG_ACCESSORIES =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_DEBUG_ACCESSORIES === "true";

/**
 * Fetch recommended accessories from the tilbehør (or configured) category.
 * On error or empty category, returns [] so the product page can use a fallback.
 * In development (or when NEXT_PUBLIC_DEBUG_ACCESSORIES=true), logs result to the server console.
 */
export async function getRecommendedAccessories(limit = 6): Promise<Product[]> {
  const categorySlug = getAccessoriesCategorySlug();
  try {
    const data = await graphqlRequest<WooAccessoriesByCategoryResponse>(
      ACCESSORIES_BY_CATEGORY_QUERY,
      { categorySlug, first: limit }
    );
    const firstCategory = data.productCategories?.nodes?.[0];
    const nodes = firstCategory?.products?.nodes ?? [];
    const products = nodes.map(mapWooProductToProduct);
    await enrichProductsEnergyMetaFromWooNodes(products, nodes);

    if (DEBUG_ACCESSORIES) {
      const categoryFound = !!firstCategory;
      console.log("[accessories]", {
        categorySlug,
        categoryFound,
        requested: limit,
        returned: products.length,
        slugs: products.map((p) => p.slug),
      });
    }

    return products;
  } catch (err) {
    if (DEBUG_ACCESSORIES) {
      console.error("[accessories] Error fetching recommended accessories:", {
        categorySlug,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return [];
  }
}

/**
 * Fetch similar products (other products excluding the one with the given slug).
 * Used for "You might also like" on the product detail page.
 * On network/timeout errors returns [] so the product page still renders.
 */
export async function getSimilarProducts(
  excludeSlug: string,
  limit: number
): Promise<Product[]> {
  try {
    const data = await graphqlRequest<WooProductsResponse>(PRODUCTS_QUERY, {
      first: limit + 20,
    });
    const nodes = data.products?.nodes ?? [];
    const filtered = nodes
      .filter((n) => n.slug !== excludeSlug)
      .slice(0, limit);
    const products = filtered.map(mapWooProductToProduct);
    await enrichProductsEnergyMetaFromWooNodes(products, filtered);
    return products;
  } catch {
    return [];
  }
}
