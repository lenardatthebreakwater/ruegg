"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ContainedLayout } from "@/components/layout/contained-layout";
import { HeroCopyPanel } from "@/components/homepage/shell/hero/hero-copy-panel";
import { HeroProductStage } from "@/components/homepage/shell/hero/hero-product-stage";
import { HeroSlideControls } from "@/components/homepage/shell/hero/hero-slide-controls";
import { HERO_SLIDES } from "@/components/homepage/shell/hero/hero-slides";
import { SHELL_CONTENT_MAX } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

/**
 * Strategy A hero — product-stage slider with floating garnish props that swap per slide.
 * Inspired by boss Hostinger demos (ice-cream cutouts + puffer color stage).
 */
export function HomeShellHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();
  const slideCount = HERO_SLIDES.length;
  const slide = HERO_SLIDES[activeIndex] ?? HERO_SLIDES[0];

  const select = (index: number) => {
    setActiveIndex(((index % slideCount) + slideCount) % slideCount);
  };

  return (
    <section
      aria-labelledby="home-shell-hero-heading"
      className="relative isolate min-h-[100dvh] overflow-hidden bg-[color:var(--ruegg-swiss-deep)]"
    >
      {/* Shared atmosphere — one field for copy + product (no stage box) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_38%,#3d382c_0%,transparent_52%),radial-gradient(ellipse_at_18%_78%,#1a1810_0%,transparent_48%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(38,36,24,0.4)_0%,transparent_30%,rgba(18,16,10,0.55)_100%)]"
        aria-hidden
      />

      {/* Soft slide tint across the whole hero — not a product panel */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          className={cn(
            "pointer-events-none absolute inset-0 opacity-70",
            slide.washClassName,
          )}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.5 }}
          aria-hidden
        />
      </AnimatePresence>

      <ContainedLayout
        as="div"
        className={cn(
          SHELL_CONTENT_MAX,
          "relative z-10 grid min-h-[100dvh] grid-cols-1 items-center gap-6 py-16",
          "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-8 lg:py-16",
        )}
      >
        <div className="order-2 flex flex-col gap-6 lg:order-1 lg:gap-8">
          <HeroCopyPanel slide={slide} />
          <HeroSlideControls
            slides={HERO_SLIDES}
            activeIndex={activeIndex}
            onSelect={select}
            onPrev={() => select(activeIndex - 1)}
            onNext={() => select(activeIndex + 1)}
          />
        </div>

        <div
          id="home-shell-hero-stage"
          role="tabpanel"
          aria-labelledby={`hero-tab-${slide.id}`}
          className="order-1 lg:order-2"
        >
          <HeroProductStage slide={slide} />
        </div>
      </ContainedLayout>
    </section>
  );
}
