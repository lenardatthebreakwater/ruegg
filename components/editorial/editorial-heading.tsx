import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Locked editorial type scale (blog / min-konto source of truth).
 * - page: blog archive H1 (`text-4xl md:text-5xl`)
 * - pageLarge: blog single H1 (+ `lg:text-6xl`)
 * - account: min-konto H1 (`text-3xl md:text-4xl`)
 * - product: PDP title (`text-3xl md:text-4xl`)
 * - section: homepage / section titles (`text-2xl sm:text-3xl`)
 * - sectionLarge: featured editorial H2 (`text-3xl md:text-4xl`)
 */
export type EditorialHeadingSize =
  | "page"
  | "pageLarge"
  | "account"
  | "product"
  | "section"
  | "sectionLarge"
  | "card"
  | "cardSm";

const sizeClass: Record<EditorialHeadingSize, string> = {
  page: "text-4xl font-semibold tracking-tight md:text-5xl",
  pageLarge:
    "text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl lg:leading-[1.05]",
  account: "text-3xl font-semibold tracking-tight md:text-4xl",
  product: "text-3xl font-semibold tracking-tight md:text-4xl",
  section: "text-2xl font-semibold tracking-tight sm:text-3xl",
  sectionLarge:
    "text-3xl font-semibold tracking-tight md:text-4xl md:leading-[1.1]",
  card: "text-lg font-semibold tracking-tight",
  cardSm: "text-base font-semibold tracking-tight",
};

type EditorialHeadingProps = {
  children: ReactNode;
  as?: ElementType;
  size?: EditorialHeadingSize;
  className?: string;
  id?: string;
};

/** Cormorant display heading used site-wide for editorial H1/H2 chrome. */
export function EditorialHeading({
  children,
  as: Tag = "h1",
  size = "page",
  className,
  id,
}: EditorialHeadingProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "font-display text-foreground",
        sizeClass[size],
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Primary uppercase eyebrow used above editorial page titles. */
export function EditorialEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold tracking-[0.14em] text-primary uppercase",
        className
      )}
    >
      {children}
    </p>
  );
}
