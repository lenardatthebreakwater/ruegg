"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";

import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import type { HubFeatureSplitContent } from "@/lib/data/hub-pages/types";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

function featureDescriptionToParagraphs(description: string): string[] {
  return description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

type HubFeatureSplitSectionProps = {
  feature: HubFeatureSplitContent;
  className?: string;
  /** Anchor id for in-page links (e.g. hero CTA → feature block). */
  id?: string;
};

export function HubFeatureSplitSection({
  feature,
  className,
  id,
}: HubFeatureSplitSectionProps) {
  const { preamble, sections, imageSrc, imageAlt, ctaLabel, ctaHref } = feature;
  const sectionId = id ?? feature.id;

  return (
    <section
      id={sectionId}
      className={cn("border-b border-border", PAGE_SECTION_PY, className)}
    >
      <ContainedLayout>
        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            className="relative order-2 min-h-[280px] overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-white/10 lg:order-1 lg:min-h-[320px]"
            initial={{ scale: 1.06 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          >
            <StaticPicture
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 size-full object-cover"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/35 via-transparent to-transparent"
            />
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="order-1 flex flex-col justify-center lg:order-2"
          >
            {preamble ? (
              <motion.p
                variants={item}
                className="text-base text-muted-foreground sm:text-lg"
              >
                {preamble}
              </motion.p>
            ) : null}

            {sections.map((block, index) => (
              <motion.div
                key={`${block.title}-${index}`}
                variants={item}
                className={cn(index === 0 && !preamble ? "" : "mt-8")}
              >
                {index === 0 ? (
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {block.title}
                  </h2>
                ) : (
                  <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {block.title}
                  </h3>
                )}
                {block.listItems && block.listItems.length > 0 ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-muted-foreground sm:text-lg">
                    {block.listItems.map((li, j) => (
                      <li key={j}>{li}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-3 space-y-3 text-base text-muted-foreground sm:text-lg">
                  {featureDescriptionToParagraphs(block.description).map(
                    (para, i) => (
                      <p key={i}>{para}</p>
                    )
                  )}
                </div>
              </motion.div>
            ))}

            <motion.div variants={item} className="mt-8">
              <Button asChild size="lg" className="gap-2" variant="ctaGlow">
                <TrackedCtaLink
                  href={ctaHref}
                  contentType="campaign_feature"
                  contentId={sectionId}
                  linkText={ctaLabel}
                >
                  {ctaLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </TrackedCtaLink>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </ContainedLayout>
    </section>
  );
}
