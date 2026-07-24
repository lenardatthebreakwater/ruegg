import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";
import { buildSearchIndexPayload } from "@/lib/search/search-index-build";
import type { SearchIndexPayload } from "@/lib/types/search-index";

const DEFAULT_REVALIDATE_SECONDS = 60 * 60 * 24;
export const SEARCH_INDEX_CACHE_TAG = "products:search:index";

function getSearchIndexRevalidateSeconds(): number {
  const raw = process.env.SEARCH_INDEX_REVALIDATE_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_REVALIDATE_SECONDS;
  }

  return parsed;
}

const loadSearchIndexPayload = unstable_cache(
  async (): Promise<SearchIndexPayload> => buildSearchIndexPayload(),
  ["search-index-payload-v1"],
  {
    revalidate: getSearchIndexRevalidateSeconds(),
    tags: ["products", "products:search", SEARCH_INDEX_CACHE_TAG],
  }
);

export async function readSearchIndexPayload(): Promise<SearchIndexPayload> {
  return loadSearchIndexPayload();
}

export async function rebuildSearchIndexPayload(): Promise<SearchIndexPayload> {
  revalidateTag(SEARCH_INDEX_CACHE_TAG, "max");
  return loadSearchIndexPayload();
}
