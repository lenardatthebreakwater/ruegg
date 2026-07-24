export type RueggNavLink = {
  href: string;
  label: string;
};

/** Primary storefront navigation — matches live ruegg.no thin nav. */
export const RUEGG_PRIMARY_NAV_LINKS: RueggNavLink[] = [
  { href: "/shop/", label: "Våre peiser" },
  { href: "/om-oss/", label: "Om oss" },
  { href: "/kontakt-oss/", label: "Kontakt" },
];
