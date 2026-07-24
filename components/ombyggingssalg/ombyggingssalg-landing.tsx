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
  OMBYGGINGSSALG_CATEGORY_SLUG,
  ombyggingssalgCarouselDescription,
  ombyggingssalgCarouselTitle,
  ombyggingssalgHero,
  ombyggingssalgVisitIntroDescription,
  ombyggingssalgVisitIntroTitle,
} from "@/lib/data/hub-pages/ombyggingssalg";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";

export function OmbyggingssalgLanding() {
  const breadcrumbs = buildFlatBreadcrumbs("Ombyggingssalg");

  return (
    <StorefrontPageShell>
      <PageBreadcrumbs items={breadcrumbs} />
      <HubHomeHeroSection hero={ombyggingssalgHero} />
      <ProductArchiveServer
        title={ombyggingssalgCarouselTitle}
        subtitle={ombyggingssalgCarouselDescription}
        breadcrumbs={[]}
        categorySlug={OMBYGGINGSSALG_CATEGORY_SLUG}
        hideBanner
      />
      <LocationSection
        location={homepageLocation}
        introTitle={ombyggingssalgVisitIntroTitle}
        introDescription={ombyggingssalgVisitIntroDescription}
      />
      <ContactSection />
    </StorefrontPageShell>
  );
}
