import type { Metadata } from "next";
import {
  HomeShellAbout,
  HomeShellBenefits,
  HomeShellCategories,
  HomeShellContact,
  HomeShellFaq,
  HomeShellHero,
  HomeShellHowItWorks,
  HomeShellSocialProof,
} from "@/components/homepage/shell";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { homepageFAQ } from "@/lib/data/homepage";
import {
  getCachedGoogleBusinessSocialProof,
  isGoogleBusinessProfileConfigured,
} from "@/lib/google-business-reviews";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildFaqSchema, buildStoreGraphSchema } from "@/lib/seo/schema";

/** Allow Worker `GMB_*` vars to refresh reviews after Linux builds that lack them. */
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Peiser og vedovner",
    description:
      "Utforsk peiser, vedovner og peisinnsatser fra Rüegg. Sveitsisk kvalitet siden 1955 — kontakt oss for personlig veiledning.",
    path: "/",
  });
}

export default async function Home() {
  /** Live GMB summary only — never pass static fallback into HomeGoodsStore aggregateRating. */
  let liveStoreAggregateRating: { ratingValue: number; reviewCount: number } | null =
    null;

  try {
    const liveSocialProof = await getCachedGoogleBusinessSocialProof();
    if (
      isGoogleBusinessProfileConfigured() &&
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
    console.error(
      "Failed to fetch Google Business reviews for store schema.",
      error,
    );
  }

  const storeGraphSchema = buildStoreGraphSchema({
    aggregateRating: liveStoreAggregateRating,
  });
  const faqSchema = buildFaqSchema(homepageFAQ);

  return (
    <StorefrontPageShell>
      <JsonLdScript data={storeGraphSchema} />
      <JsonLdScript data={faqSchema} />
      {/*
        Strategy A homepage shell - Swiss tokens, Oblica rhythm, GoDaylight sticky steps.
        Navbar + Footer come from StorefrontPageShell.
      */}
      <main className="flex flex-1 flex-col bg-[color:var(--ruegg-swiss-paper)]">
        <HomeShellHero />
        <HomeShellBenefits />
        <HomeShellCategories />
        <HomeShellAbout />
        <HomeShellHowItWorks />
        <HomeShellSocialProof />
        <HomeShellFaq items={homepageFAQ} />
        <HomeShellContact />
      </main>
    </StorefrontPageShell>
  );
}
