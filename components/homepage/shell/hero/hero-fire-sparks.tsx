"use client";

import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type HeroFireSparksProps = {
  className?: string;
};

/** Deterministic spark seeds — no random on render.
 * Positions sit over the glass firebox (object-bottom product crop).
 */
const SPARKS = [
  { left: "44%", delay: "0s", duration: "2.4s", size: 3, drift: -8 },
  { left: "47%", delay: "0.35s", duration: "2.1s", size: 2, drift: 6 },
  { left: "50%", delay: "0.7s", duration: "2.8s", size: 4, drift: -4 },
  { left: "53%", delay: "0.15s", duration: "2.2s", size: 2, drift: 10 },
  { left: "49%", delay: "1.1s", duration: "2.6s", size: 3, drift: 3 },
  { left: "52%", delay: "1.45s", duration: "2.0s", size: 2, drift: -12 },
  { left: "46%", delay: "0.9s", duration: "2.5s", size: 2, drift: 7 },
  { left: "54%", delay: "1.8s", duration: "2.3s", size: 3, drift: -6 },
  { left: "48%", delay: "0.5s", duration: "1.9s", size: 2, drift: 2 },
  { left: "51%", delay: "2.0s", duration: "2.7s", size: 2, drift: -9 },
  { left: "45%", delay: "1.25s", duration: "2.15s", size: 3, drift: 11 },
  { left: "53%", delay: "0.25s", duration: "2.45s", size: 2, drift: -3 },
  { left: "47%", delay: "1.6s", duration: "2.05s", size: 2, drift: 5 },
  { left: "55%", delay: "0.8s", duration: "2.55s", size: 3, drift: -7 },
] as const;

/**
 * CSS spark jets rising from the firebox — no bitmap / bg-removal needed.
 */
export function HeroFireSparks({ className }: HeroFireSparksProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {SPARKS.map((spark, index) => (
        <span
          key={index}
          className={cn(
            "absolute rounded-full bg-[#ffd27a]",
            "shadow-[0_0_6px_2px_rgba(255,160,40,0.85),0_0_14px_4px_rgba(255,90,20,0.45)]",
            "mix-blend-screen",
            reduce ? "opacity-70" : "hero-fire-spark",
          )}
          style={{
            left: spark.left,
            bottom: reduce ? `${36 + (index % 5) * 3}%` : "38%",
            width: spark.size,
            height: spark.size,
            ["--spark-drift" as string]: `${spark.drift}px`,
            animationDelay: reduce ? undefined : spark.delay,
            animationDuration: reduce ? undefined : spark.duration,
            opacity: reduce ? 0.55 : undefined,
          }}
        />
      ))}
    </div>
  );
}
