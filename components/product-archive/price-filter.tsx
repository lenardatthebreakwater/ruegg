"use client";

import { DualRangeSlider } from "@/components/ui/dual-range-slider";

type PriceFilterProps = {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
};

function formatPrice(n: number) {
  return `${new Intl.NumberFormat("nb-NO").format(n)} kr`;
}

export function PriceFilter({ min, max, value, onValueChange }: PriceFilterProps) {
  return (
    <DualRangeSlider
      min={min}
      max={max}
      value={value}
      onValueChange={onValueChange}
      step={500}
      formatValue={formatPrice}
      sliderTrackClassName="bg-muted"
      sliderRangeClassName="bg-foreground"
      thumbClassName="border-foreground"
    />
  );
}
