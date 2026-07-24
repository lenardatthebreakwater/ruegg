/**
 * Query options for the product archive (e.g. /shop).
 * Tune these to match your WordPress JetEngine Listing so the same products
 * appear in the same order as on the WordPress site.
 *
 * In JetEngine: Edit the Listing → Query tab → set "Order by" and "Order".
 * Then set the same values here (e.g. Menu order → MENU_ORDER + ASC).
 *
 * @see https://woographql.com/schema/definition/-products-order-by-enum
 * @see https://woographql.com/schema/definition/-product-type-to-product-connection-where-args
 */
export type ProductsOrderByField =
  | "DATE"
  | "MENU_ORDER"
  | "MODIFIED"
  | "NAME"
  | "PRICE"
  | "RATING"
  | "REGULAR_PRICE"
  | "SALE_PRICE"
  | "SLUG"
  | "TOTAL_SALES";

export type ProductsOrder = "ASC" | "DESC";

export type ArchiveProductsWhere = {
  /** e.g. [{ field: "MENU_ORDER", order: "ASC" }] to match JetEngine "Menu order" */
  orderby?: Array<{ field: ProductsOrderByField; order: ProductsOrder }>;
  /** Only published products (recommended) */
  status?: "publish" | "draft" | "pending" | "private";
  /** Limit to a category (use category ID from WordPress) */
  categoryId?: number;
  categoryIdIn?: number[];
  /** Limit to featured products only */
  featured?: boolean;
  /** Include only product slugs (e.g. from a JetEngine manual list) */
  slugIn?: string[];
};

/**
 * Default where args for the archive. Matches a typical JetEngine listing:
 * - Order by menu order (custom order set in WP admin), ascending.
 * - Only published products.
 *
 * Change these to match your JetEngine Listing query settings.
 */
export const DEFAULT_ARCHIVE_PRODUCTS_WHERE: ArchiveProductsWhere = {
  orderby: [{ field: "MENU_ORDER", order: "ASC" }],
  status: "publish",
};
