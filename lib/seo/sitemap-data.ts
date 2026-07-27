import "server-only";

import { unstable_cache } from "next/cache";

import { buildLokalmonteringPublicPath } from "@/lib/content-mapping/local-montering-post-mapper";
import { graphqlRequest } from "@/lib/graphql/client";
import { PAGES_SITEMAP_QUERY } from "@/lib/graphql/queries/pages";
import {
  PRODUCT_BRANDS_SITEMAP_QUERY_BASE,
  PRODUCT_CATEGORIES_SITEMAP_QUERY_BASE,
  PRODUCTS_SITEMAP_QUERY,
} from "@/lib/graphql/queries/products";
import { getBlogPosts, getPeismonteringPosts } from "@/lib/graphql/server-posts";
import {
  buildBrandHref,
  buildCategoryHref,
  buildProductHref,
  buildReservedelerItemHref,
} from "@/lib/products/paths";
import { getReservedelerItems } from "@/lib/reservedeler/server-items";

/** How often sitemap data (and the cached XML routes) refresh. */
export const SITEMAP_REVALIDATE_SECONDS = 60 * 60;

/** Purged by the product-save webhook so new/removed products appear fast. */
export const SITEMAP_CACHE_TAG = "sitemap";

/** Google allows 50k URLs per file; 200 matches Rank Math chunk size. */
export const PRODUCTS_PER_SITEMAP = 200;

const TERMS_PER_PAGE = 100;

export type SitemapEntry = {
  /** Site-relative path with trailing slash, e.g. "/produkt/foo/". */
  path: string;
  /** ISO date (YYYY-MM-DD). Only set when we actually know it. */
  lastModified?: string;
  /** Absolute image URLs for the image sitemap extension. */
  images?: string[];
};

/** Indexable static routes served by this app (account/demo pages excluded). */
const STATIC_PAGE_PATHS: string[] = [
  "/",
  "/shop/",
  "/om-oss/",
  // Spare parts / services (still routed; not linked from Rüegg shell)
  "/reservedeler/",
  "/aduro-deler/",
  "/dovre-deler/",
  "/nordpeis-deler/",
  "/montering/",
  "/piperehabilitering/",
  "/category/peismontering/",
  "/fyringsveiledning/",
  // Info & policies
  "/kontakt-oss/",
  "/fraktbetingelser/",
  "/salgsbetingelser/",
  "/personvern/",
  "/resurs-bank/",
  "/blog/",
];

const EXCLUDED_CATEGORY_SLUGS = new Set([
  "uncategorized",
  "uncategorized-no",
  "ukategorisert",
  "visning",
]);

function isExcludedCategorySlug(slug: string): boolean {
  if (EXCLUDED_CATEGORY_SLUGS.has(slug)) return true;
  if (slug.endsWith("-utvalgte")) return true;
  // Hub slices under peis-* (not peisinnsats / peistilbehor — different slugs).
  if (slug.startsWith("peis-")) return true;
  return false;
}

type SitemapProductNode = {
  slug?: string | null;
  modified?: string | null;
  catalogVisibility?: string | null;
  image?: { sourceUrl?: string | null } | null;
};

type SitemapProductsResponse = {
  products?: {
    nodes?: SitemapProductNode[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
};

type SitemapTermNode = {
  slug?: string | null;
  count?: number | null;
  modified?: string | null;
};

type TermsPageInfo = { hasNextPage?: boolean; endCursor?: string | null };

type CategoriesSitemapResponse = {
  productCategories?: {
    nodes?: SitemapTermNode[];
    pageInfo?: TermsPageInfo;
  };
};

type BrandsSitemapResponse = {
  productBrands?: {
    nodes?: SitemapTermNode[];
    pageInfo?: TermsPageInfo;
  };
};

type SitemapWpPageNode = {
  slug?: string | null;
  uri?: string | null;
  modified?: string | null;
};

type PagesSitemapResponse = {
  pages?: {
    nodes?: SitemapWpPageNode[];
    pageInfo?: TermsPageInfo;
  };
};

/** Normalizes WPGraphQL timestamps ("2026-06-12T08:33:21") to YYYY-MM-DD. */
function toLastmodDate(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim() ?? "";
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : undefined;
}

/** WP `uri` → site path with trailing slash (`/` for the front page). */
function normalizeWpPagePath(
  uri: string | null | undefined,
  slug?: string | null
): string | null {
  let path = (uri ?? "").trim();
  if (!path) {
    const s = slug?.trim() ?? "";
    if (!s) return null;
    path = `/${s}/`;
  }
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path !== "/" && !path.endsWith("/")) path = `${path}/`;
  return path;
}

/**
 * Maps legacy WordPress page URIs (and slugs) to real `modified` dates.
 * Next.js static routes reuse these paths; content still lives as WP pages.
 */
async function fetchWpPageLastmodByPath(): Promise<Map<string, string>> {
  const byPath = new Map<string, string>();
  let after: string | null = null;

  try {
    while (true) {
      const data: PagesSitemapResponse = await graphqlRequest<PagesSitemapResponse>(
        PAGES_SITEMAP_QUERY,
        { first: 100, after }
      );

      for (const node of data.pages?.nodes ?? []) {
        const lastModified = toLastmodDate(node.modified);
        if (!lastModified) continue;

        const path = normalizeWpPagePath(node.uri, node.slug);
        if (path) byPath.set(path, lastModified);

        const slug = node.slug?.trim();
        if (slug) {
          const slugPath = normalizeWpPagePath(`/${slug}/`, slug);
          if (slugPath && !byPath.has(slugPath)) {
            byPath.set(slugPath, lastModified);
          }
        }
      }

      const pageInfo = data.pages?.pageInfo;
      if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
      after = pageInfo.endCursor;
    }
  } catch (error) {
    console.error("sitemap: failed to load WordPress page modified dates", error);
  }

  return byPath;
}

function isHiddenProduct(node: SitemapProductNode): boolean {
  const visibility =
    node.catalogVisibility?.trim().toLocaleLowerCase("nb-NO") ?? "";
  return visibility === "hidden";
}

function absoluteImageUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

async function fetchAllSitemapProducts(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  const seenSlugs = new Set<string>();
  let after: string | null = null;

  while (true) {
    const data: SitemapProductsResponse = await graphqlRequest<SitemapProductsResponse>(
      PRODUCTS_SITEMAP_QUERY,
      {
        first: 100,
        after,
      }
    );

    const nodes = data.products?.nodes ?? [];
    for (const node of nodes) {
      const slug = node.slug?.trim();
      if (!slug || seenSlugs.has(slug) || isHiddenProduct(node)) continue;
      seenSlugs.add(slug);

      const image = absoluteImageUrl(node.image?.sourceUrl);
      entries.push({
        path: buildProductHref(slug),
        lastModified: toLastmodDate(node.modified),
        ...(image ? { images: [image] } : {}),
      });
    }

    const pageInfo = data.products?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  return entries;
}

/**
 * Cached so the sitemap index and every product chunk share one fetch per
 * revalidation window instead of re-paginating the whole catalog each time.
 */
export const getProductSitemapEntries = unstable_cache(
  fetchAllSitemapProducts,
  ["sitemap-products"],
  { revalidate: SITEMAP_REVALIDATE_SECONDS, tags: [SITEMAP_CACHE_TAG] }
);

async function fetchAllCategoryTerms(): Promise<SitemapTermNode[]> {
  const nodes: SitemapTermNode[] = [];
  let after: string | null = null;

  while (true) {
    const data: CategoriesSitemapResponse = await graphqlRequest<CategoriesSitemapResponse>(
      PRODUCT_CATEGORIES_SITEMAP_QUERY_BASE,
      {
        first: TERMS_PER_PAGE,
        after,
      }
    );

    nodes.push(...(data.productCategories?.nodes ?? []));
    const pageInfo = data.productCategories?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  return nodes;
}

async function fetchAllBrandTerms(): Promise<SitemapTermNode[]> {
  const nodes: SitemapTermNode[] = [];
  let after: string | null = null;

  while (true) {
    const data: BrandsSitemapResponse = await graphqlRequest<BrandsSitemapResponse>(
      PRODUCT_BRANDS_SITEMAP_QUERY_BASE,
      {
        first: TERMS_PER_PAGE,
        after,
      }
    );

    nodes.push(...(data.productBrands?.nodes ?? []));
    const pageInfo = data.productBrands?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  return nodes;
}

export async function getTermSitemapEntries(): Promise<SitemapEntry[]> {
  const [categories, brands] = await Promise.all([
    fetchAllCategoryTerms(),
    fetchAllBrandTerms(),
  ]);

  const entries: SitemapEntry[] = [];
  const seenPaths = new Set<string>();

  for (const node of categories) {
    const slug = node.slug?.trim();
    if (!slug || isExcludedCategorySlug(slug)) continue;
    if ((node.count ?? 0) <= 0) continue;
    const path = buildCategoryHref(slug);
    if (seenPaths.has(path)) continue;
    seenPaths.add(path);
    entries.push({
      path,
    });
  }

  for (const node of brands) {
    const slug = node.slug?.trim();
    if (!slug) continue;
    if ((node.count ?? 0) <= 0) continue;
    const path = buildBrandHref(slug);
    if (seenPaths.has(path)) continue;
    seenPaths.add(path);
    entries.push({
      path,
    });
  }

  return entries;
}

export async function getReservedelerSitemapEntries(): Promise<SitemapEntry[]> {
  const items = await getReservedelerItems();
  const entries: SitemapEntry[] = [];
  const seenPaths = new Set<string>();

  for (const item of items) {
    const path = buildReservedelerItemHref(item.brandSlug, item.itemSlug);
    // Items without a known family map to the hub page; skip those.
    if (path === "/reservedeler/" || seenPaths.has(path)) continue;
    seenPaths.add(path);

    const image = absoluteImageUrl(item.imageUrl);
    // Reservedeler REST payload has no modified date; omit lastmod.
    entries.push({ path, ...(image ? { images: [image] } : {}) });
  }

  return entries;
}

async function getLokalmonteringSitemapEntries(): Promise<SitemapEntry[]> {
  try {
    const posts = await getPeismonteringPosts();
    return posts
      .map((post) => {
        const image = absoluteImageUrl(post.featuredImage?.node?.sourceUrl);
        return {
          path: buildLokalmonteringPublicPath(post.slug),
          lastModified: toLastmodDate(post.modified ?? post.date),
          ...(image ? { images: [image] } : {}),
        };
      })
      // /lokalmontering/* is redirected to /category/peismontering/ in
      // next.config; only the rewritten /peismontering-i-* URLs are live.
      .filter(
        (entry) =>
          !entry.path.startsWith("/lokalmontering/") &&
          /^\/peismontering-(i|pa)-/i.test(entry.path)
      );
  } catch (error) {
    console.error("sitemap: failed to load lokalmontering posts", error);
    return [];
  }
}

async function getBlogSitemapEntries(): Promise<SitemapEntry[]> {
  try {
    const posts = await getBlogPosts();
    return posts.map((post) => {
      const image = absoluteImageUrl(post.featuredImage?.url);
      return {
        path: post.path,
        lastModified: toLastmodDate(post.modified ?? post.date),
        ...(image ? { images: [image] } : {}),
      };
    });
  } catch (error) {
    console.error("sitemap: failed to load blog posts", error);
    return [];
  }
}

export async function getPageSitemapEntries(): Promise<SitemapEntry[]> {
  const [lokalmontering, blog, wpPageLastmod] = await Promise.all([
    getLokalmonteringSitemapEntries(),
    getBlogSitemapEntries(),
    fetchWpPageLastmodByPath(),
  ]);
  const staticEntries: SitemapEntry[] = STATIC_PAGE_PATHS.map((path) => {
    const lastModified = wpPageLastmod.get(path);
    return lastModified ? { path, lastModified } : { path };
  });
  return [...staticEntries, ...lokalmontering, ...blog];
}

function maxLastmod(entries: SitemapEntry[]): string | undefined {
  let max: string | undefined;
  for (const entry of entries) {
    if (entry.lastModified && (!max || entry.lastModified > max)) {
      max = entry.lastModified;
    }
  }
  return max;
}

/** Splits entries into Rank Math-sized chunks; returns [] when there are none. */
export function chunkEntries(entries: SitemapEntry[]): SitemapEntry[][] {
  if (entries.length === 0) return [];
  const chunks: SitemapEntry[][] = [];
  for (let i = 0; i < entries.length; i += PRODUCTS_PER_SITEMAP) {
    chunks.push(entries.slice(i, i + PRODUCTS_PER_SITEMAP));
  }
  return chunks;
}

export type SitemapManifestItem = {
  /** Child sitemap file name, e.g. "products-1.xml". */
  name: string;
  lastModified?: string;
};

/**
 * Lists child sitemaps for /sitemap.xml. Omits empty children from the index
 * (404 only for unknown names; known empty names return an empty urlset).
 */
async function safeSitemapEntries(
  label: string,
  load: () => Promise<SitemapEntry[]>
): Promise<SitemapEntry[]> {
  try {
    return await load();
  } catch (error) {
    console.error(`sitemap: failed to load ${label}`, error);
    return [];
  }
}

export async function getSitemapManifest(): Promise<SitemapManifestItem[]> {
  const [products, pages, categories, reservedeler] = await Promise.all([
    safeSitemapEntries("products", getProductSitemapEntries),
    safeSitemapEntries("pages", getPageSitemapEntries),
    safeSitemapEntries("categories", getTermSitemapEntries),
    safeSitemapEntries("reservedeler", getReservedelerSitemapEntries),
  ]);

  const manifest: SitemapManifestItem[] = [
    { name: "pages.xml", lastModified: maxLastmod(pages) },
  ];

  if (categories.length > 0) {
    manifest.push({
      name: "categories.xml",
      lastModified: maxLastmod(categories),
    });
  }

  if (reservedeler.length > 0) {
    manifest.push({
      name: "reservedeler.xml",
      lastModified: maxLastmod(reservedeler),
    });
  }

  for (const [index, chunk] of chunkEntries(products).entries()) {
    manifest.push({
      name: `products-${index + 1}.xml`,
      lastModified: maxLastmod(chunk),
    });
  }

  return manifest;
}

/** Resolves a child sitemap name to its entries; null means unknown (404). */
export async function getSitemapEntriesByName(
  name: string
): Promise<SitemapEntry[] | null> {
  if (name === "pages.xml") {
    return safeSitemapEntries("pages", getPageSitemapEntries);
  }
  if (name === "categories.xml") {
    return safeSitemapEntries("categories", getTermSitemapEntries);
  }
  if (name === "reservedeler.xml") {
    return safeSitemapEntries("reservedeler", getReservedelerSitemapEntries);
  }

  const productChunkMatch = name.match(/^products-(\d+)\.xml$/);
  if (productChunkMatch) {
    const chunkIndex = Number.parseInt(productChunkMatch[1], 10) - 1;
    if (chunkIndex < 0) return null;
    const chunks = chunkEntries(
      await safeSitemapEntries("products", getProductSitemapEntries)
    );
    // Known in-range chunk may be empty only if catalog shrank; out-of-range → 404.
    return chunks[chunkIndex] ?? null;
  }

  return null;
}
