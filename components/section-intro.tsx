import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionIntroAlign = "left" | "center" | "right";

type SectionIntroProps = {
  title: string;
  description?: ReactNode;
  align?: SectionIntroAlign;
  /** Use h1 for the page hero; h3 for sub-blocks inside a section */
  heading?: "h1" | "h2" | "h3";
  /** `hero` matches large page-title scale; both sizes use Cormorant (`font-display`). */
  size?: "section" | "hero";
  /** Merges with default title typography (e.g. smaller card headings) */
  titleClassName?: string;
  /** When set, wraps or replaces the default string title */
  renderTitle?: (title: string) => ReactNode;
  /** Merges with the description wrapper (e.g. contrast on imagery) */
  descriptionClassName?: string;
  className?: string;
  id?: string;
};

/** Editorial Cormorant for section + page-hero titles. */
const titleClass: Record<"section" | "hero", string> = {
  section:
    "font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
  hero: "font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl lg:leading-[1.05]",
};

const descriptionClass: Record<"section" | "hero", string> = {
  section: "mt-4 text-base text-muted-foreground sm:text-lg",
  hero: "mt-4 text-lg text-muted-foreground sm:text-xl",
};

/** Equal space above the title and below the description (section block rhythm). */
const blockPaddingY: Record<"section" | "hero", string> = {
  section: "pt-4 pb-4",
  hero: "pt-5 pb-5 sm:pt-6 sm:pb-6",
};

/**
 * Reusable section title + description.
 * Section titles use Cormorant (`font-display`); hero size stays sans unless overridden.
 */
export function SectionIntro({
  title,
  description,
  align = "left",
  heading = "h2",
  size = "section",
  titleClassName,
  renderTitle,
  descriptionClassName,
  className,
  id,
}: SectionIntroProps) {
  const Heading = heading;

  return (
    <div
      id={id}
      className={cn(
        blockPaddingY[size],
        size === "section" && "max-w-3xl",
        align === "left" && "text-left",
        align === "center" && "mx-auto w-full text-center",
        align === "right" && "ml-auto text-right",
        className
      )}
    >
      <Heading className={cn(titleClass[size], titleClassName)}>
        {renderTitle != null ? renderTitle(title) : title}
      </Heading>
      {description != null && description !== "" && (
        <div
          className={cn(descriptionClass[size], "space-y-3", descriptionClassName)}
        >
          {description}
        </div>
      )}
    </div>
  );
}
