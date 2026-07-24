import type { Product } from "@/lib/types/product";
import type { SearchProduct } from "@/lib/types/search-product";

export type ProductArchiveApiResponse = {
  products: Product[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

export type ProductDetailApiResponse = {
  product: Product | null;
};

export type SearchProductsApiResponse = {
  products: SearchProduct[];
};
