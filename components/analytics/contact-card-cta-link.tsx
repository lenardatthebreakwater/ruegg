"use client";

import type { ReactNode } from "react";
import { ContactMethodLink } from "@/components/analytics/contact-method-link";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { contactMethodFromHref } from "@/lib/analytics/push-contact-click-event";

type ContactCardCtaLinkProps = {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
};

/**
 * Contact info card CTA: `tel:`/`mailto:` → lead click; other hrefs → select_content.
 */
export function ContactCardCtaLink({
  href,
  label,
  className,
  children,
}: ContactCardCtaLinkProps) {
  const method = contactMethodFromHref(href);
  if (method) {
    return (
      <ContactMethodLink
        href={href}
        placement="kontakt_oss_card"
        linkText={label}
        className={className}
      >
        {children}
      </ContactMethodLink>
    );
  }

  return (
    <TrackedCtaLink
      href={href}
      contentType="kontakt_oss_card"
      contentId={href}
      linkText={label}
      className={className}
    >
      {children}
    </TrackedCtaLink>
  );
}
