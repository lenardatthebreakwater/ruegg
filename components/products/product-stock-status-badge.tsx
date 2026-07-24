import { cn } from "@/lib/utils";
import {
  getStockStatusLabelNb,
  type ProductStockStatus,
} from "@/lib/products/stock-status";

type ProductStockStatusBadgeProps = {
  stockStatus?: ProductStockStatus | null;
  className?: string;
};

/** Norwegian stock-status chip; hidden for normal in-stock products. */
export function ProductStockStatusBadge({
  stockStatus,
  className,
}: ProductStockStatusBadgeProps) {
  const label = getStockStatusLabelNb(stockStatus);
  if (!label || stockStatus === "OUT_OF_STOCK") {
    // Out-of-stock is communicated on the CTA ("Utsolgt"), not as a chip.
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950 ring-1 ring-amber-200/80",
        className
      )}
    >
      {label}
    </span>
  );
}
