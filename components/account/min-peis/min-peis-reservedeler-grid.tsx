import { MinPeisReservedelerPartCard } from "@/components/account/min-peis/min-peis-reservedeler-part-card";
import type { Product } from "@/lib/types/product";

type MinPeisReservedelerGridProps = {
  products: Product[];
  ownedProductSlugs?: string[];
};

export function MinPeisReservedelerGrid({
  products,
  ownedProductSlugs = [],
}: MinPeisReservedelerGridProps) {
  const ownedSet = new Set(
    ownedProductSlugs.map((slug) => slug.trim().toLowerCase())
  );

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4" role="list">
      {products.map((product, index) => (
        <li key={product.id || product.slug} className="flex">
          <MinPeisReservedelerPartCard
            product={product}
            owned={ownedSet.has(product.slug.trim().toLowerCase())}
            listIndex={index}
          />
        </li>
      ))}
    </ul>
  );
}
