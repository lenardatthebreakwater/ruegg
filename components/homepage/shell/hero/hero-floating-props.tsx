"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import type { HeroFloatingProp } from "@/components/homepage/shell/hero/hero-slides";
import { cn } from "@/lib/utils";

type HeroFloatingPropsProps = {
  props: readonly HeroFloatingProp[];
  slideKey: string;
};

const blendClass: Record<NonNullable<HeroFloatingProp["blend"]>, string> = {
  darken: "mix-blend-darken",
  screen: "mix-blend-screen",
  normal: "",
};

/**
 * Small garnish cutouts that swap with each hero slide.
 * Blend modes knock out baked white/black mats without Photoshop.
 */
export function HeroFloatingProps({ props, slideKey }: HeroFloatingPropsProps) {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {props.map((prop, index) => (
        <motion.div
          key={`${slideKey}-${prop.src}`}
          className={cn("absolute", prop.className)}
          initial={reduce ? false : { opacity: 0, scale: 0.86, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.9, y: -10 }}
          transition={{
            duration: reduce ? 0 : 0.45,
            delay: reduce ? 0 : 0.12 + index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.div
            animate={
              reduce ? undefined : { y: [0, index % 2 === 0 ? -8 : 6, 0] }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: 5.5 + index * 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4 + index * 0.15,
                  }
            }
          >
            <Image
              src={prop.src}
              alt=""
              width={480}
              height={480}
              unoptimized
              className={cn(
                "h-auto w-full bg-transparent select-none object-contain",
                blendClass[prop.blend ?? "normal"],
              )}
              sizes="(max-width: 768px) 28vw, 14vw"
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
