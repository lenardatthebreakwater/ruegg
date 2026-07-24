import type { Metadata } from "next";
import { ReservedelerFamilyGridPage } from "@/components/reservedeler/reservedeler-family-grid-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildReservedelerFamilyBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { getReservedelerFamilyLabel } from "@/lib/reservedeler/families";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  resolveReservedelerFamilyDocumentTitle,
  resolveReservedelerFamilyMetaDescription,
} from "@/lib/seo/reservedeler-family-seo";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/schema";

export const revalidate = 600;

const FAMILY_SLUG = "dovre-deler";
const PAGE_PATH = "/dovre-deler/";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: resolveReservedelerFamilyDocumentTitle(
      FAMILY_SLUG,
      "Dovre Reservedeler"
    ),
    description: resolveReservedelerFamilyMetaDescription(
      FAMILY_SLUG,
      "Finn kompatible reservedeler for Dovre modeller."
    ),
    path: PAGE_PATH,
  });
}

export default function DovreDelerPage() {
  const familyLabel = getReservedelerFamilyLabel(FAMILY_SLUG);
  const breadcrumbs = buildReservedelerFamilyBreadcrumbs(familyLabel);
  const title = resolveReservedelerFamilyDocumentTitle(
    FAMILY_SLUG,
    "Dovre Reservedeler"
  );
  const description = resolveReservedelerFamilyMetaDescription(
    FAMILY_SLUG,
    "Finn kompatible reservedeler for Dovre modeller."
  );
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, PAGE_PATH);
  const collectionSchema = buildCollectionPageSchema({
    path: PAGE_PATH,
    name: title,
    description,
  });

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={collectionSchema} />
      <ReservedelerFamilyGridPage
        familySlug={FAMILY_SLUG}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
