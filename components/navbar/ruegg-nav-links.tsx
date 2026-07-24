"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RUEGG_PRIMARY_NAV_LINKS } from "@/lib/data/ruegg-nav";
import { cn } from "@/lib/utils";

function withTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function isPathActive(href: string, pathname: string): boolean {
  if (!href.startsWith("/")) return false;
  return withTrailingSlash(pathname).startsWith(withTrailingSlash(href));
}

export function RueggNavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hovedmeny"
      className={cn("flex items-center gap-1", className)}
    >
      {RUEGG_PRIMARY_NAV_LINKS.map(({ href, label }) => {
        const active = isPathActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-neutral-700 hover:bg-black/5 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
