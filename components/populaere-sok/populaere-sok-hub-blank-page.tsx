import { EditorialPageHeader } from "@/components/editorial";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { getPopulaereSokHubById } from "@/lib/populaere-sok/menu-data";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";
import type { PopulaereSokHubId } from "@/lib/populaere-sok/types";

type PopulaereSokHubBlankPageProps = {
  hubId: PopulaereSokHubId;
  className?: string;
};

/** Strips trailing "| Peisbutikken" from legacy titles for a cleaner main heading. */
function hubPageHeadingTitle(title: string): string {
  return title.replace(/\s*\|\s*Peisbutikken\s*$/i, "").trim();
}

export function PopulaereSokHubBlankPage({
  hubId,
  className,
}: PopulaereSokHubBlankPageProps) {
  const hub = getPopulaereSokHubById(hubId);
  if (!hub) {
    return null;
  }

  const breadcrumbs = buildFlatBreadcrumbs(hub.breadcrumbLabel);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, hub.path);
  const heading = hubPageHeadingTitle(hub.menuTitle);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <EditorialPageHeader
          title={heading}
          bandClassName={className}
          contentClassName="container mx-auto max-w-3xl px-4"
        />
      </SimpleStaticPageShell>
    </>
  );
}
