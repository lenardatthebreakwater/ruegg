import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SinglePageSummary } from "@/components/single-pages";
import { personvernserklaeringPageData } from "@/lib/data/single-pages";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Personvernserklæring",
    description: "Slik behandler Rüegg personopplysninger.",
    path: "/personvern/",
  });
}

export default function PersonvernPage() {
  const pagePath = "/personvern/";
  const breadcrumbs = buildFlatBreadcrumbs("Personvern");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SinglePageSummary data={personvernserklaeringPageData} breadcrumbs={breadcrumbs} />
    </>
  );
}
