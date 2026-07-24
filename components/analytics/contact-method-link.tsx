"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  contactMethodFromHref,
  pushContactClickEvent,
} from "@/lib/analytics/push-contact-click-event";

type ContactMethodLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "onClick"
> & {
  href: string;
  /** Surface id for GTM (`content_type`), e.g. `footer`, `contact_sidebar`. */
  placement: string;
  linkText?: string;
  children: ReactNode;
};

/**
 * `tel:` / `mailto:` anchor that pushes `generate_lead` with method on click.
 */
export function ContactMethodLink({
  href,
  placement,
  linkText,
  children,
  ...rest
}: ContactMethodLinkProps) {
  return (
    <a
      href={href}
      {...rest}
      onClick={() => {
        const method = contactMethodFromHref(href);
        if (!method) return;
        pushContactClickEvent({
          method,
          placement,
          linkUrl: href,
          linkText,
        });
      }}
    >
      {children}
    </a>
  );
}
