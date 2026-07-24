import type { Metadata } from "next";
import { MinPeisDetailView } from "@/components/account/min-peis/min-peis-detail";
import { RequireAuth } from "@/components/account/require-auth";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountMinPeisBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

type MinPeisDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: MinPeisDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildPageMetadata({
    title: "Min peis",
    description: "Se peisen din hos Peisbutikken.",
    path: `/min-konto/min-peis/${encodeURIComponent(slug)}/`,
    robots: { index: false, follow: false },
  });
}

export default async function MinKontoMinPeisDetailPage({
  params,
}: MinPeisDetailPageProps) {
  const { slug } = await params;
  const pagePath = `/min-konto/min-peis/${encodeURIComponent(slug)}/`;
  const breadcrumbs = buildAccountMinPeisBreadcrumbs("Peis");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <RequireAuth maxWidth="full">
          <MinPeisDetailView slug={slug} />
        </RequireAuth>
      </SimpleStaticPageShell>
    </>
  );
}
