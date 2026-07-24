"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type AccentHeaderCardProps = {
  /** Visible title in the tinted header block (e.g. “Ordreforløp”, “Anbefalt tilbehør”). */
  title: string;
  /** Stable id for aria-labelledby. */
  titleId: string;
  children: ReactNode;
  className?: string;
  /** Optional trailing content in the header (count, badge, etc.). */
  headerAside?: ReactNode;
  /** Heading level. Default h2. */
  titleAs?: "h2" | "h3" | "div";
  contentClassName?: string;
  /** Optional Lucide icon shown before the title. */
  icon?: LucideIcon;
  /** Optional tooltip on hover/focus of the icon + title group. */
  titleTooltip?: string;
};

/**
 * Ordreforløp-style chrome: top primary gradient stripe, dedicated header
 * block, then body. Shared by account order timeline and PDP accessories.
 */
export function AccentHeaderCard({
  title,
  titleId,
  children,
  className,
  headerAside,
  titleAs: TitleTag = "h2",
  contentClassName,
  icon: Icon,
  titleTooltip,
}: AccentHeaderCardProps) {
  const titleGroup = (
    <span className="inline-flex min-w-0 items-center gap-2">
      {Icon ? (
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
          aria-hidden
        >
          <Icon className="size-3.5" aria-hidden />
        </span>
      ) : null}
      <TitleTag
        id={titleId}
        className="text-sm font-semibold tracking-tight text-foreground"
      >
        {title}
      </TitleTag>
    </span>
  );

  return (
    <Card
      aria-labelledby={titleId}
      className={cn(
        "relative gap-0 overflow-hidden bg-primary/[0.03] py-0 shadow-md shadow-foreground/10 ring-1 ring-primary/25 dark:bg-card dark:shadow-xs dark:ring-primary/25",
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-[1] h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent"
      />
      <CardHeader className="relative z-[1] border-b border-primary/15 bg-primary/[0.06] px-4 py-4 sm:px-5 dark:bg-primary/[0.08]">
        <div className="flex items-center justify-between gap-3">
          {titleTooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className="inline-flex min-w-0 cursor-default rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {titleGroup}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {titleTooltip}
              </TooltipContent>
            </Tooltip>
          ) : (
            titleGroup
          )}
          {headerAside}
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "relative z-[1] px-4 py-4 sm:px-5 sm:py-5",
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
