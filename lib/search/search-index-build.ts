import "server-only";

import { getSearchProducts } from "@/lib/graphql/server-products";
import {
  SEARCH_INDEX_SCHEMA_VERSION,
  type SearchIndexPayload,
} from "@/lib/types/search-index";

export async function buildSearchIndexPayload(): Promise<SearchIndexPayload> {
  const products = await getSearchProducts();

  return {
    version: SEARCH_INDEX_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    products,
  };
}
