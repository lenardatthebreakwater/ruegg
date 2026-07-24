import "server-only";

import {
  BLOG_CATEGORY_SLUGS,
  isLokalmonteringSlug,
  type BlogCategorySlug,
} from "@/lib/blog/constants";
import { mapWpPostToBlogPost } from "@/lib/content-mapping/blog-post-mapper";
import type { BlogPost } from "@/lib/blog/types";
import { graphqlRequest } from "@/lib/graphql/client";
import {
  PEISMONTERING_POSTS_QUERY,
  POSTS_BY_CATEGORY_QUERY,
  POST_BY_SLUG_QUERY,
  RELATED_POSTS_BY_CATEGORY_QUERY,
} from "@/lib/graphql/queries/posts";
import type {
  WpPostBySlugResponse,
  WpPostNode,
  WpPostsByCategoryResponse,
} from "@/lib/graphql/types";
import { getWordpressSiteUrl } from "@/lib/wordpress-urls";

const DEFAULT_POSTS_REVALIDATE_SECONDS = 60 * 10;
const MAX_PAGE_SIZE = 100;
const CUSTOM_FIELD_KEY_PATTERN =
  /^(blog(?:heading|paragraph|image|imagetext)[-_]?\d+|jetgallery[_-]?1|section(?:heading|body)[-_]?\d+)$/i;

export const POSTS_CACHE_TAG = "posts";
export const PEISMONTERING_POSTS_CACHE_TAG = "posts:peismontering";
export const BLOG_POSTS_CACHE_TAG = "posts:blog";
const POST_CACHE_TAG_PREFIX = "post:";

export function getPostCacheTag(slug: string): string {
  return `${POST_CACHE_TAG_PREFIX}${slug}`;
}

function getPostsRevalidateSeconds(): number {
  const raw = process.env.POSTS_REVALIDATE_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_POSTS_REVALIDATE_SECONDS;
}

function normalizeSlug(value: string): string {
  return decodeURIComponent(value).trim().replace(/^\/+|\/+$/g, "");
}

function isPeismonteringPost(post: WpPostNode | null): post is WpPostNode {
  if (!post) return false;
  const categories = post.categories?.nodes ?? [];
  return categories.some(
    (category) => category.slug.toLowerCase() === "peismontering"
  );
}

function postHasBlogCategory(post: WpPostNode): boolean {
  const categories = post.categories?.nodes ?? [];
  return categories.some((category) =>
    (BLOG_CATEGORY_SLUGS as readonly string[]).includes(
      category.slug.toLowerCase()
    )
  );
}

function appendMatchingFields(
  source: Record<string, unknown> | null | undefined,
  target: Record<string, unknown>
) {
  if (!source) return;
  for (const [key, value] of Object.entries(source)) {
    if (!CUSTOM_FIELD_KEY_PATTERN.test(key)) continue;
    target[key] = value;
  }
}

function normalizeRestRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

async function getCustomFieldsFromRest(
  slug: string,
  revalidate: number,
  extraTags: string[] = []
): Promise<Record<string, unknown> | null> {
  const siteUrl = getWordpressSiteUrl();
  if (!siteUrl) return null;

  try {
    const endpoint = new URL("/wp-json/wp/v2/posts", siteUrl);
    endpoint.searchParams.set("slug", slug);
    endpoint.searchParams.set("per_page", "1");

    const response = await fetch(endpoint.toString(), {
      cache: "force-cache",
      next: {
        revalidate,
        tags: [POSTS_CACHE_TAG, getPostCacheTag(slug), ...extraTags],
      },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) return null;

    const entry = normalizeRestRecord(payload[0]);
    if (!entry) return null;

    const customFields: Record<string, unknown> = {};
    appendMatchingFields(entry, customFields);
    appendMatchingFields(normalizeRestRecord(entry.meta), customFields);
    appendMatchingFields(normalizeRestRecord(entry.acf), customFields);

    if (Object.keys(customFields).length === 0) return null;
    return await resolveMediaIdsInCustomFields(
      customFields,
      revalidate,
      extraTags
    );
  } catch {
    return null;
  }
}

function parseMediaId(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

/** Basic auth for WP REST media that is not publicly listable (orphaned attachments). */
function getWordpressRestAuthHeaders(): HeadersInit | undefined {
  const user = process.env.WP_USER?.trim();
  const password = process.env.WP_APP_PASSWORD?.replace(/\s+/g, "").trim();
  if (!user || !password) return undefined;
  const token = Buffer.from(`${user}:${password}`, "utf8").toString("base64");
  return { Authorization: `Basic ${token}` };
}

function isHttpUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

async function resolveMediaIdsInCustomFields(
  customFields: Record<string, unknown>,
  revalidate: number,
  extraTags: string[] = []
): Promise<Record<string, unknown>> {
  const siteUrl = getWordpressSiteUrl();
  if (!siteUrl) return customFields;

  const mediaIds = new Set<number>();
  for (const [key, value] of Object.entries(customFields)) {
    if (!/^blogimage[-_]?\d+$/i.test(key)) continue;
    const mediaId = parseMediaId(value);
    if (mediaId) mediaIds.add(mediaId);
  }

  if (mediaIds.size === 0) return customFields;

  const mapped = { ...customFields };

  try {
    const endpoint = new URL("/wp-json/wp/v2/media", siteUrl);
    endpoint.searchParams.set("include", [...mediaIds].join(","));
    endpoint.searchParams.set("per_page", String(mediaIds.size));
    endpoint.searchParams.set("_fields", "id,source_url,alt_text");

    const authHeaders = getWordpressRestAuthHeaders();
    const response = await fetch(endpoint.toString(), {
      headers: authHeaders,
      cache: "force-cache",
      next: {
        revalidate,
        tags: [POSTS_CACHE_TAG, ...extraTags],
      },
    });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload)) {
        const idToUrl = new Map<number, string>();
        for (const item of payload) {
          const record = normalizeRestRecord(item);
          if (!record) continue;
          const id =
            typeof record.id === "number" && Number.isInteger(record.id)
              ? record.id
              : null;
          const sourceUrl =
            typeof record.source_url === "string" &&
            record.source_url.trim().length > 0
              ? record.source_url.trim()
              : null;
          if (id && sourceUrl) idToUrl.set(id, sourceUrl);
        }

        for (const [key, value] of Object.entries(mapped)) {
          if (!/^blogimage[-_]?\d+$/i.test(key)) continue;
          const mediaId = parseMediaId(value);
          if (!mediaId) continue;
          const sourceUrl = idToUrl.get(mediaId);
          if (sourceUrl) mapped[key] = sourceUrl;
        }
      }
    }
  } catch {
    // Fall through to strip unresolved IDs below.
  }

  // Never leave bare attachment IDs in place — next/image treats them as src and 500s.
  for (const [key, value] of Object.entries(mapped)) {
    if (!/^blogimage[-_]?\d+$/i.test(key)) continue;
    if (parseMediaId(value) && !isHttpUrl(value)) {
      mapped[key] = "";
    }
  }

  return mapped;
}

async function fetchPostsByCategoryName(
  categoryName: string,
  options?: { first?: number; tags?: string[] }
): Promise<WpPostNode[]> {
  const first = Math.min(
    Math.max(1, Math.trunc(options?.first ?? MAX_PAGE_SIZE)),
    MAX_PAGE_SIZE
  );
  const revalidate = getPostsRevalidateSeconds();
  const tags = options?.tags ?? [POSTS_CACHE_TAG];
  const allPosts: WpPostNode[] = [];
  let after: string | null = null;

  while (true) {
    const data: WpPostsByCategoryResponse =
      await graphqlRequest<WpPostsByCategoryResponse>(
        POSTS_BY_CATEGORY_QUERY,
        { categoryName, first, after },
        {
          cache: "force-cache",
          next: { revalidate, tags },
        }
      );

    const nodes = data.posts?.nodes ?? [];
    allPosts.push(...nodes);
    const pageInfo = data.posts?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  return allPosts;
}

export async function getPeismonteringPosts(options?: {
  first?: number;
}): Promise<WpPostNode[]> {
  const first = Math.min(
    Math.max(1, Math.trunc(options?.first ?? MAX_PAGE_SIZE)),
    MAX_PAGE_SIZE
  );
  const revalidate = getPostsRevalidateSeconds();
  const allPosts: WpPostNode[] = [];
  let after: string | null = null;

  while (true) {
    const data: WpPostsByCategoryResponse =
      await graphqlRequest<WpPostsByCategoryResponse>(
        PEISMONTERING_POSTS_QUERY,
        { first, after },
        {
          cache: "force-cache",
          next: {
            revalidate,
            tags: [POSTS_CACHE_TAG, PEISMONTERING_POSTS_CACHE_TAG],
          },
        }
      );

    const nodes = data.posts?.nodes ?? [];
    allPosts.push(...nodes);
    const pageInfo = data.posts?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  return allPosts.filter(isPeismonteringPost);
}

export async function getPeismonteringPostBySlug(
  slug: string
): Promise<WpPostNode | null> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  const revalidate = getPostsRevalidateSeconds();
  const data = await graphqlRequest<WpPostBySlugResponse>(
    POST_BY_SLUG_QUERY,
    { slug: normalizedSlug },
    {
      cache: "force-cache",
      next: {
        revalidate,
        tags: [
          POSTS_CACHE_TAG,
          PEISMONTERING_POSTS_CACHE_TAG,
          getPostCacheTag(normalizedSlug),
        ],
      },
    }
  );

  if (!isPeismonteringPost(data.post)) return null;

  const customFields = await getCustomFieldsFromRest(
    normalizedSlug,
    revalidate,
    [PEISMONTERING_POSTS_CACHE_TAG]
  );
  if (!customFields) return data.post;

  return {
    ...data.post,
    customFields: {
      ...(data.post.customFields ?? {}),
      ...customFields,
    },
  };
}

/**
 * Editorial blog posts from the four blog categories, excluding lokalmontering
 * URL slugs. Sorted by date descending. Deduped by databaseId.
 */
export async function getBlogPosts(options?: {
  category?: BlogCategorySlug;
}): Promise<BlogPost[]> {
  const categories = options?.category
    ? [options.category]
    : [...BLOG_CATEGORY_SLUGS];

  const pages = await Promise.all(
    categories.map((categoryName) =>
      fetchPostsByCategoryName(categoryName, {
        tags: [POSTS_CACHE_TAG, BLOG_POSTS_CACHE_TAG],
      })
    )
  );

  const byId = new Map<string, WpPostNode>();
  for (const nodes of pages) {
    for (const post of nodes) {
      if (!postHasBlogCategory(post)) continue;
      if (isLokalmonteringSlug(post.slug)) continue;
      const key = String(post.databaseId ?? post.id);
      if (!byId.has(key)) byId.set(key, post);
    }
  }

  const revalidate = getPostsRevalidateSeconds();
  const hydrated = await Promise.all(
    [...byId.values()].map(async (post) => {
      const customFields = await getCustomFieldsFromRest(
        post.slug,
        revalidate,
        [BLOG_POSTS_CACHE_TAG]
      );
      if (!customFields) return post;
      return {
        ...post,
        customFields: {
          ...(post.customFields ?? {}),
          ...customFields,
        },
      };
    })
  );

  const mapped = hydrated
    .map((post) => mapWpPostToBlogPost(post))
    .filter((post): post is BlogPost => post != null);

  mapped.sort((a, b) => {
    const aTime = a.date ? Date.parse(a.date) : 0;
    const bTime = b.date ? Date.parse(b.date) : 0;
    return bTime - aTime;
  });

  return mapped;
}

/** Editorial blog post by slug (hydrates JetEngine custom fields via REST). */
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug || isLokalmonteringSlug(normalizedSlug)) return null;

  const revalidate = getPostsRevalidateSeconds();
  const data = await graphqlRequest<WpPostBySlugResponse>(
    POST_BY_SLUG_QUERY,
    { slug: normalizedSlug },
    {
      cache: "force-cache",
      next: {
        revalidate,
        tags: [
          POSTS_CACHE_TAG,
          BLOG_POSTS_CACHE_TAG,
          getPostCacheTag(normalizedSlug),
        ],
      },
    }
  );

  if (!data.post || !postHasBlogCategory(data.post)) return null;

  const customFields = await getCustomFieldsFromRest(
    normalizedSlug,
    revalidate,
    [BLOG_POSTS_CACHE_TAG]
  );

  const hydrated: WpPostNode = customFields
    ? {
        ...data.post,
        customFields: {
          ...(data.post.customFields ?? {}),
          ...customFields,
        },
      }
    : data.post;

  return mapWpPostToBlogPost(hydrated);
}

/** Slugs for generateStaticParams on root editorial singles. */
export async function getBlogPostStaticParams(): Promise<
  Array<{ slug: string }>
> {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

const RELATED_POSTS_PER_CATEGORY = 4;
const RELATED_POSTS_LIMIT = 2;

type RelatedPostsByCategoryResponse = {
  posts?: {
    nodes?: WpPostNode[];
  };
};

/**
 * Lightweight related posts for blog singles: one small page per category,
 * no REST custom-field hydration, no full-archive pagination.
 */
export async function getRelatedBlogPosts(
  excludeSlug: string,
  limit = RELATED_POSTS_LIMIT
): Promise<BlogPost[]> {
  const normalizedExclude = normalizeSlug(excludeSlug);
  const take = Math.min(Math.max(1, Math.trunc(limit)), 6);
  const revalidate = getPostsRevalidateSeconds();

  const pages = await Promise.all(
    BLOG_CATEGORY_SLUGS.map((categoryName) =>
      graphqlRequest<RelatedPostsByCategoryResponse>(
        RELATED_POSTS_BY_CATEGORY_QUERY,
        { categoryName, first: RELATED_POSTS_PER_CATEGORY },
        {
          cache: "force-cache",
          next: {
            revalidate,
            tags: [POSTS_CACHE_TAG, BLOG_POSTS_CACHE_TAG],
          },
        }
      ).then((data) => data.posts?.nodes ?? [])
    )
  );

  const byId = new Map<string, WpPostNode>();
  for (const nodes of pages) {
    for (const post of nodes) {
      if (!postHasBlogCategory(post)) continue;
      if (isLokalmonteringSlug(post.slug)) continue;
      if (normalizeSlug(post.slug) === normalizedExclude) continue;
      const key = String(post.databaseId ?? post.id);
      if (!byId.has(key)) byId.set(key, post);
    }
  }

  const mapped = [...byId.values()]
    .map((post) => mapWpPostToBlogPost(post))
    .filter((post): post is BlogPost => post != null);

  mapped.sort((a, b) => {
    const aTime = a.date ? Date.parse(a.date) : 0;
    const bTime = b.date ? Date.parse(b.date) : 0;
    return bTime - aTime;
  });

  return mapped.slice(0, take);
}
