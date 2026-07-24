"use client";

import { MessageSquare } from "lucide-react";

import { ContactFormDialog } from "@/components/contact/contact-form-dialog";
import {
  BOTTOM_BAR_ICON_BUTTON_CLASS,
  BOTTOM_BAR_ICON_PROPS,
  useAnimatedIcon,
} from "@/components/icons/animated-icon";
import { AnimatedMessageCircleIcon } from "@/components/icons/storefront-animated-icons";
import { Button } from "@/components/ui/button";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

type AskExpertDialogProps = {
  product: Product;
  triggerVariant: "default" | "icon";
  className?: string;
};

export function AskExpertDialog({ product, triggerVariant, className }: AskExpertDialogProps) {
  const { ref, triggerProps } = useAnimatedIcon();

  const trigger =
    triggerVariant === "icon" ? (
      <Button
        variant="outline"
        size="icon-lg"
        className={cn("shrink-0", BOTTOM_BAR_ICON_BUTTON_CLASS, className)}
        aria-label="Spør en ekspert"
        type="button"
        {...triggerProps}
      >
        <AnimatedMessageCircleIcon ref={ref} {...BOTTOM_BAR_ICON_PROPS} />
      </Button>
    ) : (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "h-10 min-h-10 min-w-0 shrink overflow-hidden whitespace-nowrap text-xs sm:text-sm motion-safe:hover:scale-[1.01]",
          className
        )}
      >
        <MessageSquare data-icon="inline-start" />
        Spør en ekspert
      </Button>
    );

  return (
    <ContactFormDialog
      title="Spør en ekspert"
      description={
        <>
          Vi svarer deg så raskt vi kan. Henvendelsen gjelder:{" "}
          <span className="font-medium text-foreground">{product.name}</span>
        </>
      }
      formName={CONTACT_FORM_PLACEMENTS.productExpert.formName}
      formId={CONTACT_FORM_PLACEMENTS.productExpert.formId}
      productName={product.name}
      trigger={trigger}
    />
  );
}
