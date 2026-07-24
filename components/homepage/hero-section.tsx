import { ArrowRight, Flame } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { HeroJustifiedCopy } from "@/components/homepage/hero-justified-copy";
import { cn } from "@/lib/utils";

const HERO_DESCRIPTION =
  "Utforsk peiser, vedovner og peisinnsatser fra Rüegg. Sveitsisk kvalitet og moderne design — vi hjelper deg finne riktig løsning.";

/** Mobile: ~6svh shorter so trust band barely peeks; desktop unchanged. */
const HERO_MIN_HEIGHT =
  "min-h-[clamp(22rem,72svh,52rem)] md:min-h-[clamp(22rem,78vh,52rem)]";

/**
 * Hero copy is visible in the first HTML paint (no opacity-0 / client fade).
 * Fit-title still hydrates client-side for size, but text is never hidden.
 */
export function HeroSection() {
  return (
    <section className={cn("relative w-full", HERO_MIN_HEIGHT)}>
      <ContainedLayout
        as="div"
        className={cn(
          "relative flex items-center justify-start",
          HERO_MIN_HEIGHT,
          "pt-12 pb-10 md:pt-16 md:pb-12",
        )}
      >
        <div className="w-full text-left">
          <div className="mb-4 flex justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/85 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-background/80">
              <Flame
                className="size-3.5 shrink-0 text-amber-600 dark:text-amber-500"
                aria-hidden
              />
              <span>Peiser og vedovner</span>
            </span>
          </div>

          <HeroJustifiedCopy
            title="Din peisproff siden 1955"
            description={HERO_DESCRIPTION}
          />

          <div className="mt-14 flex flex-wrap items-center justify-start gap-4">
            <Button asChild size="lg" className="gap-2" variant="ctaGlow">
              <TrackedCtaLink
                href="/shop/"
                contentType="home_hero"
                contentId="shop"
                linkText="Utforsk peiser"
              >
                Utforsk peiser
                <ArrowRight className="size-4" aria-hidden />
              </TrackedCtaLink>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-background/80 backdrop-blur-sm dark:bg-background/60"
            >
              <TrackedCtaLink
                href="/kontakt-oss/"
                contentType="home_hero"
                contentId="kontakt"
                linkText="Kontakt oss"
              >
                Kontakt oss
              </TrackedCtaLink>
            </Button>
          </div>
        </div>
      </ContainedLayout>
    </section>
  );
}
