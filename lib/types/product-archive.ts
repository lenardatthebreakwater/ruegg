/**
 * Filter state for the product archive.
 * Each page (brand, category, all products) can enable/disable which filters to show.
 */
export type ProductArchiveFilters = {
  searchQuery: string;
  priceRange: [number, number];
  maxPowerRange: [number, number];
  nominalPowerRange: [number, number];
  brands: string[];
  fireplaceTypes: string[];
  colors: string[];
  attributeFilters: Record<string, string[]>;
};

export type ProductArchiveFilterConfig = {
  showPrice?: boolean;
  showMaxPower?: boolean;
  showNominalPower?: boolean;
  showBrand?: boolean;
  showFireplaceType?: boolean;
  showColor?: boolean;
};

export const DEFAULT_FILTER_CONFIG: ProductArchiveFilterConfig = {
  showPrice: true,
  showMaxPower: true,
  showNominalPower: true,
  showBrand: true,
  showFireplaceType: true,
  showColor: true,
};

export type ProductArchiveSortOrder =
  | "relevance"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export type ProductArchiveViewMode = "grid" | "list";
