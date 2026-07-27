"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { HeroFireSparks } from "@/components/homepage/shell/hero/hero-fire-sparks";
import { HeroFloatingProps } from "@/components/homepage/shell/hero/hero-floating-props";
import type { HeroSlide } from "@/components/homepage/shell/hero/hero-slides";
import { cn } from "@/lib/utils";

type HeroProductStageProps = {
  slide: HeroSlide;
  className?: string;
};

/**
 * Product + garnish. Stage height is capped so big monitors keep the same
 * composition as a typical laptop — extra viewport becomes empty atmosphere.
 */
export function HeroProductStage({ slide, className }: HeroProductStageProps) {
  const reduce = useReducedMotion();
  const hasLayeredProps = slide.props.length > 0;

  return (
    <div
      className={cn(
        "relative mx-auto w-full",
        /* Locked frame (~laptop). Do not grow with 100dvh on large screens. */
        "h-[min(28rem,70dvh)] min-h-[22rem] sm:h-[min(30rem,72dvh)]",
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
          <div className="absolute inset-0 z-10 flex items-center justify-center px-[6%] py-[2%] sm:px-[10%]">
            <motion.div
              className={cn(
                "relative h-full w-full",
                slide.productMaxClass ??
                  (hasLayeredProps ? "max-w-lg" : "max-w-2xl"),
              )}
              initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
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
                className="object-contain object-center"
                sizes="(max-width: 1024px) 92vw, 42vw"
              />
              {slide.showFireSparks ? <HeroFireSparks /> : null}
            </motion.div>
          </div>

          {hasLayeredProps ? (
            <HeroFloatingProps props={slide.props} slideKey={slide.id} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
