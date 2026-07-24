import type { ReactNode } from "react";
import {
  EditorialEyebrow,
  EditorialHeading,
  type EditorialHeadingSize,
} from "@/components/editorial/editorial-heading";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

/** Soft primary wash + bottom border used on blog / archive page tops. */
export const EDITORIAL_HEADER_BAND_CLASS = cn(
  "border-b border-border bg-gradient-to-b from-primary/[0.05] to-transparent",
  PAGE_SECTION_PY
);

type EditorialAccentPillProps = {
  className?: string;
};

/** Short primary gradient bar under page titles (blog archive accent). */
export function EditorialAccentPill({ className }: EditorialAccentPillProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "mb-5 block h-1 w-14 rounded-full bg-gradient-to-r from-primary to-primary/40",
        className
      )}
    />
  );
}

type EditorialPageHeaderInnerProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  size?: EditorialHeadingSize;
  headingId?: string;
  headingClassName?: string;
  showPill?: boolean;
  descriptionClassName?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Inner stack: optional pill / eyebrow, display H1, optional description.
 * Compose inside ContainedLayout, BlogReveal, etc.
 */
export function EditorialPageHeaderInner({
  title,
  description,
  eyebrow,
  size = "page",
  headingId,
  headingClassName,
  showPill = true,
  descriptionClassName,
  className,
  children,
}: EditorialPageHeaderInnerProps) {
  return (
    <div className={className}>
      {showPill ? <EditorialAccentPill /> : null}
      {eyebrow ? <EditorialEyebrow>{eyebrow}</EditorialEyebrow> : null}
      <EditorialHeading
        size={size}
        id={headingId}
        className={cn(eyebrow ? "mt-2" : undefined, headingClassName)}
      >
        {title}
      </EditorialHeading>
      {description ? (
        <div
          className={cn(
            "mt-4 max-w-[65ch] text-base leading-relaxed text-muted-foreground md:text-lg",
            descriptionClassName
          )}
        >
          {typeof description === "string" || typeof description === "number" ? (
            <p>{description}</p>
          ) : (
            description
          )}
        </div>
      ) : null}
      {children}
    </div>
  );
}

type EditorialPageHeaderProps = EditorialPageHeaderInnerProps & {
  /** Extra classes on the outer `<header>` band. */
  bandClassName?: string;
  /** Classes on the inner content wrapper (e.g. container / max-width). */
  contentClassName?: string;
};

/**
 * Full page-top header: soft band + pill + display title (+ optional eyebrow/description).
 */
export function EditorialPageHeader({
  bandClassName,
  contentClassName,
  ...innerProps
}: EditorialPageHeaderProps) {
  return (
    <header className={cn(EDITORIAL_HEADER_BAND_CLASS, bandClassName)}>
      <EditorialPageHeaderInner {...innerProps} className={contentClassName} />
    </header>
  );
}
