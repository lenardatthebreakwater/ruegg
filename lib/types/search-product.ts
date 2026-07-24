import type { Product } from "@/lib/types/product";

export type SearchProduct = Pick<
  Product,
  "id" | "name" | "slug" | "image" | "brand" | "price" | "sku" | "categories"
>;
