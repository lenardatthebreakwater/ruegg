import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccentCardProps = {
  children: ReactNode;
  className?: string;
  /** Soft primary wash over secondary (Kort fortalt / light mode). Default true. */
  wash?: boolean;
  /** Top primary gradient bar. Default true. */
  accentBar?: boolean;
  /** Secondary fill + ring (full Kort fortalt shell). Default true. */
  tinted?: boolean;
};

/**
 * Shared “Kort fortalt” / account-card chrome:
 * rounded-xl, border, optional secondary fill, primary wash, top accent bar.
 */
export function AccentCard({
  children,
  className,
  wash = true,
  accentBar = true,
  tinted = true,
}: AccentCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 ring-1 ring-foreground/5 dark:ring-border",
        tinted
          ? "bg-secondary shadow-md shadow-foreground/[0.04] dark:bg-card dark:shadow-xs"
          : "bg-card shadow-xs",
        className
      )}
    >
      {wash && tinted ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent dark:from-primary/[0.1]"
        />
      ) : null}
      {accentBar ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-[1] h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent"
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
