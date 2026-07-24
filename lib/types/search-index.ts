import type { SearchProduct } from "@/lib/types/search-product";

export const SEARCH_INDEX_SCHEMA_VERSION = 1;

export type SearchIndexPayload = {
  version: number;
  generatedAt: string;
  products: SearchProduct[];
};
