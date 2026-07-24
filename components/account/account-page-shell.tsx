"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AccountNav } from "@/components/account/account-nav";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { cn } from "@/lib/utils";

/** Content column inside ContainedLayout (site max-w-7xl). */
export type AccountContentWidth = "narrow" | "wide" | "full";

type AccountPageShellProps = {
  children: ReactNode;
  /**
   * Content column width.
   * - narrow — forms (max-w-xl)
   * - wide — account lists (max-w-2xl)
   * - full — full ContainedLayout width (no inner cap)
   */
  maxWidth?: AccountContentWidth;
  /** @deprecated Prefer `maxWidth="wide"`. */
  wide?: boolean;
  /**
   * Render the shared account nav at ContainedLayout width so it stays
   * aligned across Oversikt, Min peis, orders, etc.
   */
  showNav?: boolean;
};

const WIDTH_CLASS: Record<AccountContentWidth, string> = {
  narrow: "max-w-xl",
  wide: "max-w-2xl",
  full: "max-w-none",
};

function resolveMaxWidth(
  maxWidth: AccountContentWidth | undefined,
  wide: boolean | undefined
): AccountContentWidth {
  if (maxWidth) return maxWidth;
  return wide ? "wide" : "narrow";
}

/**
 * Shared vertical rhythm for Min Konto pages — matches storefront ContainedLayout
 * padding. Account nav (when shown) always spans ContainedLayout; page content
 * can use a narrower inner column.
 */
export function AccountPageShell({
  children,
  maxWidth,
  wide = false,
  showNav = false,
}: AccountPageShellProps) {
  const prefersReducedMotion = useReducedMotion();
  const width = resolveMaxWidth(maxWidth, wide);

  return (
    <ContainedLayout as="section" className="py-10 md:py-16">
      <motion.div
        className={cn(
          "flex w-full flex-col gap-6 md:gap-8",
          !showNav && "mx-auto",
          !showNav && WIDTH_CLASS[width]
        )}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {showNav ? <AccountNav /> : null}
        {showNav ? (
          <div className={cn("mx-auto w-full", WIDTH_CLASS[width])}>
            {children}
          </div>
        ) : (
          children
        )}
      </motion.div>
    </ContainedLayout>
  );
}
