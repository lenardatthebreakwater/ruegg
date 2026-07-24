import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small-caps brand-red section label (order detail / PDP shared). */
export const META_RUBRIC_LABEL_CLASS =
  "text-[11px] font-semibold tracking-[0.14em] text-primary uppercase";

/**
 * Modular card shell — background-based fill (order detail / shared editorial).
 * PDP light-mode contrast wash lives in `pdp-panel-styles` instead.
 */
export const META_RUBRIC_PANEL_CLASS =
  "rounded-xl border border-primary/15 bg-background/70 shadow-xs ring-1 ring-foreground/5 dark:border-primary/20 dark:bg-card/60";

/** Softer section / list shell (e.g. order-detail product list). */
export const META_RUBRIC_PANEL_SOFT_CLASS =
  "rounded-xl border border-primary/15 bg-background/60 shadow-xs ring-1 ring-foreground/5 dark:border-primary/20 dark:bg-card/50";

/**
 * Nested interactive card on a panel — solid light surface so product rows /
 * tiles read as cards against the rubrikk shell (order-detail pattern).
 */
export const META_RUBRIC_NESTED_CARD_CLASS =
  "rounded-xl border border-primary/15 bg-background shadow-xs ring-1 ring-foreground/5 dark:border-primary/25 dark:bg-card/80";

/** Compact summary tile (Bestilt / Betaling / Totalt style). */
export const META_RUBRIC_TILE_CLASS =
  "rounded-lg border border-primary/15 bg-background/80 px-3.5 py-3 shadow-xs ring-1 ring-foreground/5 dark:border-primary/25 dark:bg-card/80";

/**
 * Secondary body copy with stronger light-mode contrast than
 * `text-muted-foreground` (oklch ~0.556 on white fails WCAG for body).
 */
export const EDITORIAL_SECONDARY_TEXT_CLASS = "text-foreground/85";

type MetaRubricLabelProps = {
  children: ReactNode;
  className?: string;
  as?: "p" | "h2" | "h3" | "span";
};

export function MetaRubricLabel({
  children,
  className,
  as: Tag = "p",
}: MetaRubricLabelProps) {
  return <Tag className={cn(META_RUBRIC_LABEL_CLASS, className)}>{children}</Tag>;
}

type MetaRubricProps = {
  label: string;
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
};

/** Labeled summary tile used on order detail and PDP buy-box highlights. */
export function MetaRubric({
  label,
  children,
  align = "left",
  className,
}: MetaRubricProps) {
  return (
    <div
      className={cn(
        META_RUBRIC_TILE_CLASS,
        align === "center" && "text-center",
        align === "right" && "sm:text-right",
        className
      )}
    >
      <MetaRubricLabel>{label}</MetaRubricLabel>
      <div
        className={cn(
          "mt-1.5 text-sm text-foreground",
          align === "center" && "flex justify-center"
        )}
      >
        {children}
      </div>
    </div>
  );
}
