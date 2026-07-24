import {
  getBrandDisplayName,
  getCategoryDisplayName,
} from "@/components/navbar/nav-menu-data";
import {
  buildBrandHref,
  buildCategoryBrandHref,
  buildCategoryHref,
  buildProductsArchiveHref,
} from "@/lib/products/paths";
import type { ProductCategoryArchiveBanner } from "@/lib/graphql/fetch-product-category-banner";
import type { ProductBrandArchiveBanner } from "@/lib/graphql/fetch-product-brand-banner";

export type ProductsFilterParams = {
  onSale?: string;
  category?: string;
  brand?: string;
  q?: string;
};

export function buildProductsPageMeta(sp: ProductsFilterParams) {
  const onSaleOnly = sp.onSale === "true";
  const categorySlug = sp.category || undefined;
  const brandSlug = sp.brand || undefined;
  const searchQuery = sp.q?.trim() || undefined;

  const categoryName = categorySlug
    ? getCategoryDisplayName(categorySlug)
    : undefined;
  const brandName = brandSlug ? getBrandDisplayName(brandSlug) : undefined;

  let title = "Produkter";
  let subtitle = "Utforsk vårt utvalg av peiser og tilbehør";

  if (searchQuery) {
    title = `Søkeresultater: "${searchQuery}"`;
    subtitle = "Utforsk alle treff og filtrer videre.";
  } else if (onSaleOnly) {
    title = "Tilbud";
    subtitle = "Produkter på salg - spar på peiser og vedovner";
  } else if (categoryName && brandName) {
    title = `${categoryName} - ${brandName}`;
    subtitle = `${brandName} ${categoryName.toLowerCase()}`;
  } else if (categoryName) {
    title = categoryName;
    subtitle = `Utforsk vårt utvalg av ${categoryName.toLowerCase()}`;
  } else if (brandName) {
    title = brandName;
    subtitle = `Produkter fra ${brandName}`;
  }

  const breadcrumbs: Array<{ href?: string; label: string }> = [
    { href: "/", label: "Hjem" },
  ];

  if (searchQuery) {
    breadcrumbs.push({ href: buildProductsArchiveHref(), label: "Produkter" });
    breadcrumbs.push({ label: `Søk: ${searchQuery}` });
  } else if (onSaleOnly) {
    breadcrumbs.push({ label: "Tilbud" });
  } else if (categorySlug || brandSlug) {
    if (categoryName && brandName && categorySlug && brandSlug) {
      breadcrumbs.push({
        href: buildCategoryHref(categorySlug),
        label: categoryName,
      });
      breadcrumbs.push({ label: brandName });
    } else if (categoryName && categorySlug) {
      breadcrumbs.push({ label: categoryName });
    } else if (brandName && brandSlug) {
      breadcrumbs.push({ label: brandName });
    } else {
      breadcrumbs.push({ label: title });
    }
  } else {
    breadcrumbs.push({ label: "Produkter" });
  }

  return {
    title,
    subtitle,
    breadcrumbs,
    onSaleOnly,
    categorySlug,
    brandSlug,
    searchQuery,
    categoryHref:
      categorySlug && brandSlug
        ? buildCategoryBrandHref(categorySlug, brandSlug)
        : categorySlug
          ? buildCategoryHref(categorySlug)
          : undefined,
    brandHref: brandSlug ? buildBrandHref(brandSlug) : undefined,
  };
}

/**
 * Merges WordPress product category (name, description, banner image) into the
 * product archive hero when the URL is category-driven (not search, not tilbud).
 * With `?brand=`, keeps the combined H1; still uses WP description and image when available.
 */
export function mergeProductCategoryPageHero(
  sp: ProductsFilterParams,
  wp: ProductCategoryArchiveBanner | null
): {
  title: string;
  subtitle: string;
  bannerImage?: { src: string; alt: string };
} {
  const base = buildProductsPageMeta(sp);
  if (!wp) {
    return { title: base.title, subtitle: base.subtitle };
  }
  const isCategoryDrivenView =
    !base.searchQuery && !base.onSaleOnly && Boolean(base.categorySlug);
  if (!isCategoryDrivenView) {
    return { title: base.title, subtitle: base.subtitle };
  }
  const hasBrand = Boolean(base.brandSlug);
  return {
    title: hasBrand ? base.title : wp.name,
    subtitle: wp.descriptionPlain ?? base.subtitle,
    bannerImage: wp.bannerImage ?? undefined,
  };
}

/**
 * Merges WordPress product brand (name, description, banner image) into the archive hero
 * for pure brand URLs (`/brand/...`) — not search, not tilbud, no category filter.
 */
export function mergeProductBrandPageHero(
  sp: ProductsFilterParams,
  wp: ProductBrandArchiveBanner | null
): {
  title: string;
  subtitle: string;
  bannerImage?: { src: string; alt: string };
} {
  const base = buildProductsPageMeta(sp);
  const isPureBrandHub =
    !base.searchQuery &&
    !base.onSaleOnly &&
    Boolean(base.brandSlug) &&
    !base.categorySlug;

  if (!isPureBrandHub || !wp) {
    return { title: base.title, subtitle: base.subtitle };
  }

  return {
    title: wp.name || base.title,
    subtitle: wp.descriptionPlain ?? base.subtitle,
    bannerImage: wp.bannerImage ?? undefined,
  };
}
