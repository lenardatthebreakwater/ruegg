"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { cn } from "@/lib/utils";

type HeroJustifiedCopyProps = {
  title: string;
  description: string;
  className?: string;
};

type HeroFitTitleProps = {
  children: string;
  className?: string;
};

function measureTextWidth(element: HTMLElement) {
  return Math.ceil(element.getBoundingClientRect().width);
}

/**
 * Mobile: CSS-only size (no JS reflow after fonts load — that caused the
 * “too big → shrinks after ~2s” jump).
 * Desktop (md+): measure + scaleX for the poster flush-edge look.
 */
function HeroFitTitle({ children, className }: HeroFitTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [desktopStyle, setDesktopStyle] = useState<CSSProperties | undefined>(
    undefined
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const desktopMq = window.matchMedia("(min-width: 768px)");

    const fitDesktop = () => {
      if (!desktopMq.matches) {
        // Mobile uses CSS only — clear any leftover inline size from resize.
        text.style.fontSize = "";
        text.style.transform = "";
        setDesktopStyle(undefined);
        return;
      }

      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;

      const minFontSize = 14;
      const maxFontSize = 120;
      let low = minFontSize;
      let high = maxFontSize;
      let best = minFontSize;

      text.style.transform = "";

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        text.style.fontSize = `${mid}px`;
        const textWidth = measureTextWidth(text);
        if (textWidth <= containerWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      text.style.fontSize = `${best}px`;
      const scaleX = containerWidth / Math.max(measureTextWidth(text), 1);

      setDesktopStyle({
        fontSize: best,
        transform: `scaleX(${scaleX})`,
        transformOrigin: "left center",
      });
    };

    fitDesktop();
    const observer = new ResizeObserver(fitDesktop);
    observer.observe(container);
    desktopMq.addEventListener("change", fitDesktop);

    // Desktop only: re-fit when display fonts arrive (mobile stays on CSS).
    const fontsReady = document.fonts?.ready;
    if (fontsReady) {
      void fontsReady.then(() => {
        if (desktopMq.matches) fitDesktop();
      });
    }

    return () => {
      observer.disconnect();
      desktopMq.removeEventListener("change", fitDesktop);
    };
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-full max-md:overflow-visible md:overflow-hidden"
    >
      <h1
        ref={textRef}
        className={cn(
          "inline-block w-max whitespace-nowrap font-display font-semibold leading-none tracking-tight text-foreground",
          // cqi relative to the 70% copy column — conservative so full title fits ~390px.
          "max-md:text-[length:clamp(1.25rem,9.2cqi,1.85rem)]",
          className,
        )}
        style={desktopStyle}
      >
        {children}
      </h1>
    </div>
  );
}

/** Title + ingress: 70% banner width on mobile, 35% on desktop. */
export function HeroJustifiedCopy({
  title,
  description,
  className,
}: HeroJustifiedCopyProps) {
  return (
    <div
      className={cn(
        "@container w-[70%] min-w-0 max-w-full md:w-[35cqw]",
        className,
      )}
    >
      <HeroFitTitle>{title}</HeroFitTitle>
      <p
        className={cn(
          // Stable weight: avoid font-medium → md:font-normal (and medium fallback
          // looking heavier until Plus Jakarta 500 swaps in).
          "mt-3 w-full text-left text-base font-normal text-foreground/85 sm:mt-4 sm:text-lg",
          "[text-shadow:0_1px_2px_rgb(255_255_255/0.6)] dark:[text-shadow:0_1px_3px_rgb(0_0_0/0.65)]",
        )}
      >
        {description}
      </p>
    </div>
  );
}
