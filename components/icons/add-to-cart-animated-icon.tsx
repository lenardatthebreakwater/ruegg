"use client";

/**
 * Shared inline add-to-cart cart icon (AnimateIcons ShoppingCart).
 *
 * ```tsx
 * const { ref, triggerProps } = useAnimatedIcon();
 *
 * <Button className={cn("…", ATC_ICON_BUTTON_CLASS)} {...triggerProps} onClick={…}>
 *   <AddToCartAnimatedIcon ref={ref} />
 *   Legg i handlekurv
 * </Button>
 * ```
 */

import type { Ref } from "react";
import type { IconHandle } from "@animateicons/react";

import { AnimatedShoppingCartIcon } from "@/components/icons/storefront-animated-icons";
import { cn } from "@/lib/utils";

/** Inline ATC icon — matches Button default SVG size-4. */
export const ATC_ICON_PROPS = {
  size: 16,
  duration: 0.75,
  className: "size-4",
  "aria-hidden": true as const,
};

/** Keep nested AnimateIcons SVGs at 16px inside text Buttons. */
export const ATC_ICON_BUTTON_CLASS = "[&_svg]:!size-4";

type AddToCartAnimatedIconProps = {
  ref?: Ref<IconHandle>;
  className?: string;
};

export function AddToCartAnimatedIcon({
  ref,
  className,
}: AddToCartAnimatedIconProps) {
  return (
    <AnimatedShoppingCartIcon
      ref={ref}
      {...ATC_ICON_PROPS}
      className={cn(ATC_ICON_PROPS.className, className)}
      data-icon="inline-start"
    />
  );
}
