import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SinglePageSummary } from "@/components/single-pages";
import { fraktbetingelserPageData } from "@/lib/data/single-pages";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Fraktbetingelser",
    description: "Fraktbetingelser for netthandel hos Rüegg.",
    path: "/fraktbetingelser/",
  });
}

export default function FraktbetingelserPage() {
  const pagePath = "/fraktbetingelser/";
  const breadcrumbs = buildFlatBreadcrumbs("Fraktbetingelser");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SinglePageSummary data={fraktbetingelserPageData} breadcrumbs={breadcrumbs} />
    </>
  );
}
