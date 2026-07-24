export type ProductArchiveFilters = {
  first: number;
  after?: string | null;
  onSaleOnly: boolean;
  categorySlug?: string | null;
  brandSlug?: string | null;
  reservedelerItemSlug?: string | null;
};

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  account: {
    all: ["account"] as const,
    orders: () => [...queryKeys.account.all, "orders"] as const,
    order: (id: number) => [...queryKeys.account.all, "order", id] as const,
    addresses: () => [...queryKeys.account.all, "addresses"] as const,
    paymentMethods: () =>
      [...queryKeys.account.all, "payment-methods"] as const,
    minPeis: () => [...queryKeys.account.all, "min-peis"] as const,
    minPeisProduct: (slug: string) =>
      [...queryKeys.account.all, "min-peis", slug] as const,
    minPeisReservedeler: (slug: string) =>
      [...queryKeys.account.all, "min-peis", slug, "reservedeler"] as const,
  },
  products: {
    all: ["products"] as const,
    searchIndex: () => [...queryKeys.products.all, "search-index-v2"] as const,
    archive: (filters: ProductArchiveFilters) =>
      [...queryKeys.products.all, "archive", filters] as const,
    detail: (slug: string) => [...queryKeys.products.all, "detail", slug] as const,
    bestSelling: (limit: number) =>
      [...queryKeys.products.all, "best-selling", limit] as const,
    popularFireplaces: (limit: number) =>
      [...queryKeys.products.all, "popular-fireplaces", limit] as const,
  },
} as const;
