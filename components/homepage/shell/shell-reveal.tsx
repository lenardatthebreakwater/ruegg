"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type ShellRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Slightly stronger vertical travel for larger blocks. */
  offset?: number;
  /** Semantic wrapper when nesting inside lists. */
  as?: "div" | "li";
};

/**
 * Motivated scroll reveal for homepage shell (hierarchy / storytelling).
 * Honors prefers-reduced-motion.
 */
export function ShellReveal({
  children,
  className,
  delay = 0,
  offset = 24,
  as = "div",
}: ShellRevealProps) {
  const reduce = useReducedMotion();
  const Comp = as === "li" ? motion.li : motion.div;

  return (
    <Comp
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: reduce ? 0 : 0.65,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Comp>
  );
}
