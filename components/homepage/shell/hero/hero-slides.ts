export type HeroFloatingProp = {
  src: string;
  /** Positioning + size utilities for the absolute prop. */
  className: string;
  /**
   * How to knock out baked backgrounds without manual editing:
   * - darken → white bg becomes invisible on dark stage
   * - screen → black bg becomes invisible (glow/sparks)
   * - normal → dark stage absorbs near-black product mats
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
  props: readonly HeroFloatingProp[];
};

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "peisovn",
    label: "Peisovn",
    headline: "Peisovner med sveitsisk presisjon",
    support: "Frittstående peiser som varmer hele rommet — vi hjelper deg å velge riktig modell.",
    href: "/shop/",
    cta: "Se peisovner",
    productSrc: "/images/homepage/shell/hero/peisovn/product.png",
    backdropWord: "Peisovn",
    washClassName: "bg-[radial-gradient(ellipse_at_60%_45%,#3a3428_0%,transparent_55%)]",
    props: [
      {
        src: "/images/homepage/shell/hero/peisovn/prop-birch-log.png",
        className:
          "left-[4%] top-[18%] w-[22%] sm:left-[8%] sm:top-[22%] sm:w-[18%] lg:left-[2%] lg:w-[16%]",
        blend: "screen",
      },
      {
        src: "/images/homepage/shell/hero/peisovn/prop-birch-stack.png",
        className:
          "right-[2%] bottom-[16%] w-[26%] sm:right-[6%] sm:bottom-[20%] sm:w-[20%] lg:right-[0%] lg:w-[18%]",
        blend: "screen",
      },
    ],
  },
  {
    id: "peisinnsats",
    label: "Peisinnsats",
    headline: "Peisinnsatser for ren arkitektur",
    support: "Integrert i veggen — bred flamme og diskret stål. Vi finner innsatsen som passer huset.",
    href: "/shop/",
    cta: "Se peisinnsatser",
    productSrc: "/images/homepage/shell/hero/peisinnsats/product.png",
    backdropWord: "Innsats",
    washClassName: "bg-[radial-gradient(ellipse_at_55%_50%,#2f3a32_0%,transparent_58%)]",
    props: [
      {
        src: "/images/homepage/shell/hero/peisinnsats/prop-glass-corner.png",
        className:
          "left-[2%] top-[14%] w-[28%] sm:left-[4%] sm:w-[22%] lg:left-[-2%] lg:w-[20%]",
        blend: "screen",
      },
      // Handle kept on disk (white mat). Skip in UI on dark stage — darken blend hides the black metal.
    ],
  },
  {
    id: "utepeis",
    label: "Utepeis",
    headline: "Utepeiser for lange kvelder",
    support: "Corten og ild ute — en peis som blir samlingspunktet i hagen.",
    href: "/shop/",
    cta: "Se utepeiser",
    productSrc: "/images/homepage/shell/hero/utepeis/product.png",
    backdropWord: "Utepeis",
    washClassName: "bg-[radial-gradient(ellipse_at_58%_48%,#4a2f22_0%,transparent_55%)]",
    props: [
      {
        src: "/images/homepage/shell/hero/utepeis/prop-corten-shard.png",
        className:
          "left-[4%] bottom-[18%] w-[24%] sm:left-[8%] sm:w-[18%] lg:left-[0%] lg:w-[16%]",
        blend: "screen",
      },
      {
        src: "/images/homepage/shell/hero/utepeis/prop-corten-bolt.png",
        className:
          "right-[8%] top-[16%] w-[14%] sm:right-[12%] sm:w-[11%] lg:right-[6%] lg:w-[10%]",
        blend: "screen",
      },
      {
        src: "/images/homepage/shell/hero/utepeis/prop-sparks.png",
        className:
          "right-[2%] bottom-[28%] w-[22%] sm:right-[4%] sm:w-[18%] lg:right-[-2%] lg:w-[16%]",
        blend: "screen",
      },
    ],
  },
];
