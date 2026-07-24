"use client";

import type { ProductGalleryItem } from "@/lib/types/product";
import { ProductInspirationGallery } from "@/components/product-detail/product-inspiration-gallery";

type ProductBlueprintGalleryProps = {
  items: ProductGalleryItem[];
  className?: string;
};

export function ProductBlueprintGallery({ items, className }: ProductBlueprintGalleryProps) {
  return (
    <ProductInspirationGallery
      items={items}
      className={className}
      title="Plantegninger"
      description="Se plantegninger og tekniske tegninger for produktet."
      ariaLabel="Plantegningsgalleri"
    />
  );
}
