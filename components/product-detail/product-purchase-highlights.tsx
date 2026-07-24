"use client";

import {
  ANIMATED_ICON_PROPS,
  useAnimatedIcon,
  type AnimatedIconComponent,
} from "@/components/icons/animated-icon";
import {
  AnimatedBadgePercentIcon,
  AnimatedShieldCheckIcon,
  AnimatedWrenchIcon,
} from "@/components/icons/storefront-animated-icons";
import { MetaRubric } from "@/components/editorial";
import { PDP_BORDERED_PANEL_CLASS } from "@/components/product-detail/pdp-panel-styles";
import { cn } from "@/lib/utils";

const purchaseHighlights = [
  {
    icon: AnimatedShieldCheckIcon,
    label: "Betaling",
    text: "Sikker betaling",
  },
  {
    icon: AnimatedBadgePercentIcon,
    label: "Pris",
    text: "Rimelige priser",
  },
  {
    icon: AnimatedWrenchIcon,
    label: "Montering",
    text: "Proff montering",
  },
] as const;

type PurchaseHighlightItemProps = {
  icon: AnimatedIconComponent;
  label: string;
  text: string;
};

function PurchaseHighlightItem({
  icon: Icon,
  label,
  text,
}: PurchaseHighlightItemProps) {
  const { ref, triggerProps } = useAnimatedIcon();

  return (
    <li className="min-w-0" {...triggerProps}>
      <MetaRubric
        label={label}
        align="center"
        className="h-full px-2 py-2.5 sm:px-3.5 sm:py-3"
      >
        <span className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center sm:gap-2">
          <Icon
            ref={ref}
            {...ANIMATED_ICON_PROPS}
            className="shrink-0 text-primary"
          />
          <span className="text-center text-xs font-medium leading-snug text-foreground sm:text-sm">
            {text}
          </span>
        </span>
      </MetaRubric>
    </li>
  );
}

type ProductPurchaseHighlightsProps = {
  className?: string;
};

export function ProductPurchaseHighlights({
  className,
}: ProductPurchaseHighlightsProps) {
  return (
    <ul
      className={cn(
        PDP_BORDERED_PANEL_CLASS,
        "grid w-full grid-cols-3 gap-2 p-2.5 sm:gap-3 sm:p-3.5",
        className
      )}
    >
      {purchaseHighlights.map(({ icon, label, text }) => (
        <PurchaseHighlightItem
          key={text}
          icon={icon}
          label={label}
          text={text}
        />
      ))}
    </ul>
  );
}
