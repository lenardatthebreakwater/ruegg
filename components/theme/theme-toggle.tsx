"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  BOTTOM_BAR_ICON_BUTTON_CLASS,
  BOTTOM_BAR_ICON_PROPS,
  useAnimatedIcon,
} from "@/components/icons/animated-icon";
import {
  AnimatedMoonIcon,
  AnimatedSunIcon,
} from "@/components/icons/storefront-animated-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMountEffect } from "@/lib/hooks/effect-last";
import {
  startViewThemeTransition,
  type ThemeViewTransitionOrigin,
} from "@/lib/theme/start-view-theme-transition";

type Theme = "light" | "dark";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { ref, triggerProps } = useAnimatedIcon();

  useMountEffect(() => {
    setMounted(true);
  });

  function toggleFromPointer(origin?: ThemeViewTransitionOrigin) {
    const currentTheme: Theme = resolvedTheme === "dark" ? "dark" : "light";
    const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    startViewThemeTransition(() => setTheme(nextTheme), origin);
  }

  const buttonClass = cn(
    "size-11 rounded-full shadow-lg",
    BOTTOM_BAR_ICON_BUTTON_CLASS,
    className
  );

  if (!mounted) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={buttonClass}
            aria-label="Bytt tema"
            type="button"
            {...triggerProps}
          >
            <AnimatedSunIcon ref={ref} {...BOTTOM_BAR_ICON_PROPS} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          Bytt tema
        </TooltipContent>
      </Tooltip>
    );
  }

  const currentTheme: Theme = resolvedTheme === "dark" ? "dark" : "light";
  const tooltipLabel =
    currentTheme === "dark" ? "Bytt til lys modus" : "Bytt til mørk modus";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={buttonClass}
          aria-label={tooltipLabel}
          type="button"
          {...triggerProps}
          onClick={(e) =>
            toggleFromPointer(
              e.detail === 0
                ? undefined
                : { clientX: e.clientX, clientY: e.clientY }
            )
          }
        >
          {currentTheme === "dark" ? (
            <AnimatedSunIcon ref={ref} {...BOTTOM_BAR_ICON_PROPS} />
          ) : (
            <AnimatedMoonIcon ref={ref} {...BOTTOM_BAR_ICON_PROPS} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        {tooltipLabel}
      </TooltipContent>
    </Tooltip>
  );
}
