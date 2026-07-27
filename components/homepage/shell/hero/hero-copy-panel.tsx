"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { SHELL_CTA_PRIMARY } from "@/components/homepage/shell/shell-cta";
import type { HeroSlide } from "@/components/homepage/shell/hero/hero-slides";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroCopyPanelProps = {
  slide: HeroSlide;
  className?: string;
};

export function HeroCopyPanel({ slide, className }: HeroCopyPanelProps) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("relative z-10 max-w-md", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            id="home-shell-hero-heading"
            className="font-display text-3xl font-medium tracking-tight text-[color:var(--ruegg-swiss-paper)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
          >
            {slide.headline}
          </h1>
          <p className="mt-4 max-w-[32ch] text-base leading-relaxed text-[color:var(--ruegg-swiss-paper)]/80 sm:text-lg">
            {slide.support}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className={SHELL_CTA_PRIMARY}>
              <Link href={slide.href}>{slide.cta}</Link>
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
