"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight, Flame } from "lucide-react";

import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import {
  EditorialAccentPill,
  EditorialHeading,
} from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import type { HubHomeHeroContent } from "@/lib/data/hub-pages/types";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

type HubHomeHeroSectionProps = {
  hero: HubHomeHeroContent;
};

export function HubHomeHeroSection({ hero }: HubHomeHeroSectionProps) {
  const {
    title,
    subtitle,
    description,
    ctaLabel,
    ctaHref,
    imageSrc,
    imageAlt,
    eyebrow,
    backgroundVideoSrc,
    posterImageSrc,
  } = hero;

  const posterSrc = posterImageSrc ?? imageSrc;
  const hasVideoBackground = Boolean(backgroundVideoSrc);

  const descriptionParagraphs = Array.isArray(description) ? description : [description];

  return (
    <section className="relative isolate w-full min-h-[clamp(22rem,78vh,52rem)] overflow-x-clip overflow-hidden">
      {/* Clip Ken Burns scale so it cannot widen document scrollWidth. */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {hasVideoBackground && backgroundVideoSrc ? (
            <>
              <video
                className="absolute inset-0 h-full w-full object-cover object-center max-md:object-[38%_center] motion-reduce:hidden"
                src={backgroundVideoSrc}
                poster={posterSrc}
                muted
                playsInline
                loop
                autoPlay
                aria-hidden
              />
              <StaticPicture
                src={posterSrc}
                alt={imageAlt}
                fetchPriority="high"
                className="absolute inset-0 hidden size-full object-cover object-center max-md:object-[38%_center] motion-reduce:block"
              />
            </>
          ) : (
            <StaticPicture
              src={imageSrc}
              alt={imageAlt}
              fetchPriority="high"
              className="absolute inset-0 size-full object-cover object-center max-md:object-[38%_center]"
            />
          )}
        </motion.div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-white/90 dark:bg-neutral-950/90 md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-background/95 from-0% via-background/82 via-[40%] to-transparent to-[78%] dark:from-background dark:via-background/95 md:block"
        aria-hidden
      />
      <ContainedLayout
        as="div"
        className="relative z-10 flex min-h-[clamp(22rem,78vh,52rem)] items-center justify-center px-[max(1rem,calc(5%+0.875rem))] py-16 sm:px-[max(1.5rem,calc(5%+0.875rem))] sm:py-20 md:justify-start md:px-6 lg:px-8 lg:py-24"
      >
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full min-w-0 max-w-xl break-words [overflow-wrap:anywhere] text-center md:text-left"
        >
          {eyebrow ? (
            <motion.div
              variants={item}
              className="mb-4 flex justify-center md:justify-start"
            >
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/80 bg-background/85 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-background/80">
                <Flame
                  className="size-4 shrink-0 text-amber-600 dark:text-amber-500"
                  aria-hidden
                />
                <span className="min-w-0">{eyebrow}</span>
              </span>
            </motion.div>
          ) : null}
          <motion.div
            variants={item}
            className={cn(
              "min-w-0 max-w-full font-sans pt-5 pb-5 sm:pt-6 sm:pb-6 md:mx-0 md:max-w-xl",
              "text-center md:text-left"
            )}
          >
            <EditorialAccentPill className="mx-auto mb-4 md:mx-0" />
            <EditorialHeading size="page">{title}</EditorialHeading>
            {subtitle ? (
              <p className="mt-3 max-w-full text-xl font-semibold tracking-tight text-foreground sm:mt-4 sm:text-2xl md:max-w-xl lg:text-3xl">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-4 max-w-full space-y-3 text-lg text-muted-foreground sm:mt-5 sm:text-xl md:max-w-xl">
              {descriptionParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </motion.div>
          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start"
          >
            <Button asChild size="lg" className="gap-2" variant="ctaGlow">
              <TrackedCtaLink
                href={ctaHref}
                contentType="campaign_hero"
                contentId={ctaHref}
                linkText={ctaLabel}
              >
                {ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </TrackedCtaLink>
            </Button>
          </motion.div>
        </motion.div>
      </ContainedLayout>
    </section>
  );
}
