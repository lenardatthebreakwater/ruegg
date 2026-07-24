import TestimonialsComponent from "@/components/shadcn-studio/blocks/testimonials-component-04/testimonials-component-04";
import type { TestimonialItem } from "@/components/shadcn-studio/blocks/testimonials-component-04/testimonials-component-04";
import type { SectionIntroAlign } from "@/components/section-intro";
import type { ReviewSummary, ReviewQuote } from "@/lib/data/homepage";
import {
  homepageLocation,
  SOCIAL_PROOF_CAROUSEL_MIN_RATING,
} from "@/lib/data/homepage";

type SocialProofBarProps = {
  summary: ReviewSummary;
  quotes?: ReviewQuote[];
  introTitle?: string;
  introDescription?: string;
  introAlign?: SectionIntroAlign;
};

export function SocialProofBar({
  summary,
  quotes = [],
  introTitle = "Hva de sier.....",
  introDescription = "Ekte tilbakemeldinger fra Google.",
  introAlign = "center",
}: SocialProofBarProps) {
  const testimonials: TestimonialItem[] = quotes
    .filter((q) => q.rating >= SOCIAL_PROOF_CAROUSEL_MIN_RATING)
    .map((q) => ({
      id: q.id,
      name: q.author,
      content: q.text,
      rating: q.rating,
      date: q.date,
      avatar: q.avatarUrl,
    }));

  return (
    <TestimonialsComponent
      testimonials={testimonials}
      title={introTitle}
      description={introDescription}
      align={introAlign}
      averageRating={summary.rating}
      totalReviews={summary.count}
      buttonLabel="Se alle anmeldelser"
      buttonHref={homepageLocation.mapsPlaceUrl}
    />
  );
}
