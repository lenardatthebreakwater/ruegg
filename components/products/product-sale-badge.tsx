import { StaticPicture } from "@/components/media/static-picture";

import { PRODUCT_SALE_BADGE_CLASS } from "@/components/products/product-sale-badge-styles";
import { cn } from "@/lib/utils";

const SALE_FLAME_ICON_SRC = "/images/products/sale-flame-icon.webp";

type ProductSaleBadgeProps = {
  label: string;
  className?: string;
};

export function ProductSaleBadge({ label, className }: ProductSaleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        PRODUCT_SALE_BADGE_CLASS,
        className,
      )}
    >
      <StaticPicture
        src={SALE_FLAME_ICON_SRC}
        alt=""
        aria-hidden
        width={14}
        height={14}
        className="size-3.5 shrink-0 object-contain"
      />
      <span>{label}</span>
    </span>
  );
}
