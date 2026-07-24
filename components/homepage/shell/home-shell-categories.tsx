import Image from "next/image";
import Link from "next/link";

import { ShellReveal } from "@/components/homepage/shell/shell-reveal";
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

/** Category doors - Oblica-style image-led paths (no cart). */
export function HomeShellCategories() {
  return (
    <ShellSectionFrame
      id="kategorier"
      eyebrow="Katalog"
      title="Peistyper"
      description="Store dører inn til modellene. Velg type, så finner vi riktig løsning sammen."
      tone="cream"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category, index) => (
          <ShellReveal key={category.title} delay={index * 0.07}>
            <Link
              href={category.href}
              className="group relative block overflow-hidden rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ruegg-swiss-ink)]/40"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--ruegg-swiss-taupe)]/40">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[color:var(--ruegg-swiss-deep)]/75 via-[color:var(--ruegg-swiss-deep)]/15 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-4 text-[color:var(--ruegg-swiss-paper)]">
                  <p className="font-medium">{category.title}</p>
                  <p className="mt-1 text-sm text-white/75">{category.note}</p>
                </div>
              </div>
            </Link>
          </ShellReveal>
        ))}
      </div>
    </ShellSectionFrame>
  );
}
