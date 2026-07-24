import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import {
  buildReservedelerFamilyHref,
  buildReservedelerHref,
} from "@/lib/products/paths";

const HOME_CRUMB: BreadcrumbItem = { href: "/", label: "Hjem" };
const ACCOUNT_CRUMB: BreadcrumbItem = { href: "/min-konto/", label: "Min konto" };
const ORDERS_CRUMB: BreadcrumbItem = {
  href: "/min-konto/ordrer/",
  label: "Ordrer",
};
const MIN_PEIS_CRUMB: BreadcrumbItem = {
  href: "/min-konto/min-peis/",
  label: "Min peis",
};
const RESERVEDELER_CRUMB: BreadcrumbItem = {
  href: buildReservedelerHref(),
  label: "Reservedeler",
};

function buildAccountMinPeisDetailHref(slug: string): string {
  return `/min-konto/min-peis/${encodeURIComponent(slug)}/`;
}

function withHome(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return [HOME_CRUMB, ...items];
}

export function buildFlatBreadcrumbs(currentLabel: string): BreadcrumbItem[] {
  return withHome([{ label: currentLabel }]);
}

export function buildAccountBreadcrumbs(currentLabel: string): BreadcrumbItem[] {
  if (currentLabel === ACCOUNT_CRUMB.label) {
    return withHome([{ label: ACCOUNT_CRUMB.label }]);
  }

  return withHome([ACCOUNT_CRUMB, { label: currentLabel }]);
}

/** Order detail: Min konto → Ordrer → order number. */
export function buildAccountOrderBreadcrumbs(orderLabel: string): BreadcrumbItem[] {
  return withHome([ACCOUNT_CRUMB, ORDERS_CRUMB, { label: orderLabel }]);
}

/** Fireplace detail: Min konto → Min peis → fireplace. */
export function buildAccountMinPeisBreadcrumbs(peisLabel: string): BreadcrumbItem[] {
  return withHome([ACCOUNT_CRUMB, MIN_PEIS_CRUMB, { label: peisLabel }]);
}

/** Parts for a fireplace: Min konto → Min peis → fireplace → Reservedeler. */
export function buildAccountMinPeisReservedelerBreadcrumbs(
  peisSlug: string,
  peisLabel = "Peis"
): BreadcrumbItem[] {
  return withHome([
    ACCOUNT_CRUMB,
    MIN_PEIS_CRUMB,
    { href: buildAccountMinPeisDetailHref(peisSlug), label: peisLabel },
    { label: "Reservedeler" },
  ]);
}

export function buildReservedelerFamilyBreadcrumbs(familyLabel: string): BreadcrumbItem[] {
  return withHome([
    RESERVEDELER_CRUMB,
    { label: familyLabel },
  ]);
}

/** Item page: Reservedeler → family hub → model. */
export function buildReservedelerItemBreadcrumbs(options: {
  familySlug: string;
  familyLabel: string;
  itemLabel: string;
}): BreadcrumbItem[] {
  return withHome([
    RESERVEDELER_CRUMB,
    {
      href: buildReservedelerFamilyHref(options.familySlug),
      label: options.familyLabel,
    },
    { label: options.itemLabel },
  ]);
}

export function buildReservedelerRootBreadcrumbs(): BreadcrumbItem[] {
  return withHome([{ label: RESERVEDELER_CRUMB.label }]);
}
