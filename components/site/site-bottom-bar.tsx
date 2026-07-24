"use client";

import { usePathname } from "next/navigation";

import OfferModal from "@/components/shadcn-studio/blocks/offer-modal-01/offer-modal-01";
import {
  BOTTOM_BAR_ICON_BUTTON_CLASS,
  BOTTOM_BAR_ICON_PROPS,
  useAnimatedIcon,
} from "@/components/icons/animated-icon";
import { AnimatedNewspaperIcon } from "@/components/icons/storefront-animated-icons";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function BottomBarActionRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none flex justify-end px-4 pb-3 pt-3 sm:px-6 lg:px-8",
        className
      )}
    >
      {/*
        Nyhetsbrev + theme stay pinned to the right edge. Chatway is docked
        to their left via globals.css so it can appear/disappear freely.
      */}
      <div
        data-bottom-bar-actions
        className="pointer-events-auto inline-flex items-center gap-2"
      >
        {children}
      </div>
    </div>
  );
}

function NewsletterButton() {
  const { ref, triggerProps } = useAnimatedIcon();

  // Single hover surface: Button carries tooltip + dialog + icon triggerProps
  // (OfferModal's TooltipTrigger → DialogTrigger → Button asChild chain).
  return (
    <OfferModal
      triggerTooltip="Meld deg på nyhetsbrevet"
      trigger={
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "size-11 rounded-full shadow-lg",
            BOTTOM_BAR_ICON_BUTTON_CLASS
          )}
          aria-label="Nyhetsbrev"
          type="button"
          {...triggerProps}
        >
          <AnimatedNewspaperIcon ref={ref} {...BOTTOM_BAR_ICON_PROPS} />
        </Button>
      }
    />
  );
}

export function SiteBottomBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isProductPage = pathname.startsWith("/produkt");

  function renderActions() {
    return (
      <>
        <NewsletterButton />
        <ThemeToggle />
      </>
    );
  }

  return (
    <div
      data-bottom-bar={isProductPage ? "product" : "default"}
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40",
        isProductPage ? "bottom-[4.5rem]" : "bottom-0",
        className
      )}
    >
      <TooltipProvider delayDuration={400}>
        <BottomBarActionRow className="hidden lg:flex">
          {renderActions()}
        </BottomBarActionRow>
        {isHomepage ? (
          <BottomBarActionRow className="flex lg:hidden">
            {renderActions()}
          </BottomBarActionRow>
        ) : null}
      </TooltipProvider>
    </div>
  );
}
