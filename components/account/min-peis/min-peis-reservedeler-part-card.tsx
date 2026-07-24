import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/types/product";

type MinPeisReservedelerPartCardProps = {
  product: Product;
  owned?: boolean;
  compact?: boolean;
  listIndex?: number;
};

/** Thin wrapper — storefront ProductCard for peis-scoped spare parts. */
export function MinPeisReservedelerPartCard({
  product,
  owned = false,
  compact = false,
  listIndex,
}: MinPeisReservedelerPartCardProps) {
  return (
    <ProductCard
      product={product}
      owned={owned}
      compact={compact}
      className="w-full"
      listId="min-peis-reservedeler"
      listName="Min peis reservedeler"
      listIndex={listIndex}
    />
  );
}
