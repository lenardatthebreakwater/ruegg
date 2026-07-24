import type { LucideIcon, LucideProps } from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

type IconBadgeProps = {
  icon: LucideIcon | ComponentType<LucideProps>;
  className?: string;
  iconClassName?: string;
};

/** Outline Lucide icon in pale primary badge — matches showroom / trust bar reference. */
export function IconBadge({ icon: Icon, className, iconClassName }: IconBadgeProps) {
  return (
    <span
      data-icon-badge=""
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25 dark:bg-primary/20 dark:ring-primary/30",
        className,
      )}
      aria-hidden
    >
      <Icon
        className={cn(
          "size-6 fill-none stroke-current [&_circle]:fill-none [&_path]:fill-none [&_rect]:fill-none [&_line]:fill-none [&_polyline]:fill-none [&_polygon]:fill-none",
          iconClassName,
        )}
        size={24}
        strokeWidth={1.5}
        absoluteStrokeWidth
        fill="none"
        aria-hidden
      />
    </span>
  );
}
