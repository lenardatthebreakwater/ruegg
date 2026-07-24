import { ArrowRight } from "lucide-react";

import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { Button } from "@/components/ui/button";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

/**
 * Lean below-fold CTA for Strategy A — shop catalog + contact, no hub/campaign grids.
 */
export function HomepageCtaBand({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="homepage-cta-heading"
      className={cn(
        "border-b border-border bg-muted/30 dark:bg-muted/20",
        PAGE_SECTION_PY,
        className,
      )}
    >
      <ContainedLayout as="div" className="max-w-2xl text-center">
        <h2
          id="homepage-cta-heading"
          className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Finn din Rüegg-peis
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Se hele utvalget av peiser, vedovner og peisinnsatser — eller ta kontakt
          for personlig veiledning.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="gap-2" variant="ctaGlow">
            <TrackedCtaLink
              href="/shop/"
              contentType="home_cta_band"
              contentId="shop"
              linkText="Se våre peiser"
            >
              Se våre peiser
              <ArrowRight className="size-4" aria-hidden />
            </TrackedCtaLink>
          </Button>
          <Button asChild variant="outline" size="lg">
            <TrackedCtaLink
              href="/kontakt-oss/"
              contentType="home_cta_band"
              contentId="kontakt"
              linkText="Kontakt oss"
            >
              Kontakt oss
            </TrackedCtaLink>
          </Button>
        </div>
      </ContainedLayout>
    </section>
  );
}
