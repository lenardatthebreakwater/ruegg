"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  ANIMATED_ICON_PROPS,
  useAnimatedIcon,
  type AnimatedIconComponent,
} from "@/components/account/account-animated-icon";

const CARD_CLASSNAME =
  "group flex items-start gap-3.5 rounded-xl border border-border/80 bg-card p-4 shadow-xs ring-1 ring-foreground/5 transition-colors hover:border-primary/35 hover:bg-primary/[0.03] focus-visible:border-primary/35 focus-visible:bg-primary/[0.03] focus-visible:outline-none";

const ICON_BADGE_CLASSNAME =
  "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:bg-primary group-focus-visible:text-primary-foreground";

const ARROW_CLASSNAME =
  "size-3.5 opacity-0 transition-[opacity,translate] motion-safe:group-hover:translate-x-0.5 group-hover:opacity-100 motion-safe:group-focus-visible:translate-x-0.5 group-focus-visible:opacity-100";

export type AccountQuickLinkCardProps = {
  href: string;
  title: string;
  description: string;
  icon: AnimatedIconComponent;
};

/** Shared body for link cards and button-style cards (e.g. suggestions). */
export function AccountQuickLinkCardBody({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <>
      <span className={ICON_BADGE_CLASSNAME}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-medium text-foreground group-hover:text-primary group-focus-visible:text-primary">
          {title}
          <ArrowRight className={ARROW_CLASSNAME} aria-hidden />
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </>
  );
}

/**
 * My Account overview quick-link card with in-glyph icon micro-animation
 * on hover and keyboard focus.
 */
export function AccountQuickLinkCard({
  href,
  title,
  description,
  icon: Icon,
}: AccountQuickLinkCardProps) {
  const { ref, triggerProps } = useAnimatedIcon();

  return (
    <Link href={href} {...triggerProps} className={CARD_CLASSNAME}>
      <AccountQuickLinkCardBody
        title={title}
        description={description}
        icon={<Icon ref={ref} {...ANIMATED_ICON_PROPS} />}
      />
    </Link>
  );
}

export { CARD_CLASSNAME, ICON_BADGE_CLASSNAME };
