"use client";

import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/types/product";

type MinPeisAccessoryCardProps = {
  product: Product;
  owned: boolean;
  listIndex?: number;
};

/** Thin Min peis wrapper — storefront ProductCard + owned «Kjøpt» state. */
export function MinPeisAccessoryCard({
  product,
  owned,
  listIndex,
}: MinPeisAccessoryCardProps) {
  return (
    <ProductCard
      product={product}
      owned={owned}
      compact
      className="w-full"
      listId="min-peis-tilbehor"
      listName="Min peis tilbehør"
      listIndex={listIndex}
    />
  );
}
