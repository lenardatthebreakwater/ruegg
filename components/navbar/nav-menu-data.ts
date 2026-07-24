import {
  buildBrandHref,
  buildCategoryBrandHref,
  buildCategoryHref,
  buildProductsArchiveHref,
  buildReservedelerHref,
} from "@/lib/products/paths";

export type NavMenuItemDef = {
  label: string;
  category?: string;
  brand?: string;
  showAll?: boolean;
  /** Absolute app path (e.g. service page). Takes precedence over category/brand. */
  href?: string;
  /** Full primary CTA tile in the desktop mega menu (centered label + arrow). */
  megaMenuCta?: boolean;
};

export type NavMenuDef = {
  key: string;
  label: string;
  items: NavMenuItemDef[];
};

/** Top-level links without a mega menu (rendered after NAV_MENUS). */
export type NavStandaloneLinkDef = {
  key: string;
  label: string;
  href: string;
};

export const NAV_STANDALONE_LINKS: NavStandaloneLinkDef[] = [
  { key: "inspirasjon", label: "Inspirasjon", href: "/blog/" },
];

export const NAV_MENUS: NavMenuDef[] = [
  {
    key: "peis",
    label: "Peis",
    items: [
      { label: "PEISOVN", category: "peisovn" },
      { label: "VEDOVN", category: "vedovn" },
      { label: "ELEMENTPEIS", category: "elementpeis" },
      { label: "PEISINNSATS", category: "peisinnsats" },
      { label: "GASSPEIS", category: "gasspeis" },
      { label: "KAKKELOVN", category: "kakkelovn" },
      { label: "UTEPEIS", category: "utepeis" },
    ],
  },
  {
    key: "tilbehor",
    label: "Tilbehør",
    items: [
      { label: "BRANNMUR", category: "brannmur" },
      { label: "GULVPLATE", category: "gulvplate" },
      { label: "OPPTENNING", category: "opptenning" },
      { label: "TILBEHØR", category: "peistilbehor" },
      { label: "RENGJØRING", category: "rengjoring" },
      { label: "VENTILER", category: "ventiler" },
      {
        label: "VIS ALLE TILBEHØR",
        category: "peistilbehor",
        showAll: true,
        megaMenuCta: true,
      },
    ],
  },
  {
    key: "pipe",
    label: "Pipe",
    items: [
      { label: "RØYKSUGER", category: "royksuger" },
      { label: "STÅLPIPE", category: "stalpipe" },
      { label: "RØR - TILKOBLING", category: "ror-og-tilkoblingsstuss" },
      {
        label: "PIPEREHABILITERING",
        href: "/piperehabilitering/",
        megaMenuCta: true,
      },
    ],
  },
  {
    key: "reservedeler",
    label: "Reservedeler",
    items: [
      { label: "ADURO", category: "reservedeler", brand: "aduro" },
      { label: "ASGÅRD", category: "reservedeler", brand: "asgard" },
      { label: "DOVRE", category: "reservedeler", brand: "dovre" },
      { label: "JYDEPEJSEN", category: "reservedeler", brand: "jydepejsen" },
      { label: "NORDPEIS", category: "reservedeler", brand: "nordpeis" },
      {
        label: "VIS ALLE RESERVEDELER",
        href: "/reservedeler/",
        showAll: true,
        megaMenuCta: true,
      },
    ],
  },
  {
    key: "merker",
    label: "Merker",
    items: [
      { label: "ADURO", brand: "aduro" },
      { label: "CHRISTIANIA KAKKELOVNER", brand: "christiania-kakkelovner" },
      { label: "DOVRE", brand: "dovre" },
      { label: "FIREFLY", brand: "firefly" },
      { label: "ELEMENT 4", brand: "element4" },
      { label: "EXODRAFT", brand: "exodraft" },
      { label: "HAJDUK", brand: "hajduk" },
      { label: "HEATRO", brand: "heatro" },
      { label: "JYDEPEJSEN", brand: "jydepejsen" },
      { label: "JUSTUS", brand: "justus" },
      { label: "NORDPEIS", brand: "nordpeis" },
      { label: "ORANIER", brand: "oranier" },
      { label: "RÜEGG CHEMINÈE", brand: "ruegg-cheminee" },
      { label: "SKANTHERM", brand: "skantherm" },
      { label: "SPARTHERM", brand: "spartherm" },
    ],
  },
];

export function buildNavItemHref(item: NavMenuItemDef): string {
  if (item.href) {
    return item.href;
  }

  if (item.category && item.brand) {
    if (item.category === "reservedeler") {
      return buildReservedelerHref(item.brand);
    }
    return buildCategoryBrandHref(item.category, item.brand);
  }

  if (item.category) {
    return buildCategoryHref(item.category);
  }

  if (item.brand) {
    return buildBrandHref(item.brand);
  }

  const params = new URLSearchParams();
  if (item.category) params.set("category", item.category);
  if (item.brand) params.set("brand", item.brand);
  const archiveHref = buildProductsArchiveHref();
  return params.size ? `${archiveHref}?${params.toString()}` : archiveHref;
}

export function buildNavItemImagePath(
  menuKey: string,
  item: NavMenuItemDef
): string {
  const basePath = `/images/navbar/${menuKey}`;

  if (item.category && item.brand) {
    return `${basePath}/${item.brand}.webp`;
  }

  if (item.category) {
    return `${basePath}/${item.category}.webp`;
  }

  if (item.brand) {
    return `${basePath}/${item.brand}.webp`;
  }

  return "/images/navbar/placeholder.webp";
}

/**
 * Nav mega-menu uses ALL CAPS for compact tiles; titles, breadcrumbs, and the
 * mobile menu should read as normal words (e.g. PEISOVN → Peisovn).
 */
export function formatNavLabelForArchive(label: string): string {
  return label.replaceAll(/\p{L}+/gu, (word) => {
    if (word.length <= 1) {
      return word;
    }
    if (word !== word.toLocaleUpperCase("nb-NO")) {
      return word;
    }
    if (!/^\p{L}+$/u.test(word)) {
      return word;
    }
    return (
      word.charAt(0).toLocaleUpperCase("nb-NO") +
      word.slice(1).toLocaleLowerCase("nb-NO")
    );
  });
}

export function getCategoryDisplayName(slug: string): string {
  for (const menu of NAV_MENUS) {
    for (const item of menu.items) {
      if (item.category === slug && !item.showAll) {
        return formatNavLabelForArchive(item.label);
      }
    }
  }
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

export function getBrandDisplayName(slug: string): string {
  const merkerMenu = NAV_MENUS.find((m) => m.key === "merker");
  if (merkerMenu) {
    const item = merkerMenu.items.find((i) => i.brand === slug);
    if (item) {
      return formatNavLabelForArchive(item.label);
    }
  }
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}
