export type HeroFloatingProp = {
  src: string;
  /** Positioning + size utilities for the absolute prop. */
  className: string;
  /**
   * How to knock out baked backgrounds without manual editing:
   * - darken → white bg becomes invisible on dark stage
   * - screen → black bg becomes invisible (glow/sparks)
   * - normal → true transparent PNGs (preferred)
   */
  blend?: "darken" | "screen" | "normal";
};

export type HeroSlide = {
  id: string;
  label: string;
  headline: string;
  support: string;
  href: string;
  cta: string;
  productSrc: string;
  backdropWord: string;
  /** Slide-specific stage wash (over deep base). */
  washClassName: string;
  /**
   * Extra floating layers. Empty when the product image is already a
   * composed scene (product + garnish baked together).
   */
  props: readonly HeroFloatingProp[];
  /** CSS spark jets from the firebox (no spark PNG needed). */
  showFireSparks?: boolean;
  /** Tailwind max-width for the product image (landscape vs tall). */
  productMaxClass?: string;
};

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "peisovn",
    label: "Peisovn",
    headline: "Peisovner med sveitsisk preg",
    support: "Frittstående peiser som varmer hele rommet.",
    href: "/shop/",
    cta: "Se peisovner",
    productSrc: "/images/homepage/shell/hero/peisovn/product.png?v=2",
    backdropWord: "Peisovn",
    washClassName:
      "bg-[radial-gradient(ellipse_at_68%_42%,rgba(110,92,62,0.28)_0%,transparent_58%)]",
    showFireSparks: true,
    productMaxClass: "max-w-xl",
    props: [
      {
        src: "/images/homepage/shell/hero/peisovn/prop-birch-log.png?v=5",
        className:
          "left-[9%] top-[19%] w-[21%] -rotate-[8deg] sm:left-[11%] sm:top-[21%] sm:w-[17%] lg:left-[10%] lg:w-[16%]",
        blend: "normal",
      },
      {
        src: "/images/homepage/shell/hero/peisovn/prop-birch-stack.png?v=5",
        className:
          "right-[9%] bottom-[13%] w-[25%] rotate-[10deg] sm:right-[11%] sm:bottom-[15%] sm:w-[19%] lg:right-[10%] lg:w-[18%]",
        blend: "normal",
      },
    ],
  },
  {
    id: "peisinnsats",
    label: "Peisinnsats",
    headline: "Peisinnsatser for hjemmet",
    support: "Bred flamme og diskret stål i veggen.",
    href: "/shop/",
    cta: "Se peisinnsatser",
    productSrc: "/images/homepage/shell/hero/peisinnsats/product.png?v=4",
    backdropWord: "Innsats",
    washClassName:
      "bg-[radial-gradient(ellipse_at_65%_48%,rgba(55,70,58,0.22)_0%,transparent_55%)]",
    showFireSparks: true,
    productMaxClass: "max-w-xl",
    props: [
      {
        src: "/images/homepage/shell/hero/peisinnsats/prop-glass-corner.png?v=4",
        className:
          "left-[-2%] top-[8%] w-[15%] -rotate-[11deg] sm:left-[-1%] sm:top-[10%] sm:w-[13%] lg:left-[-4%] lg:w-[12%]",
        blend: "normal",
      },
      {
        src: "/images/homepage/shell/hero/peisinnsats/prop-handle.png?v=4",
        className:
          "right-[2%] bottom-[8%] w-[9%] rotate-[14deg] sm:right-[4%] sm:bottom-[10%] sm:w-[8%] lg:right-[0%] lg:w-[7%]",
        blend: "normal",
      },
    ],
  },
  {
    id: "utepeis",
    label: "Utepeis",
    headline: "Utepeiser for kvelden",
    support: "Corten og ild ute i hagen.",
    href: "/shop/",
    cta: "Se utepeiser",
    productSrc: "/images/homepage/shell/hero/utepeis/product.png?v=1",
    backdropWord: "Utepeis",
    washClassName:
      "bg-[radial-gradient(ellipse_at_66%_46%,rgba(90,52,36,0.26)_0%,transparent_55%)]",
    showFireSparks: true,
    productMaxClass: "max-w-sm",
    props: [
      {
        src: "/images/homepage/shell/hero/utepeis/prop-corten-bolt.png?v=1",
        className:
          "right-[4%] top-[12%] w-[14%] rotate-[22deg] sm:right-[6%] sm:top-[14%] sm:w-[12%] lg:right-[2%] lg:w-[11%]",
        blend: "normal",
      },
      {
        src: "/images/homepage/shell/hero/utepeis/prop-corten-shard.png?v=1",
        className:
          "left-[2%] bottom-[10%] w-[22%] -rotate-[18deg] sm:left-[4%] sm:bottom-[12%] sm:w-[18%] lg:left-[0%] lg:w-[16%]",
        blend: "normal",
      },
    ],
  },
];
