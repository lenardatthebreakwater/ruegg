import { HubHomeHeroSection } from "@/components/hub-pages/hub-home-hero-section";
import {
  ContactSection,
  LocationSection,
} from "@/components/homepage";
import { ProductArchiveServer } from "@/components/product-archive/product-archive-server";
import { PageBreadcrumbs } from "@/components/site/page-breadcrumbs";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { homepageLocation } from "@/lib/data/homepage";
import {
  LAGERSALG_CATEGORY_SLUG,
  lagersalgCarouselDescription,
  lagersalgCarouselTitle,
  lagersalgHero,
  lagersalgVisitIntroDescription,
  lagersalgVisitIntroTitle,
} from "@/lib/data/hub-pages/lagersalg";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";

export function LagersalgLanding() {
  const breadcrumbs = buildFlatBreadcrumbs("Lagersalg");

  return (
    <StorefrontPageShell>
      <PageBreadcrumbs items={breadcrumbs} />
      <HubHomeHeroSection hero={lagersalgHero} />
      <ProductArchiveServer
        title={lagersalgCarouselTitle}
        subtitle={lagersalgCarouselDescription}
        breadcrumbs={[]}
        categorySlug={LAGERSALG_CATEGORY_SLUG}
        hideBanner
      />
      <LocationSection
        location={homepageLocation}
        introTitle={lagersalgVisitIntroTitle}
        introDescription={lagersalgVisitIntroDescription}
      />
      <ContactSection />
    </StorefrontPageShell>
  );
}
