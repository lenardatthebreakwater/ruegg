/**
 * WooCommerce / WooGraphQL stock status helpers.
 *
 * GraphQL enum values (WooGraphQL StockStatusEnum), including the custom
 * Peisbutikken status registered via
 * `docs/wordpress/snippets/wordpress-pb-stock-status-graphql.php`.
 */

export type ProductStockStatus =
  | "IN_STOCK"
  | "OUT_OF_STOCK"
  | "ON_BACKORDER"
  | "AVAILABLE_ON_ORDER";

/** Normalize a GraphQL / raw stock status string into our Product type. */
export function normalizeStockStatus(
  value: string | null | undefined
): ProductStockStatus | null {
  const normalized = value?.trim().toUpperCase().replace(/-/g, "_") ?? "";
  if (
    normalized === "IN_STOCK" ||
    normalized === "OUT_OF_STOCK" ||
    normalized === "ON_BACKORDER" ||
    normalized === "AVAILABLE_ON_ORDER"
  ) {
    return normalized;
  }
  // Woo DB slugs sometimes appear if a layer bypasses the enum.
  if (normalized === "INSTOCK") return "IN_STOCK";
  if (normalized === "OUTOFSTOCK") return "OUT_OF_STOCK";
  if (normalized === "ONBACKORDER") return "ON_BACKORDER";
  return null;
}

/** Only hard out-of-stock blocks add-to-cart. */
export function isProductOutOfStock(
  status: ProductStockStatus | null | undefined
): boolean {
  return status === "OUT_OF_STOCK";
}

/**
 * Short Norwegian label for UI badges / secondary copy.
 * Returns null when no extra label is needed (normal in-stock).
 */
export function getStockStatusLabelNb(
  status: ProductStockStatus | null | undefined
): string | null {
  switch (status) {
    case "OUT_OF_STOCK":
      return "Utsolgt";
    case "ON_BACKORDER":
      return "Restordre";
    case "AVAILABLE_ON_ORDER":
      return "Tilgjengelig på bestilling";
    default:
      return null;
  }
}

/** Primary CTA label for add-to-cart buttons. */
export function getAddToCartLabelNb(
  status: ProductStockStatus | null | undefined
): string {
  if (status === "OUT_OF_STOCK") return "Utsolgt";
  return "Legg i handlekurv";
}
