"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export type CategoryPeekItem = {
  title: string;
  href: string;
  note: string;
  image: string;
};

type CategoryPeekCarouselProps = {
  items: readonly CategoryPeekItem[];
  className?: string;
};

/**
 * Category peek slider — keep the scroll, improve on Swiss:
 * - Controls live above the track (not a sticky pill copy)
 * - Edge fades + dots show there is more
 * - Card / Utforsk hover is the premium detail
 */
export function CategoryPeekCarousel({
  items,
  className,
}: CategoryPeekCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((instance: CarouselApi) => {
    if (!instance) return;
    setSelectedIndex(instance.selectedScrollSnap());
    setCanScrollPrev(instance.canScrollPrev());
    setCanScrollNext(instance.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    queueMicrotask(() => onSelect(api));
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
        loop: false,
        dragFree: false,
        containScroll: "trimSnaps",
      }}
      className={cn("relative w-full", className)}
    >
      <CategoryCarouselToolbar />

      <div className="relative mt-5">
        <CarouselContent className="-ml-3 md:-ml-5">
          {items.map((category) => (
            <CarouselItem
              key={category.title}
              className="basis-[85%] pl-3 sm:basis-[60%] md:basis-[48%] md:pl-5 lg:basis-[40%]"
            >
              <CategoryPeekCard category={category} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Soft edge fades — hint more content without Swiss sticky chrome */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[color:var(--ruegg-swiss-cream)] to-transparent transition-opacity duration-300 sm:w-14",
            canScrollPrev ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[color:var(--ruegg-swiss-cream)] to-transparent transition-opacity duration-300 sm:w-14",
            canScrollNext ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
      </div>

      <CategoryCarouselDots
        count={items.length}
        selectedIndex={selectedIndex}
      />
    </Carousel>
  );
}

function CategoryCarouselToolbar() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        aria-label="Forrige peistype"
        className={cn(
          "h-11 gap-2 rounded-sm border-[color:var(--ruegg-swiss-border)] bg-[color:var(--ruegg-swiss-paper)] px-3.5",
          "text-[color:var(--ruegg-swiss-ink)] shadow-sm",
          "hover:border-[color:var(--ruegg-swiss-ink)]/35 hover:bg-[color:var(--ruegg-swiss-cream)]",
          "disabled:opacity-35",
        )}
      >
        <ChevronLeftIcon className="size-5" aria-hidden />
        <span className="hidden text-sm font-medium sm:inline">Forrige</span>
      </Button>
      <Button
        type="button"
        disabled={!canScrollNext}
        onClick={scrollNext}
        aria-label="Neste peistype"
        className={cn(
          "h-11 gap-2 rounded-sm bg-[color:var(--ruegg-swiss-ink)] px-3.5",
          "text-[color:var(--ruegg-swiss-paper)] shadow-sm",
          "hover:bg-[color:var(--ruegg-swiss-deep)]",
          "disabled:opacity-35",
        )}
      >
        <span className="hidden text-sm font-medium sm:inline">Neste</span>
        <ChevronRightIcon className="size-5" aria-hidden />
      </Button>
    </div>
  );
}

function CategoryCarouselDots({
  count,
  selectedIndex,
}: {
  count: number;
  selectedIndex: number;
}) {
  const { api } = useCarousel();

  return (
    <div
      className="mt-6 flex items-center justify-center gap-2"
      role="tablist"
      aria-label="Peistyper"
    >
      {Array.from({ length: count }, (_, index) => {
        const active = index === selectedIndex;
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Gå til peistype ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              active
                ? "w-7 bg-[color:var(--ruegg-swiss-ink)]"
                : "w-2 bg-[color:var(--ruegg-swiss-taupe)] hover:bg-[color:var(--ruegg-swiss-ink)]/45",
            )}
          />
        );
      })}
    </div>
  );
}

function CategoryPeekCard({ category }: { category: CategoryPeekItem }) {
  return (
    <Link
      href={category.href}
      className="group relative block h-full overflow-hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ruegg-swiss-ink)]/40"
    >
      <div className="relative min-h-[26rem] w-full overflow-hidden bg-[color:var(--ruegg-swiss-taupe)]/40 sm:min-h-[30rem] lg:min-h-[34rem]">
        <Image
          src={category.image}
          alt=""
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 55vw, 40vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[color:var(--ruegg-swiss-deep)]/85 via-[color:var(--ruegg-swiss-deep)]/25 to-transparent transition-opacity duration-500 group-hover:from-[color:var(--ruegg-swiss-deep)]/90"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 text-[color:var(--ruegg-swiss-paper)] sm:p-6">
          <div className="translate-y-0 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
            <p className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
              {category.title}
            </p>
            <p className="mt-1.5 max-w-[28ch] text-sm text-white/80 sm:text-base">
              {category.note}
            </p>
          </div>
          <span
            className={cn(
              "group/utforsk relative inline-flex w-fit overflow-hidden rounded-sm",
              "bg-[color:var(--ruegg-swiss-ink)] shadow-md",
              "transition-shadow duration-700 hover:shadow-lg",
              "motion-reduce:transition-none",
            )}
          >
            {/* Wipe only when this control is hovered — not the whole card */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 origin-left scale-x-0 bg-[color:var(--ruegg-swiss-paper)]",
                "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "group-hover/utforsk:scale-x-100",
                "motion-reduce:transition-none motion-reduce:group-hover/utforsk:scale-x-100",
              )}
            />
            <span
              className={cn(
                "relative z-10 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide",
                "text-[color:var(--ruegg-swiss-paper)]",
                "transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "group-hover/utforsk:text-[color:var(--ruegg-swiss-ink)]",
                "motion-reduce:transition-none",
              )}
            >
              Utforsk
              <ChevronRightIcon
                className={cn(
                  "size-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "group-hover/utforsk:translate-x-1",
                  "motion-reduce:transition-none motion-reduce:group-hover/utforsk:translate-x-0",
                )}
                aria-hidden
              />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
