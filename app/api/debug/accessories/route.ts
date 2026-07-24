import { NextResponse } from "next/server";
import { graphqlRequest } from "@/lib/graphql/client";
import { ACCESSORIES_BY_CATEGORY_QUERY } from "@/lib/graphql/queries/products";
import type { WooAccessoriesByCategoryResponse } from "@/lib/graphql/types";

/**
 * Debug endpoint to verify recommended accessories (tilbehør) query.
 * GET /api/debug/accessories
 *
 * Returns JSON with:
 * - categorySlug: slug used for the query
 * - categoryFound: whether a category with that slug was returned
 * - count: number of products in that category
 * - productSlugs: list of product slugs returned
 * - error: present only if the request failed
 *
 * Only enabled when NEXT_PUBLIC_DEBUG_ACCESSORIES=true or NODE_ENV=development.
 */
export async function GET() {
  const slug =
    typeof process.env.NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG === "string"
      ? process.env.NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG.trim()
      : "tilbehor";

  const allowDebug =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG_ACCESSORIES === "true";

  if (!allowDebug) {
    return NextResponse.json(
      { error: "Debug not enabled. Set NEXT_PUBLIC_DEBUG_ACCESSORIES=true or run in development." },
      { status: 403 }
    );
  }

  try {
    const data = await graphqlRequest<WooAccessoriesByCategoryResponse>(
      ACCESSORIES_BY_CATEGORY_QUERY,
      { categorySlug: slug, first: 6 }
    );

    const firstCategory = data.productCategories?.nodes?.[0];
    const nodes = firstCategory?.products?.nodes ?? [];
    const categoryFound = !!firstCategory;

    return NextResponse.json({
      categorySlug: slug,
      categoryFound,
      count: nodes.length,
      productSlugs: nodes.map((n) => n.slug),
      productNames: nodes.map((n) => n.name),
      hint: !categoryFound
        ? "No category with this slug. Open /api/debug/accessories/categories to list all category slugs and set NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG in .env.local"
        : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      {
        categorySlug: slug,
        categoryFound: false,
        count: 0,
        productSlugs: [],
        productNames: [],
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 200 }
    );
  }
}
