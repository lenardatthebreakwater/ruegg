import { ContainedLayout } from "@/components/layout/contained-layout";
import type { HubBrandTeaserContent } from "@/lib/data/hub-pages/types";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

import { HubBrandTeaserCard } from "./hub-brand-teaser-card";

type HubBrandTeaserGridProps = {
  teasers: HubBrandTeaserContent[];
  className?: string;
  imageAspectClass?: string;
  /** Optional section heading (hidden from layout if omitted) */
  sectionTitle?: string;
  /** Optional lead paragraph under the heading */
  sectionDescription?: string;
  sectionId?: string;
};

export function HubBrandTeaserGrid({
  teasers,
  className,
  imageAspectClass,
  sectionTitle,
  sectionDescription,
  sectionId = "hub-brand-teasers-heading",
}: HubBrandTeaserGridProps) {
  return (
    <section
      className={cn("border-b border-border", PAGE_SECTION_PY, className)}
      aria-labelledby={sectionTitle ? sectionId : undefined}
    >
      <ContainedLayout>
        {sectionTitle ? (
          <header
            className={cn(
              "mb-8 md:mb-10",
              sectionDescription ? "space-y-3" : undefined
            )}
          >
            <h2
              id={sectionId}
              className="font-display text-2xl font-semibold tracking-tight md:text-3xl"
            >
              {sectionTitle}
            </h2>
            {sectionDescription ? (
              <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
                {sectionDescription}
              </p>
            ) : null}
          </header>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teasers.map((teaser) => (
            <HubBrandTeaserCard
              key={teaser.id}
              teaser={teaser}
              imageAspectClass={imageAspectClass}
            />
          ))}
        </div>
      </ContainedLayout>
    </section>
  );
}
