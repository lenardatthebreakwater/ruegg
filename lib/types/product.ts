import type { ProductDescriptionCardSection } from "@/lib/products/description-cards";
import type { ProductStockStatus } from "@/lib/products/stock-status";

export type ProductAttribute = {
  /** WooCommerce attribute key, e.g. `pa_bredde` (for JSON-LD/mapping) */
  name?: string;
  label: string;
  value: string;
};

export type ProductGalleryItem = {
  imageUrl: string;
  altText?: string;
  text?: string;
};

export type ProductVariation = {
  id: string;
  databaseId?: number | null;
  name: string;
  price: string;
  priceNumeric?: number | null;
  regularPrice?: string | null;
  onSale?: boolean;
  saleBadge?: string | null;
  sku?: string | null;
  nobb?: string | null;
  /** WooCommerce stock status for this variation (drives Offer availability in JSON-LD) */
  stockStatus?: ProductStockStatus | null;
  /** WooCommerce global unique id / GTIN (UPC, EAN, ISBN) when set on the variation */
  gtin?: string | null;
  image?: {
    sourceUrl: string;
    altText?: string;
  } | null;
  attributes?: ProductAttribute[] | null;
  weight?: string | null;
  dimensions?: string | null;
  weightKg?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  technicalInfo?: string | null;
  energyLabel?: string | null;
  energyRatingBadgeUrl?: string | null;
  energyLabelGuideUrl?: string | null;
};

export type Product = {
  /** Database/GraphQL id (e.g. "cG9zdDoxMjM0") */
  id: string;
  /** Product name / title */
  name: string;
  /** Slug for URLs */
  slug: string;
  /**
   * WooCommerce product type from GraphQL `__typename`
   * (e.g. VariableProduct → "variable"). Used to disable listing ATC.
   */
  productType?: "simple" | "variable" | "external" | "grouped" | null;
  /** Main product image URL */
  image?: {
    sourceUrl: string;
    altText?: string;
  } | null;
  /** Brand/vendor name (often from taxonomy or custom field) */
  brand?: string | null;
  /** Brand slug for URL filtering */
  brandSlug?: string | null;
  /** True when Woo meta `utstilt` marks the product as on display in the showroom */
  displayedInStore?: boolean;
  /** SKU code */
  sku?: string | null;
  /** Energy class text (e.g. "A") when not stored as an image URL in energy-rating */
  energyLabel?: string | null;
  /** Small rating badge image (SVG/PNG) from energy-rating meta — matches Jet `get_energy_label_link` $value */
  energyRatingBadgeUrl?: string | null;
  /** Full energy guide image (lightbox target) from energy_label_image meta */
  energyLabelGuideUrl?: string | null;
  /** Current price (formatted for display) */
  price: string;
  /** Numeric price for filtering/sorting (e.g. 12499) */
  priceNumeric?: number | null;
  /** Regular price before sale (for strikethrough) */
  regularPrice?: string | null;
  /** Whether the product is on sale */
  onSale?: boolean;
  /** Sale savings amount or percentage for badge (e.g. "Save 500 kr") */
  saleBadge?: string | null;
  /** WooCommerce stock status (drives schema.org offer availability) */
  stockStatus?: ProductStockStatus | null;
  /** Max power in kW (for fireplaces) — used for filtering */
  maxPower?: number | null;
  /** Nominal power in kW (for fireplaces) — used for filtering */
  nominalPower?: number | null;
  /** Fireplace type (e.g. "Vedovn", "Peis") — used for filtering */
  fireplaceType?: string | null;
  /** Color name — used for filtering */
  color?: string | null;
  /** Multiple images for product detail gallery (optional; falls back to image) */
  images?: Array<{ sourceUrl: string; altText?: string }> | null;
  /** Variant models (e.g. sizes/colors); each can have its own image */
  models?: Array<{
    id: string;
    name: string;
    image?: { sourceUrl: string; altText?: string } | null;
  }> | null;
  /** Normalized WooCommerce variations for variable products */
  variations?: ProductVariation[] | null;
  /** Short product description (HTML) */
  shortDescription?: string | null;
  /** Full product description (HTML or plain text) */
  description?: string | null;
  /** Structured description card sections parsed from product description */
  descriptionCards?: ProductDescriptionCardSection[] | null;
  /** Technical specifications (HTML or plain text) */
  technicalInfo?: string | null;
  /** Product attributes (label/value pairs for specs table) */
  attributes?: ProductAttribute[] | null;
  /** All attribute term slugs attached to product (used for reservedeler term filtering) */
  attributeTermSlugs?: string[] | null;
  /** Product weight (kg) */
  weight?: string | null;
  /** Parsed weight in kg (Woo `weight` field) for structured data */
  weightKg?: number | null;
  /** Product dimensions as "L x W x H" */
  dimensions?: string | null;
  /** Parsed depth (Woo `length` / depth, cm) */
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  /** Document links (e.g. PDF manuals) */
  documents?: Array<{ label: string; url: string }> | null;
  /** Product categories */
  categories?: Array<{ name: string; slug: string }> | null;
  /** NOBB number */
  nobb?: string | null;
  /** GTIN / global unique id (WooCommerce inventory field) */
  gtin?: string | null;
  /** Product tags (stikkord) from WooCommerce */
  tags?: Array<{ name: string; slug: string }> | null;
  /** Delivery period text */
  deliveryPeriod?: string | null;
  /** Recommended accessory products from WooCommerce upsells */
  recommendedAccessories?: Product[] | null;
  /** Cross-sell products (similar products set in WooCommerce) */
  crossSellProducts?: Product[] | null;
  /** WooCommerce auto-related products */
  relatedProducts?: Product[] | null;
  /** Average rating 0–5 for stars */
  rating?: number | null;
  /** Number of reviews */
  reviewCount?: number | null;
  /** Inspiration gallery cards from JetEngine metabox */
  inspirationGallery?: ProductGalleryItem[] | null;
  /** Blueprint gallery images from JetEngine metabox */
  blueprintGallery?: ProductGalleryItem[] | null;
};
