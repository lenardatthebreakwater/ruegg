import "server-only";

import { NAV_MENUS } from "@/components/navbar/nav-menu-data";
import { graphqlRequest } from "@/lib/graphql/client";
import {
  PRODUCT_BRANDS_LIST_QUERY,
  PRODUCT_CATEGORIES_LIST_QUERY,
  PRODUCTS_SITEMAP_QUERY_BASE,
} from "@/lib/graphql/queries/products";

/**
 * Term / product slugs for build-time prerendering (generateStaticParams).
 * Prefer live WordPress lists; fall back to curated nav data for terms so a
 * build never fails because WordPress is unreachable. Unknown slugs still
 * render on demand (dynamicParams stays enabled).
 */

const TERMS_PER_PAGE = 100;
const PRODUCTS_PER_PAGE = 100;

type TermsPageInfo = { hasNextPage?: boolean; endCursor?: string | null };

type TermsListResponse = {
  productCategories?: {
    nodes?: Array<{ slug?: string | null }>;
    pageInfo?: TermsPageInfo;
  };
  productBrands?: {
    nodes?: Array<{ slug?: string | null }>;
    pageInfo?: TermsPageInfo;
  };
};

function extractSlugs(nodes: Array<{ slug?: string | null }> | undefined): string[] {
  return [
    ...new Set(
      (nodes ?? [])
        .map((node) => node.slug?.trim() ?? "")
        .filter((slug) => slug.length > 0)
    ),
  ];
}

function navCategorySlugs(): string[] {
  return [
    ...new Set(
      NAV_MENUS.flatMap((menu) => menu.items)
        .map((item) => item.category?.trim() ?? "")
        .filter((slug) => slug.length > 0)
    ),
  ];
}

function navBrandSlugs(): string[] {
  return [
    ...new Set(
      NAV_MENUS.flatMap((menu) => menu.items)
        .map((item) => item.brand?.trim() ?? "")
        .filter((slug) => slug.length > 0)
    ),
  ];
}

async function fetchAllCategorySlugsFromGraphql(): Promise<string[]> {
  const nodes: Array<{ slug?: string | null }> = [];
  let after: string | null = null;

  for (;;) {
    const data: TermsListResponse = await graphqlRequest<TermsListResponse>(
      PRODUCT_CATEGORIES_LIST_QUERY,
      { first: TERMS_PER_PAGE, after }
    );
    nodes.push(...(data.productCategories?.nodes ?? []));
    const pageInfo: TermsPageInfo | undefined = data.productCategories?.pageInfo;
    const nextCursor = pageInfo?.endCursor ?? null;
    if (!pageInfo?.hasNextPage || !nextCursor) break;
    after = nextCursor;
  }

  return extractSlugs(nodes);
}

async function fetchAllBrandSlugsFromGraphql(): Promise<string[]> {
  const nodes: Array<{ slug?: string | null }> = [];
  let after: string | null = null;

  for (;;) {
    const data: TermsListResponse = await graphqlRequest<TermsListResponse>(
      PRODUCT_BRANDS_LIST_QUERY,
      { first: TERMS_PER_PAGE, after }
    );
    nodes.push(...(data.productBrands?.nodes ?? []));
    const pageInfo: TermsPageInfo | undefined = data.productBrands?.pageInfo;
    const nextCursor = pageInfo?.endCursor ?? null;
    if (!pageInfo?.hasNextPage || !nextCursor) break;
    after = nextCursor;
  }

  return extractSlugs(nodes);
}

export async function getAllProductCategorySlugs(): Promise<string[]> {
  try {
    const slugs = await fetchAllCategorySlugsFromGraphql();
    if (slugs.length > 0) return slugs;
  } catch (error) {
    console.error(
      "generateStaticParams: falling back to nav categories, GraphQL list failed",
      error
    );
  }
  return navCategorySlugs();
}

export async function getAllProductBrandSlugs(): Promise<string[]> {
  try {
    const slugs = await fetchAllBrandSlugsFromGraphql();
    if (slugs.length > 0) return slugs;
  } catch (error) {
    console.error(
      "generateStaticParams: falling back to nav brands, GraphQL list failed",
      error
    );
  }
  return navBrandSlugs();
}

type ProductSlugListResponse = {
  products?: {
    nodes?: Array<{
      slug?: string | null;
      catalogVisibility?: string | null;
    }>;
    pageInfo?: TermsPageInfo;
  };
};

function isHiddenCatalogVisibility(value: string | null | undefined): boolean {
  return (value?.trim().toLocaleLowerCase("nb-NO") ?? "") === "hidden";
}

/**
 * All publishable product slugs for PDP prerender at build time.
 * Skips catalog-hidden products (same rule as the sitemap). Returns [] on
 * GraphQL failure so the build still completes; those PDPs stay on-demand.
 */
export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const slugs: string[] = [];
    const seen = new Set<string>();
    let after: string | null = null;

    for (;;) {
      const data: ProductSlugListResponse = await graphqlRequest<ProductSlugListResponse>(
        PRODUCTS_SITEMAP_QUERY_BASE,
        { first: PRODUCTS_PER_PAGE, after }
      );
      for (const node of data.products?.nodes ?? []) {
        const slug = node.slug?.trim() ?? "";
        if (!slug || seen.has(slug) || isHiddenCatalogVisibility(node.catalogVisibility)) {
          continue;
        }
        seen.add(slug);
        slugs.push(slug);
      }
      const pageInfo = data.products?.pageInfo;
      const nextCursor = pageInfo?.endCursor ?? null;
      if (!pageInfo?.hasNextPage || !nextCursor) break;
      after = nextCursor;
    }

    return slugs;
  } catch (error) {
    console.error(
      "generateStaticParams: product slug list failed; PDPs will prerender on demand",
      error
    );
    return [];
  }
}
