"use client";

import {
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { CarouselDots } from "@/components/products/carousel-dots";
import { CarouselLoopNav } from "@/components/products/carousel-loop-nav";
import { ProductCardAccessory } from "@/components/products/product-card-accessory";
import { SectionIntro } from "@/components/section-intro";
import { slugifyItemListId } from "@/lib/analytics/ga4-item";
import { useViewItemListImpression } from "@/lib/analytics/use-view-item-list-impression";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

const ACCESSORIES_LIST_NAME = "Anbefalt tilbehør";
const ACCESSORIES_LIST_ID = slugifyItemListId(ACCESSORIES_LIST_NAME);

const VISIBLE_CARDS = 3;
const CARD_WIDTH = 280;
const GAP = 16;
const DRAG_THRESHOLD_PX = 8;

type RecommendedAccessoriesCarouselProps = {
  accessories: Product[];
  className?: string;
};

export function RecommendedAccessoriesCarousel({
  accessories,
  className,
}: RecommendedAccessoriesCarouselProps) {
  useViewItemListImpression(
    accessories,
    ACCESSORIES_LIST_NAME,
    ACCESSORIES_LIST_ID
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isPointerDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const shouldSuppressClickRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(
    accessories.length > VISIBLE_CARDS
  );
  const [activePage, setActivePage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalPages = Math.max(1, Math.ceil(accessories.length / VISIBLE_CARDS));

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);

    if (totalPages <= 1 || maxScrollLeft <= 0) {
      setActivePage(0);
      return;
    }

    const page = Math.round((el.scrollLeft / maxScrollLeft) * (totalPages - 1));
    setActivePage(Math.min(Math.max(0, page), totalPages - 1));
  }, [totalPages]);

  const setScrollContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      scrollRef.current = node;
      if (!node) return;

      updateArrows();
      const observer = new ResizeObserver(updateArrows);
      observer.observe(node);
      resizeObserverRef.current = observer;
    },
    [updateArrows]
  );

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = (CARD_WIDTH + GAP) * Math.min(2, accessories.length - 1);
    const nextScrollLeft =
      direction === "left" ? el.scrollLeft - step : el.scrollLeft + step;
    el.scrollTo({ left: Math.max(0, nextScrollLeft), behavior: "smooth" });
  };

  const scrollToPage = useCallback(
    (pageIndex: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 0) return;
      const left =
        totalPages <= 1 ? 0 : (pageIndex / (totalPages - 1)) * maxScrollLeft;
      el.scrollTo({ left, behavior: "smooth" });
    },
    [totalPages]
  );

  const hasMore = accessories.length > VISIBLE_CARDS;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    isPointerDraggingRef.current = true;
    dragDistanceRef.current = 0;
    shouldSuppressClickRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    setIsDragging(false);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isPointerDraggingRef.current || event.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    const deltaX = event.clientX - dragStartXRef.current;
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(deltaX));
    if (dragDistanceRef.current >= DRAG_THRESHOLD_PX && !isDragging) {
      setIsDragging(true);
    }
    el.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    shouldSuppressClickRef.current = dragDistanceRef.current >= DRAG_THRESHOLD_PX;
    isPointerDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!shouldSuppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    shouldSuppressClickRef.current = false;
    dragDistanceRef.current = 0;
  };

  return (
    <section className={cn("w-full", className)}>
      <SectionIntro
        title="Anbefalt tilbehør"
        description="Kompletter peisen med tilbehør som passer perfekt til denne modellen."
        align="center"
        className="mb-0 sm:mb-8"
      />
      {accessories.length > 1 ? (
        <CarouselLoopNav
          onScrollLeft={() => scroll("left")}
          onScrollRight={() => scroll("right")}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          scrollLeftLabel="Scroll tilbehør til venstre"
          scrollRightLabel="Scroll tilbehør til høyre"
          className="mb-3 justify-end sm:hidden"
        />
      ) : null}
      <div className="relative">
        {accessories.length > 1 ? (
          <CarouselLoopNav
            onScrollLeft={() => scroll("left")}
            onScrollRight={() => scroll("right")}
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            scrollLeftLabel="Scroll tilbehør til venstre"
            scrollRightLabel="Scroll tilbehør til høyre"
            className="absolute right-0 top-0 z-10 -mt-4 hidden -translate-y-full justify-end sm:flex"
          />
        ) : null}

        <div
          ref={setScrollContainerRef}
          onScroll={updateArrows}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClickCapture={handleClickCapture}
          className={cn(
            "flex gap-4 overflow-x-auto overflow-y-hidden py-1 pb-3 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            isDragging ? "cursor-grabbing" : "cursor-auto"
          )}
        >
          {accessories.map((accessory, index) => (
            <div key={accessory.id} className="w-[280px] shrink-0">
              <ProductCardAccessory
                product={accessory}
                className="w-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
                listId={ACCESSORIES_LIST_ID}
                listName={ACCESSORIES_LIST_NAME}
                listIndex={index}
              />
            </div>
          ))}
        </div>
      </div>

      {hasMore ? (
        <CarouselDots
          total={totalPages}
          activeIndex={activePage}
          onSelect={scrollToPage}
          className="pt-2"
          aria-label="Anbefalt tilbehør posisjon"
        />
      ) : null}
    </section>
  );
}
