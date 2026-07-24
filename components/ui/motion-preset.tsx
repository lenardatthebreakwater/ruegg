"use client";

import * as React from "react";

import {
  AnimatePresence,
  motion,
  useInView,
  type HTMLMotionProps,
  type UseInViewOptions,
  type Transition,
  type Variant,
} from "motion/react";

type MotionComponent = keyof typeof motion;

export interface MotionPresetProps {
  children?: React.ReactNode;
  className?: string;
  component?: MotionComponent;
  transition?: Transition;
  delay?: number;
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  inViewOnce?: boolean;
  blur?: string | boolean;
  slide?:
    | {
        direction?: "up" | "down" | "left" | "right";
        offset?: number;
      }
    | boolean;
  fade?: { initialOpacity?: number; opacity?: number } | boolean;
  zoom?:
    | {
        initialScale?: number;
        scale?: number;
      }
    | boolean;
  motionProps?: Omit<
    HTMLMotionProps<"div">,
    "children" | "className" | "ref" | "transition"
  >;
  ref?: React.Ref<HTMLElement>;
}

const motionComponents = motion as unknown as Record<
  string,
  typeof motion.div
>;

function MotionPreset({
  ref,
  children,
  className,
  component = "div",
  transition = { type: "spring", stiffness: 200, damping: 20 },
  delay = 0,
  inView = true,
  inViewMargin = "0px",
  inViewOnce = true,
  blur = false,
  slide = false,
  fade = false,
  zoom = false,
  motionProps = {},
}: MotionPresetProps) {
  const localRef = React.useRef<HTMLElement | null>(null);

  React.useImperativeHandle(ref, () => localRef.current as HTMLElement);

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });

  const isInView = !inView || inViewResult;

  const hiddenVariant: Variant = {};
  const visibleVariant: Variant = {};

  if (blur) {
    hiddenVariant.filter = blur === true ? "blur(10px)" : `blur(${blur})`;
    // Use "none" (not blur(0px)): a non-none filter creates a containing block
    // that clips overflowing children (e.g. Turnstile iframe edges).
    visibleVariant.filter = "none";
  }

  if (slide) {
    const offset = slide === true ? 100 : (slide.offset ?? 100);
    const direction = slide === true ? "left" : (slide.direction ?? "left");
    const axis = direction === "up" || direction === "down" ? "y" : "x";

    hiddenVariant[axis] =
      direction === "left" || direction === "up" ? -offset : offset;
    visibleVariant[axis] = 0;
  }

  if (fade) {
    hiddenVariant.opacity = fade === true ? 0 : (fade.initialOpacity ?? 0);
    visibleVariant.opacity = fade === true ? 1 : (fade.opacity ?? 1);
  }

  if (zoom) {
    hiddenVariant.scale = zoom === true ? 0.5 : (zoom.initialScale ?? 0.5);
    visibleVariant.scale = zoom === true ? 1 : (zoom.scale ?? 1);
  }

  const MotionComponent =
    (motionComponents[component] as typeof motion.div) ?? motion.div;

  return (
    <AnimatePresence>
      <MotionComponent
        ref={localRef as React.Ref<HTMLDivElement>}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={{
          hidden: hiddenVariant,
          visible: visibleVariant,
        }}
        transition={{
          ...transition,
          delay: (transition?.delay ?? 0) + delay,
        }}
        className={className}
        {...motionProps}
        onAnimationComplete={(definition) => {
          // Framer may leave filter as blur(0px), which still clips overflow.
          if (blur && localRef.current) {
            localRef.current.style.filter = "none";
          }
          motionProps.onAnimationComplete?.(definition);
        }}
      >
        {children}
      </MotionComponent>
    </AnimatePresence>
  );
}

export { MotionPreset };
