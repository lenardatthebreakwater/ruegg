"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearch } from "@/components/search/search-provider";
import {
  HEADER_ICON_BUTTON_CLASS,
  HEADER_ICON_PROPS,
  useAnimatedIcon,
} from "@/components/icons/animated-icon";
import { AnimatedSearchIcon } from "@/components/icons/storefront-animated-icons";
import { RueggWordmark } from "@/components/brand/ruegg-wordmark";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { RueggMobileNavSheet } from "@/components/navbar/ruegg-mobile-nav-sheet";
import { RueggNavLinks } from "@/components/navbar/ruegg-nav-links";
import { cn } from "@/lib/utils";

function NavbarSearchButton() {
  const { setOpen: setSearchOpen } = useSearch();
  const { ref, triggerProps } = useAnimatedIcon();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-neutral-700 hover:bg-black/5 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white",
            HEADER_ICON_BUTTON_CLASS,
          )}
          aria-label="Søk"
          {...triggerProps}
          onClick={() => setSearchOpen(true)}
        >
          <AnimatedSearchIcon ref={ref} {...HEADER_ICON_PROPS} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Søk</TooltipContent>
    </Tooltip>
  );
}

export function SiteNavbar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-neutral-200/70 bg-white/70 py-3 text-neutral-900 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/55 dark:text-neutral-100",
        "rounded-none rounded-tl-none rounded-tr-none",
        className,
      )}
    >
      <ContainedLayout
        as="div"
        className="relative z-10 flex items-center justify-between gap-4"
      >
        <div className="flex min-w-0 items-center gap-2">
          <RueggMobileNavSheet />
          <RueggWordmark />
        </div>

        <div className="hidden flex-1 justify-center lg:flex">
          <RueggNavLinks />
        </div>

        <div className="flex shrink-0 justify-end">
          <nav className="flex items-center gap-1" aria-label="Handlinger">
            <NavbarSearchButton />
          </nav>
        </div>
      </ContainedLayout>
    </header>
  );
}
