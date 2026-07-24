"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/min-konto/", label: "Oversikt", match: "exact" as const },
  { href: "/min-konto/min-peis/", label: "Min Peis", match: "prefix" as const },
  { href: "/min-konto/ordrer/", label: "Ordrer", match: "prefix" as const },
  { href: "/min-konto/adresser/", label: "Adresser", match: "exact" as const },
  {
    href: "/min-konto/betalingsmetoder/",
    label: "Betaling",
    match: "exact" as const,
  },
  { href: "/min-konto/passord/", label: "Passord", match: "exact" as const },
];

export function AccountNav() {
  const pathname = usePathname();
  const normalizedPath = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <nav
      aria-label="Kontomeny"
      className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex min-w-max gap-1 border-b border-border/70">
        {NAV_ITEMS.map((item) => {
          const active =
            item.match === "exact"
              ? normalizedPath === item.href
              : normalizedPath.startsWith(item.href);
          return (
            <li key={item.href} className="-mb-px">
              <Button
                variant="ghost"
                asChild
                className={cn(
                  // Same hover language as site header NavMegaMenu (Button scale + shine).
                  "h-auto rounded-none border-0 border-b-2 border-b-transparent px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white",
                  active &&
                    "border-b-primary text-neutral-950 dark:text-white"
                )}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
