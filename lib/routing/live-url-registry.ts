const RESERVED_FAMILY_BY_BRAND: Record<string, string> = {
  aduro: "aduro-deler",
  asgard: "aduro-deler",
  jydepejsen: "aduro-deler",
  dovre: "dovre-deler",
  nordpeis: "nordpeis-deler",
};

function ensureSlug(slug: string): string {
  return encodeURIComponent(slug.trim());
}

function ensureTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

export function buildProductHref(slug: string): string {
  return ensureTrailingSlash(`/produkt/${ensureSlug(slug)}`);
}

export function buildProductsArchiveHref(): string {
  return "/shop/";
}

export function buildCategoryHref(categorySlug: string): string {
  return ensureTrailingSlash(`/produktkategori/${ensureSlug(categorySlug)}`);
}

export function buildBrandHref(brandSlug: string): string {
  return ensureTrailingSlash(`/brand/${ensureSlug(brandSlug)}`);
}

export function buildCategoryBrandHref(
  categorySlug: string,
  brandSlug: string
): string {
  const params = new URLSearchParams({ brand: brandSlug });
  return `${buildCategoryHref(categorySlug)}?${params.toString()}`;
}

export function getReservedelerFamilySlug(brandSlug: string): string | null {
  return RESERVED_FAMILY_BY_BRAND[brandSlug] ?? null;
}

export function buildReservedelerHref(optionalBrandSlug?: string): string {
  const base = ensureTrailingSlash("/reservedeler");
  if (!optionalBrandSlug?.trim()) {
    return base;
  }
  const params = new URLSearchParams({ brand: optionalBrandSlug.trim() });
  return `${base}?${params.toString()}`;
}

/** Account-scoped spare parts for one owned peis. */
export function buildMinPeisReservedelerHref(peisSlug: string): string {
  return ensureTrailingSlash(
    `/min-konto/min-peis/${ensureSlug(peisSlug)}/reservedeler`
  );
}

export function buildReservedelerItemHref(
  brandSlug: string,
  itemSlug: string
): string {
  const familySlug = getReservedelerFamilySlug(brandSlug);
  if (!familySlug) {
    return buildReservedelerHref();
  }
  return ensureTrailingSlash(`/${familySlug}/${ensureSlug(itemSlug)}`);
}

export function buildReservedelerFamilyHref(familySlug: string): string {
  return ensureTrailingSlash(`/${ensureSlug(familySlug)}`);
}
