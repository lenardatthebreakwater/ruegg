import type { Metadata } from "next";
import { OrderDetail } from "@/components/account/order-detail";
import { RequireAuth } from "@/components/account/require-auth";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountOrderBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return buildPageMetadata({
    title: `Ordre #${id}`,
    description: "Ordredetaljer hos Peisbutikken.",
    path: `/min-konto/ordrer/${id}/`,
    robots: { index: false, follow: false },
  });
}

export default async function MinKontoOrdreDetailPage({
  params,
}: OrderPageProps) {
  const { id } = await params;
  const orderId = Number.parseInt(id, 10);
  const pagePath = `/min-konto/ordrer/${id}/`;
  const breadcrumbs = buildAccountOrderBreadcrumbs(
    Number.isFinite(orderId) ? `Ordre #${orderId}` : "Ordre"
  );
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <RequireAuth maxWidth="full">
          {Number.isFinite(orderId) && orderId > 0 ? (
            <OrderDetail orderId={orderId} />
          ) : (
            <p className="text-sm text-red-700">Ugyldig ordre-ID.</p>
          )}
        </RequireAuth>
      </SimpleStaticPageShell>
    </>
  );
}
