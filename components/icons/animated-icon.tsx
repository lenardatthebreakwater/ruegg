"use client";

/**
 * Shared micro-animation icon primitives (AnimateIcons + motion).
 *
 * ## How to reuse
 *
 * ```tsx
 * const { ref, triggerProps } = useAnimatedIcon();
 *
 * <Link href="..." {...triggerProps}>
 *   <SomeAnimatedIcon ref={ref} {...ANIMATED_ICON_PROPS} />
 *   Label
 * </Link>
 * ```
 *
 * - Spread `triggerProps` on the interactive parent (link/button/card).
 * - Pass `ref` to any animated icon that exposes `IconHandle`.
 * - Override size/duration as needed (inline actions often use `size={16}`).
 * - Respects `prefers-reduced-motion` (animations no-op).
 *
 * ## Motion rule (outer vs accent)
 *
 * Outer keyframe timelines on the SVG root MUST end at identity
 * (`scale: 1`, `rotate: 0`, `x/y: 0`) so the silhouette matches idle when
 * play finishes. Accents (nested paths/groups) may hold internal detail
 * changes (opacity, pathLength, nested scale) that differ from idle mid-play,
 * but should still settle cleanly when `playing` becomes false.
 */

import {
  Fragment,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentType,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import type { IconHandle } from "@animateicons/react";
import {
  useReducedMotion,
  type Transition,
  type TargetAndTransition,
} from "motion/react";

import { cn } from "@/lib/utils";

export type AnimatedIconHandle = IconHandle;

type AnimateIconsProps = {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

export type AnimatedIconComponent = ComponentType<
  AnimateIconsProps & { ref?: Ref<IconHandle> }
>;

/** Shared props for overview / strip icons (size-5 ≈ 20px). */
export const ANIMATED_ICON_PROPS = {
  size: 20,
  duration: 0.75,
  "aria-hidden": true as const,
};

/**
 * Header action icons — matches prior Lucide `className="size-6"`.
 * AnimateIcons put `className` on a wrapper div; the SVG still needs an
 * explicit size utility (see `HEADER_ICON_BUTTON_CLASS`) because shadcn
 * Button applies `[&_svg:not([class*='size-'])]:size-4`.
 */
export const HEADER_ICON_PROPS = {
  size: 24,
  duration: 0.75,
  className: "size-6",
  "aria-hidden": true as const,
};

/**
 * Spread onto header icon Buttons so nested AnimateIcons SVGs stay at
 * 24px (size-6) instead of the Button default size-4.
 */
export const HEADER_ICON_BUTTON_CLASS = "[&_svg]:!size-6";

/**
 * Floating bottom-bar action icons — matches prior Lucide `className="size-5"`.
 */
export const BOTTOM_BAR_ICON_PROPS = {
  size: 20,
  duration: 0.75,
  className: "size-5",
  "aria-hidden": true as const,
};

/** Keep nested AnimateIcons / motion SVGs at 20px inside size="icon" Buttons. */
export const BOTTOM_BAR_ICON_BUTTON_CLASS = "[&_svg]:!size-5";

/**
 * Parent-driven animation trigger. Attach `ref` to the icon and spread
 * `triggerProps` on the card link/button so hover/focus animates even when
 * the pointer is not over the SVG itself.
 * Icons no-op when prefers-reduced-motion is set.
 */
export function useAnimatedIcon() {
  const ref = useRef<IconHandle>(null);

  return {
    ref,
    triggerProps: {
      onMouseEnter: () => {
        ref.current?.startAnimation();
      },
      onMouseLeave: () => {
        ref.current?.stopAnimation();
      },
      onFocus: () => {
        ref.current?.startAnimation();
      },
      onBlur: () => {
        ref.current?.stopAnimation();
      },
    },
  };
}

type MotionIconProps = AnimateIconsProps &
  Omit<
    HTMLAttributes<HTMLDivElement>,
    "color" | "onDrag" | "onDragStart" | "onDragEnd" | "children"
  >;

export type MotionIconRenderArgs = {
  size: number;
  /** Tailwind size utility on the SVG so Button’s default size-4 does not win. */
  svgClassName?: string;
  /** True while parent hover/focus requests the play keyframes. */
  playing: boolean;
  /**
   * Increments on each `startAnimation()` — used as Fragment remount key
   * (see `createAnimatedMotionIcon`). Prefer the factory remount over reading
   * this in icon renderers.
   */
  playNonce: number;
  duration: number;
};

/** Idle outer transform — always identity (see motion rule above). */
export const OUTER_IDLE = {
  rotate: 0,
  scale: 1,
  x: 0,
  y: 0,
} as const;

/**
 * Shared outer scale peaks. Prefer these over one-off magic numbers when the
 * motion is a simple identity → peak → identity pulse.
 */
export const MOTION_SCALE = {
  /** Min konto cards / dense rows — barely visible bob. */
  account: 1.02,
  /** Floating + theme icons (Sun/Moon/Store/BrickWall). */
  storefront: 1.14,
  /** Softer storefront chrome (Newspaper/Wrench). */
  storefrontSoft: 1.12,
} as const;

/** `[1, peak, 1]` — outer scale pulse that settles at identity. */
export function outerScaleKeyframes(peak: number): number[] {
  return [1, peak, 1];
}

export function outerTransition(duration: number): Transition {
  return { duration: 0.6 * duration, ease: "easeInOut" };
}

/** Pair play/idle targets for declarative `animate` / `transition` props. */
export function motionPlayState(
  playing: boolean,
  active: TargetAndTransition,
  idle: TargetAndTransition,
  activeTransition: Transition,
  idleTransition: Transition = { duration: 0.2 }
): { animate: TargetAndTransition; transition: Transition } {
  return {
    animate: playing ? active : idle,
    transition: playing ? activeTransition : idleTransition,
  };
}

/**
 * Factory for calm in-glyph motion icons.
 * Uses declarative `playing` state (not useAnimationControls) so transforms
 * reliably apply under Motion 12 + React 19.
 */
export function createAnimatedMotionIcon(
  displayName: string,
  render: (args: MotionIconRenderArgs) => ReactNode
) {
  const Icon = forwardRef<IconHandle, MotionIconProps>(
    function AnimatedMotionIcon(
      {
        size = 20,
        duration = 0.75,
        isAnimated = true,
        className,
        onMouseEnter,
        onMouseLeave,
        ...rest
      },
      ref
    ) {
      const reduceMotion = useReducedMotion();
      const [playing, setPlaying] = useState(false);
      const [playNonce, setPlayNonce] = useState(0);
      const controlled = useRef(false);

      const play = useCallback(() => {
        if (reduceMotion || !isAnimated) {
          setPlaying(false);
          return;
        }
        // Bump nonce so keyframe timelines restart even if `playing` stays true.
        setPlayNonce((n) => n + 1);
        setPlaying(true);
      }, [isAnimated, reduceMotion]);

      useImperativeHandle(
        ref,
        () => {
          controlled.current = true;
          return {
            startAnimation: play,
            stopAnimation: () => {
              setPlaying(false);
            },
          };
        },
        [play]
      );

      const handleEnter = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
          if (!isAnimated || reduceMotion) {
            onMouseEnter?.(event);
            return;
          }
          // Always play on direct icon hit. Parent `triggerProps` still drive
          // hover on button padding; leave stays parent-owned when controlled
          // so moving from SVG → padding does not stop the animation early.
          play();
          onMouseEnter?.(event);
        },
        [isAnimated, onMouseEnter, play, reduceMotion]
      );

      const handleLeave = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
          if (controlled.current) {
            onMouseLeave?.(event);
            return;
          }
          setPlaying(false);
          onMouseLeave?.(event);
        },
        [onMouseLeave]
      );

      const svgSizeClass =
        size === 24
          ? "size-6"
          : size === 20
            ? "size-5"
            : size === 16
              ? "size-4"
              : undefined;

      return (
        <div
          className={cn("inline-flex items-center justify-center", className)}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          {...rest}
        >
          {/*
            Remount on playNonce: Motion 12 + declarative `animate` arrays do
            not reliably restart a timeline when `playing` stays true
            (re-hover without leave). Remounting the render tree is the small,
            safe restart — avoid useAnimationControls / imperative sequences
            unless Motion gains a cleaner restart API we can adopt.
          */}
          <Fragment key={playing ? `play-${playNonce}` : "idle"}>
            {render({
              size,
              svgClassName: svgSizeClass,
              playing,
              playNonce,
              duration,
            })}
          </Fragment>
        </div>
      );
    }
  );

  Icon.displayName = displayName;
  return Icon as AnimatedIconComponent;
}
