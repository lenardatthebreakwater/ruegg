"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Mail, Menu, X } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { RueggWordmark } from "@/components/brand/ruegg-wordmark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { RUEGG_PRIMARY_NAV_LINKS } from "@/lib/data/ruegg-nav";
import { cn } from "@/lib/utils";

function withTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function isPathActive(href: string, pathname: string): boolean {
  if (!href.startsWith("/")) return false;
  return withTrailingSlash(pathname).startsWith(withTrailingSlash(href));
}

export function RueggMobileNavSheet() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Åpne meny"
          className="text-neutral-800 hover:bg-black/5 dark:text-neutral-100 dark:hover:bg-white/10 lg:hidden"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-[85vw] max-w-sm flex-col gap-0 border-border/60 bg-background p-0"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent"
        />

        <SheetHeader className="shrink-0 border-b border-border/60 p-5">
          <div className="flex items-center gap-3">
            <RueggWordmark static />
            <SheetTitle className="sr-only">Meny</SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-9 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Lukk meny"
              >
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <nav
          aria-label="Mobilnavigasjon"
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3"
        >
          <ul className="flex flex-col gap-0.5">
            {RUEGG_PRIMARY_NAV_LINKS.map(({ href, label }) => {
              const active = isPathActive(href, pathname);
              return (
                <li key={href}>
                  <SheetClose asChild>
                    <Link
                      href={href}
                      prefetch={false}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted",
                        active && "bg-primary/[0.06] text-primary",
                      )}
                    >
                      {label}
                      <ChevronRight
                        className="ml-auto size-4 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border/60 p-5 pt-4">
          <SheetClose asChild>
            <Button asChild variant="ctaGlow" className="w-full">
              <TrackedCtaLink
                href="/kontakt-oss/"
                contentType="nav"
                contentId="mobile_kontakt"
                linkText="Kontakt oss"
                prefetch={false}
              >
                <Mail className="size-4" aria-hidden />
                Kontakt oss
              </TrackedCtaLink>
            </Button>
          </SheetClose>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">Fargetema</span>
            <ThemeToggle className="size-9 shadow-none" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
