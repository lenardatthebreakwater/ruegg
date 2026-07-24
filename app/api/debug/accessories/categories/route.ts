import { NextResponse } from "next/server";
import { graphqlRequest } from "@/lib/graphql/client";
import { PRODUCT_CATEGORIES_LIST_QUERY } from "@/lib/graphql/queries/products";
import type { WooProductCategoriesListResponse } from "@/lib/graphql/types";

/**
 * Debug endpoint to list all WooCommerce product categories (slug, name, product count).
 * GET /api/debug/accessories/categories
 *
 * Use this to find the correct slug for the tilbehør/accessories category, then set
 * NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG in .env.local to that slug.
 *
 * Only enabled when NEXT_PUBLIC_DEBUG_ACCESSORIES=true or NODE_ENV=development.
 */
export async function GET() {
  const allowDebug =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG_ACCESSORIES === "true";

  if (!allowDebug) {
    return NextResponse.json(
      {
        error:
          "Debug not enabled. Set NEXT_PUBLIC_DEBUG_ACCESSORIES=true or run in development.",
      },
      { status: 403 }
    );
  }

  try {
    const data = await graphqlRequest<WooProductCategoriesListResponse>(
      PRODUCT_CATEGORIES_LIST_QUERY,
      { first: 200, after: null }
    );

    const categories = data.productCategories?.nodes ?? [];

    return NextResponse.json({
      message:
        "Set NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG in .env.local to one of the slugs below (e.g. the tilbehør/accessories category).",
      count: categories.length,
      categories: categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        productCount: c.count ?? 0,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 200 }
    );
  }
}
