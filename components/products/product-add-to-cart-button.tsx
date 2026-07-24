"use client";

import type { MouseEvent } from "react";
import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AddToCartAnimatedIcon,
  ATC_ICON_BUTTON_CLASS,
} from "@/components/icons/add-to-cart-animated-icon";
import { useAnimatedIcon } from "@/components/icons/animated-icon";
import { cn } from "@/lib/utils";

type ProductAddToCartButtonProps = {
  label: string;
  onAdd: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
};

/**
 * Shared ATC control — same markup/analytics hook surface as inline card buttons.
 * Caller owns stock checks, `addProduct`, and list tracking.
 */
export function ProductAddToCartButton({
  label,
  onAdd,
  disabled = false,
  className,
  size = "default",
}: ProductAddToCartButtonProps) {
  const { ref, triggerProps } = useAnimatedIcon();

  return (
    <Button
      type="button"
      size={size}
      className={cn(ATC_ICON_BUTTON_CLASS, className)}
      disabled={disabled}
      {...triggerProps}
      onClick={onAdd}
    >
      <AddToCartAnimatedIcon ref={ref} />
      {label}
    </Button>
  );
}
