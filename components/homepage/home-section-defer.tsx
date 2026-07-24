import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HomeSectionDeferProps = {
  children: ReactNode;
  className?: string;
  /**
   * Approximate reserved height so `content-visibility: auto` does not cause
   * large scrollbar jumps when the section enters the viewport.
   */
  intrinsicHeight?: number;
};

/**
 * Skips style/layout work for off-screen homepage bands (big TBT win).
 * Browser still paints when the section approaches the viewport.
 */
export function HomeSectionDefer({
  children,
  className,
  intrinsicHeight = 480,
}: HomeSectionDeferProps) {
  return (
    <div
      className={cn("[content-visibility:auto]", className)}
      style={{ containIntrinsicSize: `auto ${intrinsicHeight}px` }}
    >
      {children}
    </div>
  );
}
