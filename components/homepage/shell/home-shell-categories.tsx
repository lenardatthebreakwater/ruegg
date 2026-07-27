import { CategoryPeekCarousel } from "@/components/homepage/shell/category-peek-carousel";
import { ShellSectionFrame } from "@/components/homepage/shell/shell-section-frame";

const CATEGORIES = [
  {
    title: "Peisovn",
    href: "/shop/",
    note: "Frittstående modeller",
    image: "/images/homepage/shell/category-peisovn.jpg",
  },
  {
    title: "Peisinnsats",
    href: "/shop/",
    note: "Til eksisterende peis",
    image: "/images/homepage/shell/category-peisinnsats.jpg",
  },
  {
    title: "Utepeis",
    href: "/shop/",
    note: "Terrasse og hage",
    image: "/images/homepage/shell/category-utepeis.jpg",
  },
  {
    title: "Peis",
    href: "/shop/",
    note: "Klassiske peisløsninger",
    image: "/images/homepage/shell/category-peis.jpg",
  },
] as const;

/** Category doors — peek slider with clear controls + hover craft. */
export function HomeShellCategories() {
  return (
    <ShellSectionFrame
      id="kategorier"
      eyebrow="Katalog"
      title="Peistyper"
      description="Velg type peis — så finner vi riktig modell sammen."
      tone="cream"
    >
      <CategoryPeekCarousel items={CATEGORIES} />
    </ShellSectionFrame>
  );
}
