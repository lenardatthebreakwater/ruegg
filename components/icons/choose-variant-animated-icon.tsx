"use client";

/**
 * Shared inline “Velg variant” layers icon (custom calm Layers motion).
 *
 * ```tsx
 * const { ref, triggerProps } = useAnimatedIcon();
 *
 * <Button className={cn("…", VARIANT_ICON_BUTTON_CLASS)} asChild>
 *   <Link href="…" {...triggerProps}>
 *     <ChooseVariantAnimatedIcon ref={ref} />
 *     Velg variant
 *   </Link>
 * </Button>
 * ```
 */

import type { Ref } from "react";
import type { IconHandle } from "@animateicons/react";

import { AnimatedLayersIcon } from "@/components/icons/storefront-animated-icons";
import { cn } from "@/lib/utils";

/**
 * Inline variant icon — calmer/shorter than ATC (0.75).
 * Motion stays inside the 16px glyph so Button overflow-hidden does not clip.
 */
export const VARIANT_ICON_PROPS = {
  size: 16,
  duration: 0.5,
  className: "size-4 shrink-0 overflow-visible",
  "aria-hidden": true as const,
};

/** Keep nested motion SVGs at 16px inside text Buttons. */
export const VARIANT_ICON_BUTTON_CLASS =
  "[&_svg]:!size-4 [&_[data-icon=inline-start]]:overflow-visible";

type ChooseVariantAnimatedIconProps = {
  ref?: Ref<IconHandle>;
  className?: string;
};

export function ChooseVariantAnimatedIcon({
  ref,
  className,
}: ChooseVariantAnimatedIconProps) {
  return (
    <AnimatedLayersIcon
      ref={ref}
      {...VARIANT_ICON_PROPS}
      className={cn(VARIANT_ICON_PROPS.className, className)}
      data-icon="inline-start"
    />
  );
}
