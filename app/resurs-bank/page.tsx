import type { Metadata } from "next";
import { ResursBankPage } from "@/components/resurs-bank/resurs-bank-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title:
      "Betaling med Resurs Bank – Fleksibel delbetaling hos Peisbutikken.no | Peisbutikken",
    description:
      "Delbetaling med Resurs Bank: 0 % rente, 0 kr etablering, 79 kr per måned i månedsgebyr. Les vilkår, nedbetalingseksempler og hvordan du søker.",
    path: "/resurs-bank/",
  });
}

export default function ResursBankRoutePage() {
  const pagePath = "/resurs-bank/";
  const breadcrumbs = buildFlatBreadcrumbs("Resurs Bank");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <ResursBankPage breadcrumbs={breadcrumbs} />
    </>
  );
}
