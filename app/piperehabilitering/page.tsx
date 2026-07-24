import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ServiceLandingPage } from "@/components/service-pages";
import { piperehabiliteringPageData } from "@/lib/data/service-pages";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema,
} from "@/lib/seo/schema";

const PIPEREHABILITERING_TITLE = "Piperehabilitering | Peisbutikken";
const PIPEREHABILITERING_DESCRIPTION =
  "Piperehabilitering for trygg fyring og bedre trekk. Vi hjelper deg med vurdering, løsning og rehabilitering i Oslo-området.";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: PIPEREHABILITERING_TITLE,
    description: PIPEREHABILITERING_DESCRIPTION,
    path: "/piperehabilitering/",
  });
}

export default function PiperehabiliteringPage() {
  const pagePath = "/piperehabilitering/";
  const breadcrumbs = buildFlatBreadcrumbs("Piperehabilitering");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);
  const faqSchema = buildFaqSchema(piperehabiliteringPageData.faqItems);
  const serviceSchema = buildServiceSchema({
    path: pagePath,
    name: "Piperehabilitering",
    description: PIPEREHABILITERING_DESCRIPTION,
    areaServed: "Oslo-området",
  });

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={serviceSchema} />
      <JsonLdScript data={faqSchema} />
      <ServiceLandingPage data={piperehabiliteringPageData} breadcrumbs={breadcrumbs} />
    </>
  );
}
