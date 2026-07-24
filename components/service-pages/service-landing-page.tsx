import { FAQSection } from "@/components/homepage/faq-section";
import { ContactSection } from "@/components/homepage/contact-section";
import { TrustSection } from "@/components/homepage/trust-section";
import { PageBreadcrumbs } from "@/components/site/page-breadcrumbs";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import type { ServicePageData } from "@/lib/data/service-pages";
import { ServiceGallerySection } from "./service-gallery-section";
import { ServiceHeroSection } from "./service-hero-section";
import { ServiceMapSection } from "./service-map-section";
import { ServicePostContentSections } from "./service-post-content-sections";

type ServiceLandingPageProps = {
  data: ServicePageData;
  breadcrumbs?: BreadcrumbItem[];
};

export function ServiceLandingPage({ data, breadcrumbs }: ServiceLandingPageProps) {
  return (
    <StorefrontPageShell>
      <PageBreadcrumbs items={breadcrumbs} />
      <main className="flex flex-1 flex-col">
        <ServiceHeroSection hero={data.hero} />
        <TrustSection items={data.trustItems} layout="service" />
        <ServiceMapSection content={data.mapContent} location={data.location} />
        <ServiceGallerySection
          title={data.galleryTitle}
          description={data.galleryDescription}
          items={data.galleryItems}
        />
        <ServicePostContentSections sections={data.postContentSections ?? []} />
        <FAQSection
          title={data.faqTitle}
          description={data.faqDescription}
          items={data.faqItems}
        />
        <ContactSection />
      </main>
    </StorefrontPageShell>
  );
}
