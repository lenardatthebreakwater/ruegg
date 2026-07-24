import type { Metadata } from "next";
import { MinPeisReservedelerView } from "@/components/account/min-peis/min-peis-reservedeler-view";
import { RequireAuth } from "@/components/account/require-auth";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountMinPeisReservedelerBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildMinPeisReservedelerHref } from "@/lib/products/paths";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

type MinPeisReservedelerPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: MinPeisReservedelerPageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildPageMetadata({
    title: "Reservedeler | Min peis",
    description: "Reservedeler som passer peisen din.",
    path: buildMinPeisReservedelerHref(slug),
    robots: { index: false, follow: false },
  });
}

export default async function MinKontoMinPeisReservedelerPage({
  params,
}: MinPeisReservedelerPageProps) {
  const { slug } = await params;
  const pagePath = buildMinPeisReservedelerHref(slug);
  const breadcrumbs = buildAccountMinPeisReservedelerBreadcrumbs(slug);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <RequireAuth maxWidth="full">
          <MinPeisReservedelerView slug={slug} />
        </RequireAuth>
      </SimpleStaticPageShell>
    </>
  );
}
