import { ContainedLayout } from "@/components/layout/contained-layout";
import { SHELL_CONTENT_MAX, SHELL_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

type ShellSectionFrameProps = {
  /**
   * Optional micro-label above the headline.
   * Eyebrow budget: max ~1 per 3 sections sitewide on the homepage.
   */
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Surface tone within the light Swiss theme family. */
  tone?: "default" | "cream" | "muted" | "deep";
  /** Center the intro block (offer / guarantee). */
  align?: "start" | "center";
};

/**
 * Homepage shell section chrome - Oblica airy rhythm, Swiss surfaces.
 */
export function ShellSectionFrame({
  eyebrow,
  title,
  description,
  children,
  className,
  id,
  tone = "default",
  align = "start",
}: ShellSectionFrameProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn(
        "border-b border-[color:var(--ruegg-swiss-border)]",
        SHELL_SECTION_PY,
        tone === "default" && "bg-[color:var(--ruegg-swiss-paper)]",
        tone === "cream" && "bg-[color:var(--ruegg-swiss-cream)]/55",
        tone === "muted" && "bg-[color:var(--ruegg-swiss-taupe)]/20",
        tone === "deep" &&
          "border-[color:var(--ruegg-swiss-deep)] bg-[color:var(--ruegg-swiss-deep)] text-[color:var(--ruegg-swiss-paper)]",
        className,
      )}
    >
      <ContainedLayout as="div" className={SHELL_CONTENT_MAX}>
        <div
          className={cn(
            "max-w-2xl",
            align === "center" && "mx-auto text-center",
          )}
        >
          {eyebrow ? (
            <p
              className={cn(
                "mb-3 text-[11px] font-medium uppercase tracking-[0.14em]",
                tone === "deep"
                  ? "text-[color:var(--ruegg-swiss-taupe)]"
                  : "text-[color:var(--ruegg-swiss-muted)]",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={id ? `${id}-heading` : undefined}
            className={cn(
              "font-display text-2xl font-medium tracking-tight sm:text-3xl",
              tone === "deep"
                ? "text-[color:var(--ruegg-swiss-paper)]"
                : "text-[color:var(--ruegg-swiss-ink)]",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "mt-3 max-w-[65ch] text-base leading-relaxed",
                tone === "deep"
                  ? "text-[color:var(--ruegg-swiss-taupe)]"
                  : "text-[color:var(--ruegg-swiss-muted)]",
                align === "center" && "mx-auto",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-10 md:mt-12">{children}</div>
      </ContainedLayout>
    </section>
  );
}
