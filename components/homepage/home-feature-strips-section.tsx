"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";

import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import {
  type HomeFeatureStrip,
  homeFeatureDescriptionToParagraphs,
  homeFeatureStrips,
} from "@/lib/data/home-feature-strips";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
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

type FeatureStripRowProps = {
  strip: HomeFeatureStrip;
  isFirst: boolean;
};

type FeatureStripImageProps = {
  imageSrc: string;
  imageAlt: string;
  hasGlassImage: boolean;
};

function FeatureStripImage({
  imageSrc,
  imageAlt,
  hasGlassImage,
}: FeatureStripImageProps) {
  return (
    <motion.div
      className={cn(
        "relative min-h-[240px] overflow-hidden rounded-2xl shadow-sm sm:min-h-[280px] lg:min-h-[320px]",
        hasGlassImage
          ? "border border-white/20 bg-white/10 ring-1 ring-white/10 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-950/20"
          : "border border-neutral-200/80 bg-white dark:border-white/10",
      )}
      initial={{ scale: 1.04 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, ease: "easeOut" }}
    >
      {hasGlassImage ? (
        <>
          <StaticPicture
            src={imageSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 z-0 size-full scale-110 object-cover opacity-70 blur-2xl saturate-125"
          />
          <div
            aria-hidden
            className="absolute inset-0 z-[1] bg-white/25 backdrop-blur-sm dark:bg-neutral-950/25"
          />
        </>
      ) : null}
      <StaticPicture
        src={imageSrc}
        alt={imageAlt}
        className={cn(
          "absolute inset-0 size-full object-cover",
          hasGlassImage && "z-[2]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/35 via-transparent to-transparent",
          hasGlassImage && "z-[3]",
        )}
      />
    </motion.div>
  );
}

function FeatureStripRow({ strip, isFirst }: FeatureStripRowProps) {
  const { title, subtitle, description, ctaLabel, ctaHref, imageSrc, imageAlt, imageSide } =
    strip;
  const sectionBackdropSrc = strip.sectionBackgroundImageSrc ?? imageSrc;
  const paragraphs = homeFeatureDescriptionToParagraphs(description);
  const imageOnRight = imageSide === "right";
  const hasStrongBlurredSectionBackdrop = strip.id === "peis-og-vedovner";
  const hasGlassSection =
    hasStrongBlurredSectionBackdrop ||
    strip.id === "sesongstilbud" ||
    strip.id === "peismontering" ||
    strip.id === "3d-skisser";
  const hasGlassImage = hasGlassSection;

  return (
    <article
      className={cn(
        "relative",
        !isFirst && "border-t border-neutral-200/70 dark:border-white/10",
      )}
    >
      {hasGlassSection ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-[50%] z-0 w-screen -translate-x-1/2 overflow-hidden"
          >
            <StaticPicture
              src={sectionBackdropSrc}
              alt=""
              className={cn(
                "absolute inset-0 size-full scale-125 object-cover saturate-125",
                hasStrongBlurredSectionBackdrop
                  ? "opacity-80 blur-[88px]"
                  : "scale-110 opacity-55 blur-3xl",
              )}
            />
          </div>
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-[50%] z-[1] w-screen -translate-x-1/2 backdrop-blur-md",
              hasStrongBlurredSectionBackdrop
                ? "bg-white/45 dark:bg-neutral-950/40"
                : "bg-white/70 dark:bg-neutral-950/55",
            )}
          />
        </>
      ) : null}
      <div
        className={cn(
          "relative z-10 grid items-stretch gap-8 lg:grid-cols-2 lg:items-center lg:gap-10",
          hasGlassSection && "py-8 md:py-10",
        )}
      >
        <div
          className={cn(
            "order-2",
            imageOnRight ? "lg:order-2" : "lg:order-1",
          )}
        >
          <FeatureStripImage
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            hasGlassImage={hasGlassImage}
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className={cn(
            "order-1 flex flex-col justify-center",
            imageOnRight ? "lg:order-1" : "lg:order-2",
          )}
        >
          <motion.h2
            variants={item}
            className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {title}
          </motion.h2>
          {subtitle != null && subtitle.length > 0 ? (
            <motion.p
              variants={item}
              className="mt-3 text-lg font-medium text-foreground/90"
            >
              {subtitle}
            </motion.p>
          ) : null}
          <motion.div
            variants={item}
            className="mt-4 max-w-prose space-y-3 text-base text-muted-foreground sm:text-lg"
          >
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>
          <motion.div variants={item} className="mt-8">
            <Button asChild size="lg" className="gap-2" variant="ctaGlow">
              <TrackedCtaLink
                href={ctaHref}
                contentType="home_feature_strip"
                contentId={strip.id}
                linkText={ctaLabel}
              >
                {ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </TrackedCtaLink>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </article>
  );
}

type HomeFeatureStripsSectionProps = {
  strips?: HomeFeatureStrip[];
  className?: string;
};

export function HomeFeatureStripsSection({
  strips = homeFeatureStrips,
  className,
}: HomeFeatureStripsSectionProps) {
  return (
    <section
      className={cn(
        "overflow-x-clip border-y border-neutral-200/70 bg-gradient-to-b from-background to-muted/30 dark:border-white/10",
        className,
      )}
    >
      <ContainedLayout as="div">
        {strips.map((strip, index) => (
          <FeatureStripRow key={strip.id} strip={strip} isFirst={index === 0} />
        ))}
      </ContainedLayout>
    </section>
  );
}
