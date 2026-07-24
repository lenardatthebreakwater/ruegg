import dynamic from "next/dynamic";

import { HomepageCtaBand } from "@/components/homepage/homepage-cta-band";
import { HomeSectionDefer } from "@/components/homepage/home-section-defer";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";
import type { FAQItem } from "@/lib/data/homepage";

/**
 * Lean below-the-fold homepage — Strategy A catalog + lead-gen.
 * Peisbutikken hub grids, offer blocks, and campaign strips are intentionally omitted.
 */
const FAQSection = dynamic(
  () =>
    import("@/components/homepage/faq-section").then((m) => ({
      default: m.FAQSection,
    })),
  { loading: () => <div className="min-h-80" aria-hidden /> },
);

const ContactSection = dynamic(
  () =>
    import("@/components/homepage/contact-section").then((m) => ({
      default: m.ContactSection,
    })),
  { loading: () => <div className="min-h-[32rem]" aria-hidden /> },
);

type HomeBelowFoldProps = {
  faqItems: FAQItem[];
};

export function HomeBelowFold({ faqItems }: HomeBelowFoldProps) {
  return (
    <>
      <HomepageCtaBand />
      <HomeSectionDefer intrinsicHeight={420}>
        <FAQSection items={faqItems} />
      </HomeSectionDefer>
      {/* No content-visibility defer: paint containment can clip the Turnstile
          iframe’s right edge in the 2-column contact band. */}
      <ContactSection
        formId={CONTACT_FORM_PLACEMENTS.homepage.formId}
        formName={CONTACT_FORM_PLACEMENTS.homepage.formName}
      />
    </>
  );
}
