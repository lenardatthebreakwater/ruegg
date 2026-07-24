"use client";

import { motion } from "motion/react";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { HomepageOfferCard } from "@/components/homepage/offer-card";
import { SectionIntro, type SectionIntroAlign } from "@/components/section-intro";
import type { HomepageOffer } from "@/lib/data/homepage";
import { PAGE_SECTION_PY, HOME_PAGE_GRID_GAP } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

type OffersSectionProps = {
  offers: HomepageOffer[];
  title?: string;
  description?: string;
  align?: SectionIntroAlign;
};

export function OffersSection({
  offers,
  title = "Våre Tilbud",
  description = "Her har vi samlet alle våre nåværende tilbud. Se våre tilbud og bli inspirert!",
  align = "center",
}: OffersSectionProps) {
  return (
    <section
      id="aktuelle-tilbud"
      className={cn(
        "border-b border-border bg-muted/30 dark:bg-muted/20",
        PAGE_SECTION_PY
      )}
    >
      <ContainedLayout as="div">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="mb-3 sm:mb-8"
        >
          <SectionIntro
            title={title}
            description={description}
            align={align}
            className="!py-3 sm:!py-4"
            descriptionClassName="!mt-3 sm:!mt-4"
          />
        </motion.div>
        <div className={cn("grid items-stretch sm:grid-cols-2 lg:grid-cols-3", HOME_PAGE_GRID_GAP)}>
          {offers.map((offer, i) => (
            <HomepageOfferCard key={offer.id} offer={offer} index={i} />
          ))}
        </div>
      </ContainedLayout>
    </section>
  );
}
