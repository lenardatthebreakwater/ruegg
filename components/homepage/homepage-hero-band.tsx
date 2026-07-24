import { HomepageHeroBackdrop } from "@/components/homepage/homepage-hero-backdrop";
import { HeroSection } from "@/components/homepage/hero-section";

/**
 * SiteNavbar height: `py-3` + logo `h-10` ≈ 4rem (`h-16` / `mt-16` / `pt-16`).
 * Pull the band up so hero media sits under the translucent glass nav at scroll 0;
 * pad content by the same amount so H1/CTAs stay below the nav.
 *
 * Server component — no client-only scale/fade on the LCP image (avoids the
 * “image shrinks after 1–2s, then text appears” flash on mobile).
 */
export function HomepageHeroBand() {
  return (
    <div className="@container relative isolate -mt-16 w-full overflow-hidden">
      <div className="absolute inset-0">
        <HomepageHeroBackdrop />
      </div>

      <div className="relative z-10 pt-16">
        <HeroSection />
      </div>
    </div>
  );
}
