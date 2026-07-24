"use client";

import { Zap } from "lucide-react";
import {
  ENERGY_LABEL_PDP_TOOLTIP,
  EnergyLabelBadge,
} from "@/components/product-detail/energy-label-badge";

type EnergyLabelRowProps = {
  energyLabel?: string | null;
  energyRatingBadgeUrl?: string | null;
  energyLabelGuideUrl?: string | null;
};

/** Product detail row: label + shared `EnergyLabelBadge`. */
export function EnergyLabelRow({
  energyLabel,
  energyRatingBadgeUrl,
  energyLabelGuideUrl,
}: EnergyLabelRowProps) {
  if (!energyRatingBadgeUrl) return null;

  const hasFullGuide = Boolean(energyLabelGuideUrl);

  return (
    <div className="flex items-center gap-3">
      <Zap className="size-4 shrink-0 text-foreground/70" />
      <span className="font-semibold">Energiklasse:</span>
      <EnergyLabelBadge
        energyLabel={energyLabel}
        energyRatingBadgeUrl={energyRatingBadgeUrl}
        energyLabelGuideUrl={energyLabelGuideUrl}
        size="md"
        showTooltip={hasFullGuide}
        tooltipMessage={ENERGY_LABEL_PDP_TOOLTIP}
      />
    </div>
  );
}
