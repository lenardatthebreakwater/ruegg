"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { HeroFloatingProps } from "@/components/homepage/shell/hero/hero-floating-props";
import type { HeroSlide } from "@/components/homepage/shell/hero/hero-slides";
import { cn } from "@/lib/utils";

type HeroProductStageProps = {
  slide: HeroSlide;
  className?: string;
};

/**
 * Center product cutout + giant backdrop word + floating garnish props.
 * Dark stage lets black AI mats disappear without manual cutouts.
 */
export function HeroProductStage({ slide, className }: HeroProductStageProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "relative min-h-[22rem] w-full overflow-hidden sm:min-h-[28rem] lg:min-h-[36rem]",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.4 }}
        >
          {/* Opaque black base so screen-blend props knock out cleanly */}
          <div className="absolute inset-0 bg-black" aria-hidden />
          <div
            className={cn("absolute inset-0 opacity-90", slide.washClassName)}
            aria-hidden
          />

          <p
            className={cn(
              "pointer-events-none absolute inset-x-0 top-[8%] z-0 text-center",
              "font-display text-[clamp(3.5rem,14vw,9rem)] font-medium leading-none tracking-tight",
              "text-[color:var(--ruegg-swiss-paper)]/[0.1] select-none",
            )}
            aria-hidden
          >
            {slide.backdropWord}
          </p>

          <div className="absolute inset-0 z-10 flex items-end justify-center px-[8%] pb-[6%] pt-[12%] sm:px-[12%]">
            <motion.div
              className="relative h-full w-full max-w-xl"
              initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: reduce ? 0 : 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Image
                src={slide.productSrc}
                alt=""
                fill
                priority
                className="object-contain object-bottom drop-shadow-[0_40px_80px_rgba(0,0,0,0.55)]"
                sizes="(max-width: 1024px) 90vw, 48vw"
              />
            </motion.div>
          </div>

          <HeroFloatingProps props={slide.props} slideKey={slide.id} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
