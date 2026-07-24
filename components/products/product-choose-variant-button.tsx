"use client";

import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ChooseVariantAnimatedIcon,
  VARIANT_ICON_BUTTON_CLASS,
} from "@/components/icons/choose-variant-animated-icon";
import { useAnimatedIcon } from "@/components/icons/animated-icon";
import { cn } from "@/lib/utils";

type ProductChooseVariantButtonProps = {
  href: string;
  onNavigate?: () => void;
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
};

/**
 * Shared “Velg variant” control — same AnimateIcons hover/focus trigger
 * pattern as {@link ProductAddToCartButton}.
 */
export function ProductChooseVariantButton({
  href,
  onNavigate,
  className,
  size = "default",
}: ProductChooseVariantButtonProps) {
  const { ref, triggerProps } = useAnimatedIcon();

  return (
    <Button
      type="button"
      size={size}
      className={cn(VARIANT_ICON_BUTTON_CLASS, className)}
      asChild
    >
      <Link href={href} {...triggerProps} onClick={onNavigate}>
        <ChooseVariantAnimatedIcon ref={ref} />
        Velg variant
      </Link>
    </Button>
  );
}
