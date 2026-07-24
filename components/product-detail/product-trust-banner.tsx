"use client";

import { Shield, Star, Trophy, Truck } from "lucide-react";
import { MetaRubricLabel } from "@/components/editorial";
import { PDP_BORDERED_PANEL_CLASS } from "@/components/product-detail/pdp-panel-styles";
import { IconBadge } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";

const trustItems = [
  {
    icon: Star,
    text: "Sveitsisk kvalitet",
  },
  {
    icon: Trophy,
    text: "Peisproff siden 1955",
  },
  {
    icon: Truck,
    text: "Rask levering",
  },
  {
    icon: Shield,
    text: "Personlig veiledning",
  },
] as const;

type ProductTrustBannerProps = {
  className?: string;
};

export function ProductTrustBanner({ className }: ProductTrustBannerProps) {
  return (
    <div
      role="region"
      aria-label="Kundefordeler"
      className={cn(
        PDP_BORDERED_PANEL_CLASS,
        "w-full border-white/15 bg-foreground px-4 py-4 text-background ring-white/10 sm:px-6 lg:px-8 dark:border-primary/20 dark:bg-primary/[0.06] dark:text-foreground dark:ring-foreground/5",
        className
      )}
    >
      <MetaRubricLabel className="mb-4 text-center text-background/70 sm:mb-5 dark:text-primary">
        Hvorfor Rüegg
      </MetaRubricLabel>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {trustItems.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className={cn(
              "flex flex-row items-center justify-start gap-2.5 text-left",
              "lg:justify-center lg:text-center"
            )}
          >
            <IconBadge
              icon={Icon}
              className="size-9 rounded-lg border border-white/20 bg-white/10 ring-0 sm:size-10 dark:border-primary/20 dark:bg-primary/10 dark:ring-0"
              iconClassName="size-4 text-background/80 sm:size-5 dark:text-primary"
            />
            <span className="text-sm font-medium text-background dark:text-foreground">
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
