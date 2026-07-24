import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SinglePageSummary } from "@/components/single-pages";
import { fyringsveiledningPageData } from "@/lib/data/single-pages";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Fyringsveiledning",
    description: "Trygg og effektiv fyringsveiledning for peis og vedovn.",
    path: "/fyringsveiledning/",
  });
}

export default function FyringsveiledningPage() {
  const pagePath = "/fyringsveiledning/";
  const breadcrumbs = buildFlatBreadcrumbs("Fyringsveiledning");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SinglePageSummary data={fyringsveiledningPageData} breadcrumbs={breadcrumbs} />
    </>
  );
}
