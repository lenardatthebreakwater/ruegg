"use client";

import Image from "next/image";
import { motion, type MotionValue, useReducedMotion, useTransform } from "motion/react";

const SLIDES = [
  {
    src: "/images/homepage/shell/category-peisovn.jpg",
    alt: "Peisovn",
  },
  {
    src: "/images/homepage/shell/category-peisinnsats.jpg",
    alt: "Peisinnsats",
  },
  {
    src: "/images/homepage/shell/category-utepeis.jpg",
    alt: "Utepeis",
  },
  {
    src: "/images/homepage/shell/category-peis.jpg",
    alt: "Peis",
  },
] as const;

const N = SLIDES.length;

type StepModelCarouselProps = {
  progress: MotionValue<number>;
};

function wrapDelta(delta: number, count: number) {
  let d = delta;
  while (d > count / 2) d -= count;
  while (d < -count / 2) d += count;
  return d;
}

/**
 * Peek carousel scrubbed by scroll.
 * Scroll down → slides travel left-to-right; scroll up reverses.
 */
export function StepModelCarousel({ progress }: StepModelCarouselProps) {
  const reduce = useReducedMotion();
  // Finish the full slide travel by ~0.85 so it completes before step handoff.
  const position = useTransform(progress, [0, 0.85], [0, N - 0.001]);

  if (reduce) {
    return (
      <div className="relative aspect-[5/4] w-full max-w-md overflow-hidden rounded-sm border border-[color:var(--ruegg-swiss-border)] bg-[color:var(--ruegg-swiss-cream)]">
        <Image
          src={SLIDES[0].src}
          alt={SLIDES[0].alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 90vw, 28rem"
        />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-xl overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Peismodeller"
    >
      <div className="relative aspect-[5/4] w-full overflow-hidden">
        {SLIDES.map((slide, index) => (
          <CarouselSlide
            key={slide.src}
            slide={slide}
            index={index}
            position={position}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
        {SLIDES.map((slide, i) => (
          <CarouselDot key={slide.src} index={i} position={position} />
        ))}
      </div>
    </div>
  );
}

function CarouselSlide({
  slide,
  index,
  position,
}: {
  slide: (typeof SLIDES)[number];
  index: number;
  position: MotionValue<number>;
}) {
  // Invert offset so scroll-down moves slides left → right.
  const x = useTransform(position, (pos) => {
    const offset = wrapDelta(index - pos, N);
    return `calc(-50% + ${-offset * 44}%)`;
  });
  const scale = useTransform(position, (pos) => {
    const offset = Math.abs(wrapDelta(index - pos, N));
    if (offset < 0.5) return 1;
    if (offset <= 1.15) return 0.82;
    return 0.7;
  });
  const opacity = useTransform(position, (pos) => {
    const offset = Math.abs(wrapDelta(index - pos, N));
    if (offset > 1.2) return 0;
    if (offset < 0.4) return 1;
    return 0.55;
  });
  const zIndex = useTransform(position, (pos) => {
    const offset = Math.abs(wrapDelta(index - pos, N));
    return offset < 0.5 ? 20 : 10;
  });

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 aspect-[4/5] w-[76%] overflow-hidden rounded-sm border border-[color:var(--ruegg-swiss-border)] bg-[color:var(--ruegg-swiss-cream)] shadow-[0_18px_40px_-28px_rgba(57,54,35,0.55)]"
      style={{ x, y: "-50%", scale, opacity, zIndex }}
    >
      <Image
        src={slide.src}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 70vw, 20rem"
      />
    </motion.div>
  );
}

function CarouselDot({
  index,
  position,
}: {
  index: number;
  position: MotionValue<number>;
}) {
  const opacity = useTransform(position, (pos) => {
    const nearest = ((Math.round(pos) % N) + N) % N;
    return nearest === index ? 1 : 0.25;
  });

  return (
    <motion.span
      className="h-1.5 w-1.5 rounded-full bg-[color:var(--ruegg-swiss-ink)]"
      style={{ opacity }}
    />
  );
}
