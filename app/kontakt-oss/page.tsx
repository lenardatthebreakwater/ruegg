import type { Metadata } from "next";
import { ContactUsSinglePage } from "@/components/contact/contact-us-single-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  getCachedGoogleBusinessSocialProof,
  isGoogleBusinessProfileConfigured,
} from "@/lib/google-business-reviews";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildContactPageSchema,
  buildStoreGraphSchema,
  getOrganizationId,
} from "@/lib/seo/schema";

const KONTAKT_OSS_PAGE_TITLE = "Kontakt oss";
const KONTAKT_OSS_PAGE_DESCRIPTION =
  "Ta kontakt med Rüegg for råd om peiser, vedovner og peisinnsatser. Send oss en melding — vi hjelper deg gjerne.";
const KONTAKT_OSS_PATH = "/kontakt-oss/";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: KONTAKT_OSS_PAGE_TITLE,
    description: KONTAKT_OSS_PAGE_DESCRIPTION,
    path: KONTAKT_OSS_PATH,
  });
}

export default async function KontaktOssPage() {
  let liveStoreAggregateRating: { ratingValue: number; reviewCount: number } | null = null;

  try {
    const liveSocialProof = await getCachedGoogleBusinessSocialProof();
    if (
      typeof liveSocialProof.summary.rating === "number" &&
      Number.isFinite(liveSocialProof.summary.rating) &&
      liveSocialProof.summary.rating > 0 &&
      typeof liveSocialProof.summary.count === "number" &&
      Number.isFinite(liveSocialProof.summary.count) &&
      liveSocialProof.summary.count > 0
    ) {
      liveStoreAggregateRating = {
        ratingValue: liveSocialProof.summary.rating,
        reviewCount: liveSocialProof.summary.count,
      };
    }
  } catch (error) {
    if (isGoogleBusinessProfileConfigured()) {
      console.error(
        "Failed to fetch Google Business reviews for contact schema, omitting aggregateRating.",
        error
      );
    }
  }

  const breadcrumbs = buildFlatBreadcrumbs(KONTAKT_OSS_PAGE_TITLE);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, KONTAKT_OSS_PATH);
  const storeGraphSchema = buildStoreGraphSchema({
    aggregateRating: liveStoreAggregateRating,
  });
  const contactPageSchema = {
    ...buildContactPageSchema({
      path: KONTAKT_OSS_PATH,
      name: KONTAKT_OSS_PAGE_TITLE,
      description: KONTAKT_OSS_PAGE_DESCRIPTION,
    }),
    about: { "@id": getOrganizationId() },
  };

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={storeGraphSchema} />
      <JsonLdScript data={contactPageSchema} />
      <ContactUsSinglePage breadcrumbs={breadcrumbs} />
    </>
  );
}
