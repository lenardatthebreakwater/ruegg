"use client";

import { DualRangeSlider } from "@/components/ui/dual-range-slider";

type MaxPowerFilterProps = {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  step?: number;
  maximumFractionDigits?: number;
};

function formatPower(kw: number, maximumFractionDigits: number) {
  return `${new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(kw)} kW`;
}

export function MaxPowerFilter({
  min,
  max,
  value,
  onValueChange,
  step = 1,
  maximumFractionDigits = 0,
}: MaxPowerFilterProps) {
  return (
    <DualRangeSlider
      min={min}
      max={max}
      value={value}
      onValueChange={onValueChange}
      step={step}
      formatValue={(kw) => formatPower(kw, maximumFractionDigits)}
      sliderTrackClassName="bg-muted"
      sliderRangeClassName="bg-foreground"
      thumbClassName="border-foreground"
    />
  );
}
