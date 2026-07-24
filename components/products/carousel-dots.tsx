"use client";

import { cn } from "@/lib/utils";

type CarouselDotsProps = {
  /** Total number of dots (e.g. number of pages) */
  total: number;
  /** Currently active zero-based index */
  activeIndex: number;
  /**
   * Kept for call-site compatibility. Dots are visual-only (not buttons) so
   * PageSpeed does not flag them as undersized/overlapping touch targets.
   * Navigation stays on arrows / swipe / drag.
   */
  onSelect?: (index: number) => void;
  className?: string;
  /** Accessible label for the live status region */
  "aria-label"?: string;
};

/**
 * Page-position indicators for carousels. Non-interactive by design — each
 * “dot” is a decorative span, with a single status announcement for AT.
 */
export function CarouselDots({
  total,
  activeIndex,
  className,
  "aria-label": ariaLabel = "Karusellposisjon",
}: CarouselDotsProps) {
  if (total <= 1) return null;

  const clamped = Math.min(Math.max(activeIndex, 0), total - 1);

  return (
    <div
      role="status"
      aria-label={`${ariaLabel}: ${clamped + 1} av ${total}`}
      className={cn("flex items-center justify-center gap-2", className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "rounded-full",
            i === clamped
              ? "h-2.5 w-2.5 bg-primary"
              : "h-2 w-2 bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
