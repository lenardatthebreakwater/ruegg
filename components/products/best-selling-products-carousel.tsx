"use client";

import {
  useRef,
  useState,
  useCallback,
  type PointerEvent,
  type MouseEvent,
} from "react";
import { motion } from "motion/react";
import { ProductCard } from "@/components/products/product-card";
import { CarouselDots } from "@/components/products/carousel-dots";
import { CarouselLoopNav } from "@/components/products/carousel-loop-nav";
import { SectionIntro, type SectionIntroAlign } from "@/components/section-intro";
import { slugifyItemListId } from "@/lib/analytics/ga4-item";
import { useViewItemListImpression } from "@/lib/analytics/use-view-item-list-impression";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

const CARD_WIDTH = 280;
const DRAG_THRESHOLD_PX = 8;

type BestSellingProductsCarouselProps = {
  products: Product[];
  title?: string;
  description?: string;
  descriptionClassName?: string;
  align?: SectionIntroAlign;
  className?: string;
  /** When set, matching product slugs get the ProductCard «Kjøpt» owned state. */
  ownedProductSlugs?: string[];
  compact?: boolean;
  /** Override analytics list id (defaults from title). */
  listId?: string;
  /** Override analytics list name (defaults to title). */
  listName?: string;
};

export function BestSellingProductsCarousel({
  products,
  title = "Best selling products",
  description,
  descriptionClassName,
  align = "left",
  className,
  ownedProductSlugs,
  compact = false,
  listId: listIdProp,
  listName: listNameProp,
}: BestSellingProductsCarouselProps) {
  const listName = listNameProp ?? title;
  const listId = listIdProp ?? slugifyItemListId(listName);
  const ownedSet = ownedProductSlugs
    ? new Set(ownedProductSlugs.map((slug) => slug.trim().toLowerCase()))
    : null;
  useViewItemListImpression(products, listName, listId);

  const visibleCards = 3;
  const gapSize = 16;
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isPointerDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const shouldSuppressClickRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(
    products.length > visibleCards
  );
  const [activePage, setActivePage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalPages = Math.max(1, Math.ceil(products.length / visibleCards));

  const scrollToPage = useCallback((pageIndex: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 0) return;
    const left =
      totalPages <= 1
        ? 0
        : (pageIndex / (totalPages - 1)) * maxScrollLeft;
    el.scrollTo({ left, behavior: "smooth" });
  }, [totalPages]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = (CARD_WIDTH + gapSize) * Math.min(2, products.length - 1);
    const newScrollLeft =
      direction === "left"
        ? el.scrollLeft - step
        : el.scrollLeft + step;
    el.scrollTo({ left: Math.max(0, newScrollLeft), behavior: "smooth" });
  };

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
    const page = Math.round(
      (el.scrollLeft / maxScrollLeft) * (totalPages - 1)
    );
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

  const hasMore = products.length > visibleCards;

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col gap-0"
      >
        <SectionIntro
          title={title}
          description={description}
          descriptionClassName={descriptionClassName}
          align={align}
          className={cn("min-w-0 mb-0 sm:mb-8")}
        />
      </motion.div>

      {products.length > 1 ? (
        <CarouselLoopNav
          onScrollLeft={() => scroll("left")}
          onScrollRight={() => scroll("right")}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          scrollLeftLabel="Rull produkter til venstre"
          scrollRightLabel="Rull produkter til høyre"
          className="mb-3 justify-end sm:hidden"
        />
      ) : null}

      <div className="relative">
        {products.length > 1 ? (
          <CarouselLoopNav
            onScrollLeft={() => scroll("left")}
            onScrollRight={() => scroll("right")}
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            scrollLeftLabel="Rull produkter til venstre"
            scrollRightLabel="Rull produkter til høyre"
            className="pointer-events-auto absolute right-0 top-0 z-10 -mt-4 hidden -translate-y-full justify-end sm:flex"
          />
        ) : null}

        <motion.div
          ref={setScrollContainerRef}
          onScroll={updateArrows}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClickCapture={handleClickCapture}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.85, ease: "easeOut", delay: 0.08 }}
          className={cn(
            "flex gap-4 overflow-x-auto overflow-y-hidden py-1 pb-3 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            isDragging ? "cursor-grabbing" : "cursor-auto"
          )}
        >
          {products.map((product, index) => (
            <div key={product.id} className="w-[280px] shrink-0">
              <ProductCard
                product={product}
                owned={
                  ownedSet
                    ? ownedSet.has(product.slug.trim().toLowerCase())
                    : undefined
                }
                compact={compact}
                className="w-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
                listId={listId}
                listName={listName}
                listIndex={index}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {hasMore && (
        <CarouselDots
          total={totalPages}
          activeIndex={activePage}
          onSelect={scrollToPage}
          className="pt-2"
          aria-label="Posisjon i produktkarusell"
        />
      )}
    </section>
  );
}
