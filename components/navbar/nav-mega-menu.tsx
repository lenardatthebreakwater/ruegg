"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { useEventListener, useValueChangeEffect } from "@/lib/hooks/effect-last";
import {
  NAV_MENUS,
  NAV_STANDALONE_LINKS,
  buildNavItemHref,
  buildNavItemImagePath,
  type NavMenuDef,
} from "./nav-menu-data";
import { MegaMenuCtaCard } from "./mega-menu-cta-card";
import { staticImageSet } from "@/components/media/static-picture";

export function NavMegaMenu() {
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const prefetchedRoutesRef = React.useRef<Set<string>>(new Set());

  const prefetchRoute = (href: string) => {
    if (!href.startsWith("/")) return;
    if (prefetchedRoutesRef.current.has(href)) return;
    prefetchedRoutesRef.current.add(href);
    void router.prefetch(href);
  };

  useValueChangeEffect(pathname, () => {
    setActiveKey(null);
  });

  useEventListener(
    typeof document === "undefined" ? null : document,
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        setActiveKey(null);
      }
    }
  );

  useEventListener(
    typeof document === "undefined" ? null : document,
    "mousedown",
    (event) => {
      if (!activeKey) return;
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveKey(null);
      }
    }
  );

  const toggle = (menuKey: string) => {
    setActiveKey((prev) => (prev === menuKey ? null : menuKey));
  };

  const activeMenu = NAV_MENUS.find((m) => m.key === activeKey);

  return (
    <div ref={headerRef}>
      <nav className="flex justify-center gap-2 xl:gap-3" aria-label="Main">
        {NAV_MENUS.map((menu) => (
          <Button
            key={menu.key}
            type="button"
            variant="ghost"
            aria-expanded={activeKey === menu.key}
            onClick={() => toggle(menu.key)}
            className={cn(
              "h-auto gap-1 whitespace-nowrap px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white",
              activeKey === menu.key && "text-neutral-950 dark:text-white"
            )}
          >
            {menu.label}
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                activeKey === menu.key && "rotate-180"
              )}
            />
          </Button>
        ))}
        {NAV_STANDALONE_LINKS.map((link) => (
          <Button
            key={link.key}
            variant="ghost"
            asChild
            className="h-auto whitespace-nowrap px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Link
              href={link.href}
              prefetch={false}
              onMouseEnter={() => prefetchRoute(link.href)}
              onFocus={() => prefetchRoute(link.href)}
            >
              {link.label}
            </Link>
          </Button>
        ))}
      </nav>

      {activeMenu && (
        <div className="absolute inset-x-0 top-full z-50 pt-6 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <ContainedLayout>
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
              <div
                role="region"
                aria-label="Undermeny"
                className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-y-contain p-6"
              >
                <MegaMenuGrid
                  menu={activeMenu}
                  onItemClick={() => setActiveKey(null)}
                  onItemIntent={prefetchRoute}
                />
              </div>
            </div>
          </ContainedLayout>
        </div>
      )}
    </div>
  );
}

function MegaMenuGrid({
  menu,
  onItemClick,
  onItemIntent,
}: {
  menu: NavMenuDef;
  onItemClick: () => void;
  onItemIntent: (href: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 rounded-xl sm:grid-cols-2 lg:grid-cols-4">
      {menu.items.map((item) => {
        const href = buildNavItemHref(item);

        if (item.megaMenuCta) {
          return (
            <MegaMenuCtaCard
              key={item.label}
              item={item}
              href={href}
              onItemClick={onItemClick}
              onItemIntent={onItemIntent}
            />
          );
        }

        const itemImagePath = buildNavItemImagePath(menu.key, item);
        // CSS gradient fallback — avoid the blank 38-byte placeholder.webp / missing .avif.
        const itemImageWithFallback = `${staticImageSet(itemImagePath)}, linear-gradient(160deg, #e8e6e3 0%, #cfcbc6 100%)`;
        const labelBarClasses =
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[24%] overflow-hidden rounded-b-lg border-t border-neutral-200/80 bg-gradient-to-t from-[#E5E2DF] to-[#F0EEEC] px-3 py-1.5 shadow-sm dark:border-neutral-700 dark:from-neutral-950 dark:to-neutral-900";

        return (
          <Button
            key={item.label}
            variant="ghost"
            asChild
            className="group relative h-auto w-full overflow-hidden rounded-lg border border-border p-0 shadow-sm before:hidden hover:scale-100 motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-100"
          >
            <Link
              href={href}
              prefetch={false}
              onClick={onItemClick}
              onMouseEnter={() => onItemIntent(href)}
              onFocus={() => onItemIntent(href)}
              className="relative isolate flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[inherit] text-center"
            >
              <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
                  style={{ backgroundImage: itemImageWithFallback }}
                />
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] -translate-x-[140%] bg-[linear-gradient(110deg,transparent_38%,rgba(255,255,255,0.45)_50%,transparent_62%)] transition-transform duration-0 ease-out group-hover:translate-x-[140%] group-hover:duration-700 dark:bg-[linear-gradient(110deg,transparent_38%,rgba(255,255,255,0.25)_50%,transparent_62%)]"
              />
              <div className={labelBarClasses}>
                <div className="flex h-full items-center justify-center text-center">
                  <span className="text-sm font-semibold leading-tight text-neutral-900 transition-colors duration-300 ease-out group-hover:text-primary dark:text-neutral-100">
                    {item.label}
                  </span>
                </div>
              </div>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
