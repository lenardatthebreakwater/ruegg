"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Slider, SliderThumb } from "@/components/ui/slider";

type DualRangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (n: number) => string;
  className?: string;
  sliderClassName?: string;
  sliderTrackClassName?: string;
  sliderRangeClassName?: string;
  thumbClassName?: string;
};

export function DualRangeSlider({
  min,
  max,
  value,
  onValueChange,
  step = 1,
  formatValue = (n) => String(n),
  className,
  sliderClassName,
  sliderTrackClassName,
  sliderRangeClassName,
  thumbClassName,
}: DualRangeSliderProps) {
  const handleChange = (v: number[]) => {
    const [a, b] = v;
    if (a !== undefined && b !== undefined) onValueChange([a, b]);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>
      <Slider
        className={cn("py-2", sliderClassName)}
        trackClassName={sliderTrackClassName}
        rangeClassName={sliderRangeClassName}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={handleChange}
        minStepsBetweenThumbs={1}
      >
        <SliderThumb className={thumbClassName} />
        <SliderThumb className={thumbClassName} />
      </Slider>
    </div>
  );
}
