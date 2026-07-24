"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Fallback when no custom tooltip copy is passed. */
export const ENERGY_LABEL_TOOLTIP_MESSAGE = "Energimerke";

/** Product detail: prompt to open full energimerke (Norwegian UI). */
export const ENERGY_LABEL_PDP_TOOLTIP = "Klikk for å vise hele energimerket";

export type EnergyLabelBadgeProps = {
  energyLabel?: string | null;
  energyRatingBadgeUrl?: string | null;
  energyLabelGuideUrl?: string | null;
  /** `sm` for compact layouts; `md` default PDP; `lg` larger badge next to price */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Tooltip on hover (e.g. PDP when full guide is available). */
  showTooltip?: boolean;
  /** Overrides default tooltip label when `showTooltip` is true. */
  tooltipMessage?: string;
  /** When false: badge only (no dialog, no tooltip affordance). Used on product cards. */
  interactive?: boolean;
  /** No border-radius (e.g. product cards) */
  squareEdges?: boolean;
};

/** Matches product card sale pill: `text-xs` + `py-1` row (~24px / h-6) */
const imageClassBySize: Record<
  NonNullable<EnergyLabelBadgeProps["size"]>,
  string
> = {
  sm: "h-4 w-auto max-w-[2.75rem] object-contain object-left shrink-0",
  md: "h-5 w-auto max-w-[2.75rem] object-contain shrink-0",
  lg: "h-6 w-auto max-w-[3.5rem] object-contain shrink-0",
};

const triggerClassBySize: Record<
  NonNullable<EnergyLabelBadgeProps["size"]>,
  string
> = {
  sm: "h-4 max-w-[2.75rem]",
  md: "h-6 max-w-[4rem]",
  lg: "h-7 max-w-[4.5rem]",
};

const containerClassBySize: Record<
  NonNullable<EnergyLabelBadgeProps["size"]>,
  string
> = {
  sm: "h-4",
  md: "h-6",
  lg: "h-7",
};

/**
 * Official energimerke badge image only (no letter / full-sheet fallbacks).
 * With `energyLabelGuideUrl` and `interactive`, opens the full guide in a dialog.
 */
export function EnergyLabelBadge({
  energyLabel,
  energyRatingBadgeUrl,
  energyLabelGuideUrl,
  size = "md",
  className,
  showTooltip = false,
  tooltipMessage,
  interactive = true,
  squareEdges = false,
}: EnergyLabelBadgeProps) {
  /** Reset when the guide dialog toggles so focus-restore does not leave the tooltip stuck open. */
  const [guideTooltipOpen, setGuideTooltipOpen] = useState(false);

  if (!energyRatingBadgeUrl) return null;

  const altText = energyLabel
    ? `Energimerke, klasse ${energyLabel}`
    : "Energimerke";

  const imageClass = imageClassBySize[size];

  const guideUrl = energyLabelGuideUrl ?? "";
  const hasGuide = Boolean(guideUrl);
  const allowDialog = interactive && hasGuide;
  const tooltipCopy = tooltipMessage ?? ENERGY_LABEL_TOOLTIP_MESSAGE;

  const imageBadgeClass = cn(imageClass, squareEdges && "rounded-none");

  const badgeOnly = (
    // eslint-disable-next-line @next/next/no-img-element -- small EU energy badge asset; variable WP SVG/PNG, not LCP catalog media
    <img
      src={energyRatingBadgeUrl}
      alt={altText}
      className={imageBadgeClass}
    />
  );

  const triggerClassName = cn(
    "inline-flex shrink-0 cursor-pointer items-center border-0 bg-transparent p-0 shadow-none ring-offset-background",
    triggerClassBySize[size],
    "transition-[transform,opacity] duration-200 motion-safe:hover:scale-105 motion-safe:hover:opacity-90",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    squareEdges ? "rounded-none" : "rounded-sm"
  );

  const tooltipContent = (
    <TooltipContent side="top" sideOffset={8}>
      {tooltipCopy}
    </TooltipContent>
  );

  if (allowDialog && guideUrl) {
    const dialogTrigger = (
      <DialogTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
          aria-label="Vis hele energimerket"
        >
          {badgeOnly}
        </button>
      </DialogTrigger>
    );

    return (
      <div className={cn("inline-flex shrink-0", className)}>
        <Dialog
          onOpenChange={() => {
            setGuideTooltipOpen(false);
          }}
        >
          {showTooltip ? (
            <Tooltip
              open={guideTooltipOpen}
              onOpenChange={setGuideTooltipOpen}
            >
              <TooltipTrigger asChild>
                <span className={cn("inline-flex cursor-pointer items-center", triggerClassBySize[size])}>
                  {dialogTrigger}
                </span>
              </TooltipTrigger>
              {tooltipContent}
            </Tooltip>
          ) : (
            dialogTrigger
          )}
          <DialogContent
            className="max-h-[90vh] max-w-[min(90vw,56rem)] overflow-y-auto p-4 sm:p-6 md:max-h-[calc(100dvh-1.5rem)] md:overflow-hidden"
            closeButtonClassName="z-50 size-10 rounded-full bg-background/95 text-foreground shadow-md ring-1 ring-border hover:bg-muted [&_svg]:size-5"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
            }}
          >
            <DialogTitle className="sr-only">Energimerke</DialogTitle>
            {/* eslint-disable-next-line @next/next/no-img-element -- full energy-guide sheet; dialog-only, not catalog LCP */}
            <img
              src={guideUrl}
              alt={altText}
              className="mx-auto h-auto w-full max-h-[calc(90vh-5rem)] max-w-full object-contain md:max-h-[calc(100dvh-5.5rem)]"
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const staticBadge = (
    // eslint-disable-next-line @next/next/no-img-element -- small EU energy badge asset; variable WP SVG/PNG, not LCP catalog media
    <img
      src={energyRatingBadgeUrl}
      alt={altText}
      className={imageBadgeClass}
    />
  );

  if (showTooltip) {
    return (
      <div className={cn("inline-flex shrink-0 items-center", containerClassBySize[size], className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-default items-center">
              {staticBadge}
            </span>
          </TooltipTrigger>
          {tooltipContent}
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex shrink-0 items-center", containerClassBySize[size], className)}>
      {staticBadge}
    </div>
  );
}
