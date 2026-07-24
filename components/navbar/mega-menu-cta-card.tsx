import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavMenuItemDef } from "./nav-menu-data";

type MegaMenuCtaCardProps = {
  item: NavMenuItemDef;
  href: string;
  onItemClick: () => void;
  onItemIntent: (href: string) => void;
};

/**
 * Mega menu “Vis alle …” / service CTA tile: frosted outline look, red text on hover,
 * one-shot shine sweep on hover only (no reverse animation).
 */
export function MegaMenuCtaCard({
  item,
  href,
  onItemClick,
  onItemIntent,
}: MegaMenuCtaCardProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onItemClick}
      onMouseEnter={() => onItemIntent(href)}
      onFocus={() => onItemIntent(href)}
      className={cn(
        "group relative isolate flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background/80 px-4 text-center shadow-sm backdrop-blur-sm outline-none transition-[transform,background-color,color] duration-200 ease-out",
        "dark:border-input dark:bg-background/60",
        "hover:bg-muted motion-safe:hover:-translate-y-0.5 dark:hover:bg-input/50",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      )}
    >
      {/* Shine runs only while hovering; duration-0 when not hovered so no sweep on mouse leave */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] -translate-x-[140%] bg-[linear-gradient(110deg,transparent_38%,rgba(255,255,255,0.45)_50%,transparent_62%)] transition-transform duration-0 ease-out group-hover:translate-x-[140%] group-hover:duration-700 dark:bg-[linear-gradient(110deg,transparent_38%,rgba(255,255,255,0.25)_50%,transparent_62%)]"
      />
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-2 text-sm font-semibold leading-tight",
          "text-foreground transition-colors duration-200 ease-out group-hover:text-primary"
        )}
      >
        {item.label}
        <ArrowRight
          className="size-4 shrink-0 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:rotate-10"
          aria-hidden
        />
      </span>
    </Link>
  );
}
