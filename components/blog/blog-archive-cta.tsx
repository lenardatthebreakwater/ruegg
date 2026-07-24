import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

type BlogArchiveCtaProps = {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
};

/** Dark "ember" panel: the single color-block moment on blog pages. */
export function BlogArchiveCta({
  title = "Lurer du på hva som passer hjemme hos deg?",
  description = "Vi hjelper deg med å finne riktig peis eller ovn, og monterer den trygt.",
  href = "/kontakt-oss/",
  label = "Kontakt oss",
}: BlogArchiveCtaProps) {
  return (
    <section className={PAGE_SECTION_PY}>
      <ContainedLayout>
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-12 md:px-12 md:py-16 dark:border dark:border-border">
          {/* Ember glow rising from the bottom edge. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_110%,rgba(225,29,46,0.38),transparent_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
          />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
            <div>
              <h2 className="font-display max-w-[28ch] text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
                {title}
              </h2>
              <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-zinc-400 md:text-base">
                {description}
              </p>
            </div>
            <Button asChild variant="ctaGlow" size="lg" className="shrink-0">
              <TrackedCtaLink
                href={href}
                contentType="blog_cta"
                contentId={href}
                linkText={label}
              >
                {label}
              </TrackedCtaLink>
            </Button>
          </div>
        </div>
      </ContainedLayout>
    </section>
  );
}
