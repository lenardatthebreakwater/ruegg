"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { StaticPicture } from "@/components/media/static-picture";
import { Button } from "@/components/ui/button";
import type { HomepageOffer } from "@/lib/data/homepage";

const textPanelShellClass =
  "relative flex h-full flex-col overflow-hidden border-t border-neutral-200/70 shadow-sm dark:border-white/10";

const textPanelContentClass =
  "relative z-10 flex flex-1 flex-col gap-3 p-3 sm:min-h-[12.5rem] sm:gap-0 sm:p-6";

type OfferCardCaptionBackdropProps = {
  imageUrl: string;
};

function OfferCardCaptionBackdrop({ imageUrl }: OfferCardCaptionBackdropProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <StaticPicture
        src={imageUrl}
        alt=""
        className="absolute inset-0 size-full scale-[1.45] object-cover object-top blur-3xl saturate-[1.35] sm:object-bottom"
      />
      <div className="absolute inset-0 bg-white/72 backdrop-blur-md dark:bg-neutral-950/58" />
    </div>
  );
}

export const offerCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.75, ease: "easeOut" },
  }),
};

type HomepageOfferCardProps = {
  offer: HomepageOffer;
  index: number;
};

export function HomepageOfferCard({ offer, index }: HomepageOfferCardProps) {
  const alt =
    offer.imageAlt?.trim() ||
    `${offer.title} — tilbud fra Rüegg`;

  return (
    <motion.article
      custom={index}
      variants={offerCardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md sm:min-h-[30rem] lg:min-h-[36rem]"
    >
      <div className="pointer-events-none relative aspect-[4/3] w-full shrink-0 overflow-hidden sm:absolute sm:inset-0 sm:aspect-auto">
        <StaticPicture
          src={offer.imageUrl}
          alt={alt}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-t from-black/55 via-black/15 to-black/10 dark:from-black/70 dark:via-black/25 dark:to-black/15 sm:block"
        />
      </div>

      <TrackedCtaLink
        href={offer.ctaHref}
        contentType="home_offer"
        contentId={offer.id}
        linkText={offer.title}
        className="absolute inset-0 z-10 rounded-xl"
        tabIndex={-1}
        aria-label={`Gå til: ${offer.title}`}
      />

      <div className="pointer-events-none relative z-20 flex flex-1 flex-col sm:mt-auto sm:w-full sm:flex-none">
        <div className={textPanelShellClass}>
          <OfferCardCaptionBackdrop imageUrl={offer.imageUrl} />
          <div className={textPanelContentClass}>
            <div className="min-h-0 sm:mb-2 sm:min-h-[1.625rem]">
              {offer.badge ? (
                <span className="inline-block w-fit rounded-md bg-primary/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-primary ring-1 ring-primary/20 dark:bg-primary/20 dark:ring-primary/30">
                  {offer.badge}
                </span>
              ) : null}
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {offer.title}
            </h3>
            <p className="min-h-[2.875rem] text-sm leading-relaxed text-neutral-600 sm:mt-2 dark:text-neutral-300">
              {offer.description}
            </p>
            <Button
              asChild
              variant="link"
              className="pointer-events-auto mt-auto h-auto w-fit gap-1 p-0 pt-3 text-primary"
            >
              <TrackedCtaLink
                href={offer.ctaHref}
                contentType="home_offer"
                contentId={offer.id}
                linkText={offer.ctaLabel}
              >
                {offer.ctaLabel}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </TrackedCtaLink>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
