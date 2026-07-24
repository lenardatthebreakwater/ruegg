"use client";

import {
  useRef,
  useState,
  useCallback,
  type PointerEvent,
  type MouseEvent,
} from "react";
import { ExternalLinkIcon, StarIcon } from "lucide-react";
import { motion } from "motion/react";

import { AccentCard } from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { CarouselDots } from "@/components/products/carousel-dots";
import { CarouselLoopNav } from "@/components/products/carousel-loop-nav";
import { SectionIntro, type SectionIntroAlign } from "@/components/section-intro";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { PAGE_SECTION_PY, HOME_PAGE_GRID_GAP } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

export type TestimonialItem = {
  id: string;
  name: string;
  content: string;
  rating: number;
  avatar?: string;
  /** Shown with Google attribution (e.g. relative time from Google API). */
  date?: string;
};

type TestimonialsComponentProps = {
  testimonials: TestimonialItem[];
  title?: string;
  description?: string;
  align?: SectionIntroAlign;
  averageRating: number;
  totalReviews: number;
  buttonLabel?: string;
  buttonHref?: string;
};

const TESTIMONIAL_AVATAR_FALLBACK = "#4a5e6a";

function TestimonialReviewCard({
  testimonial,
  className,
}: {
  testimonial: TestimonialItem;
  className?: string;
}) {
  const initials = testimonial.name
    .split(" ", 2)
    .map((n) => n[0])
    .join("");

  return (
    <AccentCard
      className={cn(
        "group h-full transition-all duration-200 ease-out select-none",
        className,
      )}
    >
      <article
        className="flex h-full flex-col gap-3 px-5 pt-6 pb-6 text-foreground"
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="flex items-center gap-3">
          <Avatar className="size-10 shrink-0">
            {testimonial.avatar ? (
              <AvatarImage
                src={testimonial.avatar}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : null}
            <AvatarFallback
              className="text-sm font-medium text-white"
              style={{ backgroundColor: TESTIMONIAL_AVATAR_FALLBACK }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-display text-base font-semibold leading-snug tracking-tight text-foreground">
            {testimonial.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Rating
            readOnly
            size={18}
            value={testimonial.rating}
            precision={0.5}
            className="[&_[data-filled=true]_svg]:fill-[#FFD700] [&_[data-filled=true]_svg]:stroke-[#FFD700]"
          />
          {testimonial.date ? (
            <span className="text-muted-foreground text-xs">
              {testimonial.date}
            </span>
          ) : null}
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {testimonial.content}
        </p>
      </article>
    </AccentCard>
  );
}

const TESTIMONIAL_CARD_WIDTH = 280;
const TESTIMONIAL_CARD_GAP = 16;
const TESTIMONIAL_VISIBLE_CARDS = 3;
const TESTIMONIAL_DRAG_THRESHOLD_PX = 8;

/** Peek carousel — same loop/scroll pattern as product sliders (half card visible on the right). */
function TestimonialsPeekCarousel({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isPointerDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const shouldSuppressClickRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(
    testimonials.length > TESTIMONIAL_VISIBLE_CARDS,
  );
  const [activePage, setActivePage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalPages = Math.max(
    1,
    Math.ceil(testimonials.length / TESTIMONIAL_VISIBLE_CARDS),
  );

  const scrollToPage = useCallback(
    (pageIndex: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 0) return;
      const left =
        totalPages <= 1
          ? 0
          : (pageIndex / (totalPages - 1)) * maxScrollLeft;
      el.scrollTo({ left, behavior: "smooth" });
    },
    [totalPages],
  );

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step =
      (TESTIMONIAL_CARD_WIDTH + TESTIMONIAL_CARD_GAP) *
      Math.min(2, testimonials.length - 1);
    const newScrollLeft =
      direction === "left" ? el.scrollLeft - step : el.scrollLeft + step;
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
      (el.scrollLeft / maxScrollLeft) * (totalPages - 1),
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
    [updateArrows],
  );

  const hasMore = testimonials.length > TESTIMONIAL_VISIBLE_CARDS;

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
    dragDistanceRef.current = Math.max(
      dragDistanceRef.current,
      Math.abs(deltaX),
    );
    if (dragDistanceRef.current >= TESTIMONIAL_DRAG_THRESHOLD_PX && !isDragging) {
      setIsDragging(true);
    }
    el.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    shouldSuppressClickRef.current =
      dragDistanceRef.current >= TESTIMONIAL_DRAG_THRESHOLD_PX;
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
    <div className="relative">
      {testimonials.length > 1 ? (
        <CarouselLoopNav
          onScrollLeft={() => scroll("left")}
          onScrollRight={() => scroll("right")}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          scrollLeftLabel="Rull anmeldelser til venstre"
          scrollRightLabel="Rull anmeldelser til høyre"
          className="mb-3 justify-end sm:hidden"
        />
      ) : null}

      <div className="relative">
        {testimonials.length > 1 ? (
          <CarouselLoopNav
            onScrollLeft={() => scroll("left")}
            onScrollRight={() => scroll("right")}
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            scrollLeftLabel="Rull anmeldelser til venstre"
            scrollRightLabel="Rull anmeldelser til høyre"
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
            isDragging ? "cursor-grabbing" : "cursor-auto",
          )}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-[280px] shrink-0">
              <TestimonialReviewCard
                testimonial={testimonial}
                className="w-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {hasMore ? (
        <CarouselDots
          total={totalPages}
          activeIndex={activePage}
          onSelect={scrollToPage}
          className="pt-2"
          aria-label="Posisjon i anmeldelseskarusell"
        />
      ) : null}
    </div>
  );
}

function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  if (testimonials.length === 0) {
    return null;
  }

  return <TestimonialsPeekCarousel testimonials={testimonials} />;
}

const TestimonialsComponent = ({
  testimonials,
  title = "Dette sier kundene våre",
  description = "Ekte tilbakemeldinger fra Google — trygghet før du bestemmer deg.",
  align = "center",
  averageRating,
  totalReviews,
  buttonLabel = "Se alle anmeldelser",
  buttonHref = "#",
}: TestimonialsComponentProps) => {
  return (
    <section className={PAGE_SECTION_PY}>
      <ContainedLayout as="div" className={cn("flex flex-col", HOME_PAGE_GRID_GAP)}>
        <SectionIntro
          title={title}
          description={description}
          align={align}
          className={cn(
            "!py-0 mx-0 w-full max-w-none",
            align === "center" && "mx-auto max-w-3xl text-center",
            align === "right" && "ml-auto max-w-3xl text-right",
            align === "left" && "text-left",
          )}
          descriptionClassName="!mt-2 sm:!mt-2"
        />

        <div className="w-full">
          <TestimonialsCarousel testimonials={testimonials} />
        </div>

        <div className="flex w-full flex-col items-center gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-2xl font-semibold">{averageRating.toFixed(1)}</p>
                <StarIcon className="fill-[#FFD700] stroke-[#FFD700]" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Google-vurdering</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{totalReviews}</p>
              <p className="text-muted-foreground text-sm font-medium">anmeldelser</p>
            </div>
            <Button size="lg" asChild>
              <a href={buttonHref} target="_blank" rel="noreferrer">
                {buttonLabel}
                <ExternalLinkIcon data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>
      </ContainedLayout>
    </section>
  );
};

export default TestimonialsComponent;
