import type { Product, ProductAttribute } from "@/lib/types/product";

export type MinPeisSummary = {
  slug: string;
  name: string;
  brand: string | null;
  /** Brand taxonomy slug (e.g. aduro) — used for reservedeler matching. */
  brandSlug: string | null;
  image: {
    sourceUrl: string;
    altText?: string;
  } | null;
  ownedSinceDate: string;
  ownedSinceYear: number;
};

export type MinPeisDetail = MinPeisSummary & {
  attributes: ProductAttribute[] | null;
  documents: Array<{ label: string; url: string }> | null;
  dimensions: string | null;
  weight: string | null;
  accessories: Product[];
};

export type MinPeisListPayload = {
  fireplaces: MinPeisSummary[];
  ownedProductSlugs: string[];
};

export type MinPeisDetailPayload = {
  fireplace: MinPeisDetail;
  ownedProductSlugs: string[];
};
