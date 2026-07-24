import { Flame, Gauge, Wrench, type LucideIcon } from "lucide-react";
import {
  EDITORIAL_SECONDARY_TEXT_CLASS,
  MetaRubricLabel,
} from "@/components/editorial";
import { PDP_BORDERED_PANEL_CLASS } from "@/components/product-detail/pdp-panel-styles";
import { IconBadge } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";
import type {
  ProductDescriptionCardIconKey,
  ProductDescriptionCardSection,
} from "@/lib/products/description-cards";

type ProductDescriptionCardsProps = {
  sections: ProductDescriptionCardSection[];
};

const iconMap: Record<ProductDescriptionCardIconKey, LucideIcon> = {
  flame: Flame,
  gauge: Gauge,
  wrench: Wrench,
};

function cardGridClassName(count: number): string {
  if (count <= 1) {
    return "grid grid-cols-1 gap-4";
  }
  if (count === 2) {
    return "grid grid-cols-1 gap-4 md:grid-cols-2";
  }
  return "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";
}

export function ProductDescriptionCards({ sections }: ProductDescriptionCardsProps) {
  return (
    <div className={cardGridClassName(sections.length)}>
      {sections.map((section) => {
        const Icon = iconMap[section.iconKey];

        return (
          <article
            key={section.key}
            className={cn(PDP_BORDERED_PANEL_CLASS, "flex h-full flex-col gap-3 p-5")}
          >
            <div className="flex items-start gap-3">
              <IconBadge
                icon={Icon}
                className="size-9 rounded-md border border-primary/20 bg-primary/[0.06] dark:bg-primary/10"
                iconClassName="size-4 text-primary"
              />
              <MetaRubricLabel as="h3" className="pt-1.5 leading-snug">
                {section.title}
              </MetaRubricLabel>
            </div>
            <p className={cn("text-sm leading-relaxed", EDITORIAL_SECONDARY_TEXT_CLASS)}>
              {section.content}
            </p>
          </article>
        );
      })}
    </div>
  );
}
