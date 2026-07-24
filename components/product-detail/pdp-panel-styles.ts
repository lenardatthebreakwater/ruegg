import {
  META_RUBRIC_LABEL_CLASS,
  META_RUBRIC_PANEL_CLASS,
  META_RUBRIC_PANEL_SOFT_CLASS,
} from "@/components/editorial/meta-rubric";

/**
 * Standalone PDP panels that sit on page background (trust banner, FAQ, etc.).
 * Primary wash separates from page `bg-background` (card === background in theme).
 * Do NOT use for Frakt / Produktdetaljer when nested inside AccentCard — use
 * `PDP_INNER_PANEL_*` so white panels read against the tinted shell.
 */
export const PDP_BORDERED_PANEL_CLASS =
  "rounded-xl border border-primary/20 bg-primary/[0.03] shadow-xs ring-1 ring-foreground/5 dark:border-primary/20 dark:bg-card/60";

/**
 * Soft standalone PDP shell (dialog lists, etc.) — same wash family as bordered.
 */
export const PDP_SOFT_PANEL_CLASS =
  "rounded-xl border border-primary/15 bg-primary/[0.025] shadow-xs ring-1 ring-foreground/5 dark:border-primary/20 dark:bg-card/50";

/**
 * Inner white panel inside a tinted AccentCard shell — matches order-detail
 * Produkter / faktura MetaRubric panels (`bg-background/70`).
 */
export const PDP_INNER_PANEL_CLASS = META_RUBRIC_PANEL_CLASS;

/** Softer inner list panel — matches order-detail Produkter soft shell. */
export const PDP_INNER_PANEL_SOFT_CLASS = META_RUBRIC_PANEL_SOFT_CLASS;

/** MetaRubric-style section label used inside PDP panels. */
export const PDP_PANEL_LABEL_CLASS = META_RUBRIC_LABEL_CLASS;

/** Inner padding for panel bodies (matches Beregn frakt form area). */
export const PDP_PANEL_PADDING_CLASS = "px-5 py-4";

/** Vertical spacing between stacked PDP blocks outside the detail shell (e.g. accessories → shell). */
export const PDP_PANEL_STACK_CLASS = "flex flex-col gap-6";

/**
 * Gap between Frakt / Produktdetaljer panels inside the AccentCard shell.
 * Must live on a wrapper *inside* AccentCard’s content div — `space-y-*` on
 * AccentCard’s `className` does not separate those siblings (see AccentCard).
 */
export const PDP_DETAIL_SHELL_STACK_CLASS = "flex flex-col gap-6";

/** Padding inside the AccentCard detail shell wrapping Frakt + Produktdetaljer. */
export const PDP_DETAIL_SHELL_PADDING_CLASS = "p-3 sm:p-3.5";

/** Expand/collapse toggle at the bottom of bordered PDP panels. */
export const PDP_PANEL_TOGGLE_BUTTON_CLASS =
  "w-full border-t border-primary/10 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:text-primary/80";
