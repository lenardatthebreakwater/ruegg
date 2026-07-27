"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/components/homepage/shell/hero/hero-slides";
import { cn } from "@/lib/utils";

type HeroSlideControlsProps = {
  slides: readonly HeroSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

export function HeroSlideControls({
  slides,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
  className,
}: HeroSlideControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 sm:gap-4",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Peistyper"
        className="flex flex-wrap gap-1.5"
      >
        {slides.map((slide, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="home-shell-hero-stage"
              id={`hero-tab-${slide.id}`}
              onClick={() => onSelect(index)}
              className={cn(
                "rounded-sm px-3 py-2 text-sm font-medium tracking-wide transition-colors",
                selected
                  ? "bg-[color:var(--ruegg-swiss-paper)] text-[color:var(--ruegg-swiss-ink)]"
                  : "bg-transparent text-[color:var(--ruegg-swiss-paper)]/70 hover:text-[color:var(--ruegg-swiss-paper)]",
              )}
            >
              {slide.label}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Forrige peistype"
          onClick={onPrev}
          className={cn(
            "size-10 rounded-sm border-[color:var(--ruegg-swiss-paper)]/30 bg-transparent",
            "text-[color:var(--ruegg-swiss-paper)] hover:bg-[color:var(--ruegg-swiss-paper)]/10 hover:text-[color:var(--ruegg-swiss-paper)]",
          )}
        >
          <ChevronLeftIcon className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Neste peistype"
          onClick={onNext}
          className={cn(
            "size-10 rounded-sm border-[color:var(--ruegg-swiss-paper)]/30 bg-transparent",
            "text-[color:var(--ruegg-swiss-paper)] hover:bg-[color:var(--ruegg-swiss-paper)]/10 hover:text-[color:var(--ruegg-swiss-paper)]",
          )}
        >
          <ChevronRightIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
}
