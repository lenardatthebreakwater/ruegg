import { FAQSection } from "@/components/homepage/faq-section";
import type { FAQItem } from "@/lib/data/homepage";

type HomeShellFaqProps = {
  items: FAQItem[];
};

/** Existing FAQ accordion, without wireframe section labels. */
export function HomeShellFaq({ items }: HomeShellFaqProps) {
  return (
    <FAQSection
      items={items}
      title="Ofte stilte spørsmål"
      description="Korte svar om peiser, råd og neste steg."
    />
  );
}
