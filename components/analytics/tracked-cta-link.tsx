"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { pushSelectContentEvent } from "@/lib/analytics/push-select-content-event";

type TrackedCtaLinkProps = {
  href: string;
  contentType: string;
  contentId?: string;
  linkText?: string;
  className?: string;
  children?: ReactNode;
  prefetch?: ComponentProps<typeof Link>["prefetch"];
  tabIndex?: number;
  "aria-label"?: string;
};

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href.trim());
}

/**
 * Next.js `Link` (or plain `<a>` for absolute URLs) that pushes GA4
 * `select_content` on click (marketing CTAs).
 */
export function TrackedCtaLink({
  href,
  contentType,
  contentId,
  linkText,
  className,
  children,
  prefetch,
  tabIndex,
  "aria-label": ariaLabel,
}: TrackedCtaLinkProps) {
  const onTrack = () =>
    pushSelectContentEvent({
      contentType,
      contentId,
      linkUrl: href,
      linkText: linkText ?? ariaLabel,
    });

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={className}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        onClick={onTrack}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onClick={onTrack}
    >
      {children}
    </Link>
  );
}
