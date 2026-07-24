import { ProductCard } from "@/components/products/product-card";
import { ProductCardList } from "@/components/products/product-card-list";
import { slugifyItemListId } from "@/lib/analytics/ga4-item";
import type { Product } from "@/lib/types/product";
import type { ProductArchiveViewMode } from "@/lib/types/product-archive";
import { cn } from "@/lib/utils";

type ProductArchiveGridProps = {
  products: Product[];
  viewMode?: ProductArchiveViewMode;
  className?: string;
  isLoading?: boolean;
  /** GA4 item_list_name (archive title). */
  listName?: string;
};

export function ProductArchiveGrid({
  products,
  viewMode = "grid",
  className,
  isLoading = false,
  listName,
}: ProductArchiveGridProps) {
  const listId = listName ? slugifyItemListId(listName) : undefined;

  if (products.length === 0) {
    if (isLoading) {
      return (
        <div
          className={cn(
            "flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground",
            className
          )}
          role="status"
          aria-live="polite"
        >
          Laster produkter...
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground",
          className
        )}
      >
        Ingen produkter passer med valgte filtre.
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <ul className={cn("flex flex-col gap-4", className)} role="list">
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductCardList
              product={product}
              listId={listId}
              listName={listName}
              listIndex={index}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4",
        className
      )}
      role="list"
    >
      {products.map((product, index) => (
        <li key={product.id} className="flex">
          <ProductCard
            product={product}
            className="w-full"
            listId={listId}
            listName={listName}
            listIndex={index}
          />
        </li>
      ))}
    </ul>
  );
}
