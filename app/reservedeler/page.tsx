import type { Metadata } from "next";
import { ReservedelerCatalog } from "@/components/reservedeler/reservedeler-catalog";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildReservedelerRootBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { getReservedelerItems } from "@/lib/reservedeler/server-items";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Reservedeler",
    description:
      "Finn reservedeler til peiser og vedovner. Velg modell og se kompatible deler.",
    path: "/reservedeler/",
  });
}

export const revalidate = 600;

/**
 * Statically prerendered; the ?brand= filter is applied client-side inside
 * ReservedelerCatalog (reading searchParams here would force per-request
 * server rendering of the whole page).
 */
export default async function ReservedelerPage() {
  const items = await getReservedelerItems();
  const pagePath = "/reservedeler/";
  const breadcrumbs = buildReservedelerRootBreadcrumbs();
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <ReservedelerCatalog items={items} />
      </SimpleStaticPageShell>
    </>
  );
}
