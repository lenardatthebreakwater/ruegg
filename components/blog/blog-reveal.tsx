"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useMountEffect } from "@/lib/hooks/effect-last";
import { cn } from "@/lib/utils";

type BlogRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Subtle entrance for blog headers / archive rows. Honors reduced motion.
 *
 * SSR and the first client paint always use a plain div so `useReducedMotion()`
 * (null on server, boolean after mount) cannot flip the tree during hydration.
 */
export function BlogReveal({ children, className, delay = 0 }: BlogRevealProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useMountEffect(() => {
    setMounted(true);
  });

  const wrapperClassName = cn(className);

  if (!mounted || reduceMotion) {
    return <div className={wrapperClassName}>{children}</div>;
  }

  return (
    <motion.div
      className={wrapperClassName}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
