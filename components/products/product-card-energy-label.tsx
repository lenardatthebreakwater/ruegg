"use client";

import { EnergyLabelBadge } from "@/components/product-detail/energy-label-badge";
import type { ComponentProps } from "react";

type ProductCardEnergyLabelProps = Omit<
  ComponentProps<typeof EnergyLabelBadge>,
  "interactive" | "showTooltip"
> &
  Partial<Pick<ComponentProps<typeof EnergyLabelBadge>, "interactive" | "showTooltip">>;

/** Card / listing: same visual size as PDP (`md`), non-interactive by default. */
export function ProductCardEnergyLabel({
  size = "md",
  showTooltip = false,
  interactive = false,
  ...props
}: ProductCardEnergyLabelProps) {
  return (
    <div
      className="inline-flex shrink-0 self-start"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <EnergyLabelBadge
        {...props}
        size={size}
        showTooltip={showTooltip}
        interactive={interactive}
        squareEdges
      />
    </div>
  );
}
