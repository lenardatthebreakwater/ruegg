import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ServiceLandingPage } from "@/components/service-pages";
import { monteringPageData } from "@/lib/data/service-pages";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema,
} from "@/lib/seo/schema";

const MONTERING_TITLE = "Montering av peis og ovn | Peisbutikken";
const MONTERING_DESCRIPTION =
  "Trygg montering av vedovn, peisinnsats og gasspeis utført av erfarne fagfolk. Få uforpliktende tilbud fra Peisbutikken.";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: MONTERING_TITLE,
    description: MONTERING_DESCRIPTION,
    path: "/montering/",
  });
}

export default function MonteringPage() {
  const pagePath = "/montering/";
  const breadcrumbs = buildFlatBreadcrumbs("Montering");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);
  const faqSchema = buildFaqSchema(monteringPageData.faqItems);
  const serviceSchema = buildServiceSchema({
    path: pagePath,
    name: "Montering av peis og ovn",
    description: MONTERING_DESCRIPTION,
    areaServed: "Oslo, Bærum, Asker, Drammen og nærliggende områder",
  });

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={serviceSchema} />
      <JsonLdScript data={faqSchema} />
      <ServiceLandingPage data={monteringPageData} breadcrumbs={breadcrumbs} />
    </>
  );
}
