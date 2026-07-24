"use client";

import Link from "next/link";
import { ArrowRight, Home, type LucideIcon, Ruler, Weight, Zap } from "lucide-react";
import { motion, type Variants } from "motion/react";

import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { Card, CardContent } from "@/components/ui/card";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import type {
  HubFeatureSpecIconKey,
  HubFeatureSpecSplitContent,
} from "@/lib/data/hub-pages/types";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

const iconMap: Record<HubFeatureSpecIconKey, LucideIcon> = {
  ruler: Ruler,
  weight: Weight,
  zap: Zap,
  home: Home,
};

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

type HubFeatureSpecSplitSectionProps = {
  feature: HubFeatureSpecSplitContent;
  className?: string;
};

export function HubFeatureSpecSplitSection({
  feature,
  className,
}: HubFeatureSpecSplitSectionProps) {
  const { id, title, stats, imageSrc, imageAlt, ctaLabel, ctaHref } = feature;

  return (
    <section
      id={id}
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
            <motion.h2
              variants={item}
              className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {title}
            </motion.h2>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stats.map((stat, index) => {
                const Icon = iconMap[stat.iconKey];
                return (
                  <motion.div key={`${stat.label}-${index}`} variants={item}>
                    <Card className="border-neutral-200/80 bg-muted/20 shadow-sm dark:border-white/10 dark:bg-neutral-950/30">
                      <CardContent className="flex flex-col gap-2 p-4">
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <IconBadge icon={Icon} />
                          <span className="text-xs font-medium uppercase tracking-wide sm:text-sm">
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-foreground sm:text-lg">
                          {stat.value}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div variants={item} className="mt-8">
              <Button asChild size="lg" className="gap-2" variant="ctaGlow">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </ContainedLayout>
    </section>
  );
}
