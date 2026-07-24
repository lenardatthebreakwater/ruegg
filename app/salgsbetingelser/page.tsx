import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SinglePageSummary } from "@/components/single-pages";
import { salgsbetingelserPageData } from "@/lib/data/single-pages";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Salgsbetingelser",
    description: "Salgsbetingelser for kjøp hos Rüegg.",
    path: "/salgsbetingelser/",
  });
}

export default function SalgsbetingelserPage() {
  const pagePath = "/salgsbetingelser/";
  const breadcrumbs = buildFlatBreadcrumbs("Salgsbetingelser");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SinglePageSummary data={salgsbetingelserPageData} breadcrumbs={breadcrumbs} />
    </>
  );
}
