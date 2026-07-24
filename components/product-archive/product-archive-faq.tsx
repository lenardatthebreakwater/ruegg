"use client";

import { FAQSection } from "@/components/homepage/faq-section";
import type { FAQItem } from "@/lib/data/homepage";

type ProductArchiveFaqProps = {
  items: FAQItem[];
  /** Collection name for the section title, e.g. "peisovn". */
  collectionLabel?: string;
};

export function ProductArchiveFaq({
  items,
  collectionLabel,
}: ProductArchiveFaqProps) {
  if (!items.length) return null;

  const title = collectionLabel?.trim()
    ? `Ofte stilte spørsmål om ${collectionLabel.trim()}`
    : "Ofte stilte spørsmål";

  return (
    <FAQSection
      items={items}
      title={title}
      description="Svar på vanlige spørsmål som hjelper deg å velge riktig produkt."
      align="center"
      columnLayout="single"
    />
  );
}
