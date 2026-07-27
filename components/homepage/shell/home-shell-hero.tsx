"use client";

import { useState } from "react";

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
  const slideCount = HERO_SLIDES.length;
  const slide = HERO_SLIDES[activeIndex] ?? HERO_SLIDES[0];

  const select = (index: number) => {
    setActiveIndex(((index % slideCount) + slideCount) % slideCount);
  };

  return (
    <section
      aria-labelledby="home-shell-hero-heading"
      className="relative isolate min-h-[100dvh] overflow-hidden bg-black"
    >
      {/* Soft atmosphere — not flat single color */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#3d382c_0%,transparent_50%),radial-gradient(ellipse_at_20%_80%,#1a1810_0%,transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(38,36,24,0.35)_0%,transparent_28%,rgba(18,16,10,0.65)_100%)]"
        aria-hidden
      />

      <ContainedLayout
        as="div"
        className={cn(
          SHELL_CONTENT_MAX,
          "relative z-10 grid min-h-[100dvh] grid-cols-1 items-end gap-8 pb-12 pt-24",
          "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-center lg:gap-10 lg:pb-20 lg:pt-20",
        )}
      >
        <div className="order-2 flex flex-col gap-8 lg:order-1">
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
