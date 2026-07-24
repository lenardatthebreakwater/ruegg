"use client";

import { motion, type Variants } from "motion/react";
import { Flame, MessageCircle, Phone } from "lucide-react";
import { ContactMethodLink } from "@/components/analytics/contact-method-link";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { EditorialAccentPill } from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import { SectionIntro } from "@/components/section-intro";
import { Button } from "@/components/ui/button";
import type { ServiceHeroContent } from "@/lib/data/service-pages";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

type ServiceHeroSectionProps = {
  hero: ServiceHeroContent;
};

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

export function ServiceHeroSection({ hero }: ServiceHeroSectionProps) {
  const isPhoneCta = hero.callCtaHref.startsWith("tel:");
  const imageFit = hero.imageFit ?? "cover";
  const imagePanelClassName = hero.imagePanelClassName ?? "";

  return (
    <section className="relative border-b border-border bg-gradient-to-b from-primary/[0.05] to-transparent">
      <ContainedLayout as="div" className={`relative z-10 ${PAGE_SECTION_PY}`}>
        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col justify-center"
          >
            <motion.div variants={item} className="mb-4 flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/85 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-background/80">
                <Flame className="size-4 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden />
                <span>{hero.eyebrow}</span>
              </span>
            </motion.div>
            <motion.div variants={item}>
              <EditorialAccentPill />
              <SectionIntro
                heading="h1"
                size="hero"
                title={hero.title}
                description={hero.description}
                align="left"
                className="max-w-none pt-4 pb-0"
                descriptionClassName="max-w-2xl"
              />
            </motion.div>
            <motion.div variants={item} className="mt-8">
              <Button asChild size="lg" className="gap-2" variant="ctaGlow">
                {isPhoneCta ? (
                  <ContactMethodLink
                    href={hero.callCtaHref}
                    placement="service_hero"
                    linkText={hero.callCtaLabel}
                  >
                    <Phone className="size-4" aria-hidden />
                    {hero.callCtaLabel}
                  </ContactMethodLink>
                ) : (
                  <TrackedCtaLink
                    href={hero.callCtaHref}
                    contentType="service_hero"
                    contentId={hero.callCtaHref}
                    linkText={hero.callCtaLabel}
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    {hero.callCtaLabel}
                  </TrackedCtaLink>
                )}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className={`relative min-h-[280px] overflow-hidden rounded-2xl border border-neutral-200/80 shadow-sm dark:border-white/10 lg:min-h-[320px] ${imagePanelClassName}`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <StaticPicture
              src={hero.imageUrl}
              alt={hero.imageAlt}
              fetchPriority="high"
              className={
                imageFit === "contain"
                  ? "absolute inset-0 size-full object-contain p-8 sm:p-10"
                  : "absolute inset-0 size-full object-cover"
              }
            />
            {imageFit === "cover" ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/45 via-transparent to-transparent"
              />
            ) : null}
          </motion.div>
        </div>
      </ContainedLayout>
    </section>
  );
}
