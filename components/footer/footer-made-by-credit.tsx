"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ETI_NORGE_HREF =
  "https://etinorge.no/?utm_source=ruegg.no&utm_medium=referral&utm_campaign=laget_av";

const CREDIT_LABEL = "Laget av ETI Norge";

type FooterMadeByCreditProps = {
  className?: string;
};

/**
 * Sitewide credit text; dofollow link only on the storefront homepage
 * (cleaner backlink profile for etinorge.no than identical sitewide footer links).
 */
export function FooterMadeByCredit({ className }: FooterMadeByCreditProps) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const textClass = cn(
    "text-sm text-neutral-500 transition-colors",
    isHome && "hover:text-neutral-300",
    className,
  );

  if (isHome) {
    return (
      <a
        href={ETI_NORGE_HREF}
        className={textClass}
        rel="noopener noreferrer"
      >
        {CREDIT_LABEL}
      </a>
    );
  }

  return <span className={textClass}>{CREDIT_LABEL}</span>;
}
