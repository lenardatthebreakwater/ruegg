import type { Metadata } from "next";
import { OmOssPageContent } from "@/components/about/om-oss-page-content";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

const OM_OSS_PAGE_TITLE = "Om oss";
const OM_OSS_PAGE_DESCRIPTION =
  "Les om Rüegg — sveitsisk peisprodusent siden 1955. Kvalitet, innovasjon og personlig veiledning.";
const OM_OSS_PATH = "/om-oss/";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: OM_OSS_PAGE_TITLE,
    description: OM_OSS_PAGE_DESCRIPTION,
    path: OM_OSS_PATH,
  });
}

export default function OmOssPage() {
  const breadcrumbs = buildFlatBreadcrumbs(OM_OSS_PAGE_TITLE);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, OM_OSS_PATH);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <OmOssPageContent breadcrumbs={breadcrumbs} />
    </>
  );
}
