/**
 * Raw shapes from WooCommerce GraphQL (WooGraphQL).
 * Used for typing API responses before mapping to app Product type.
 */
export type WooProductImageSize = {
  name?: string | null;
  sourceUrl?: string | null;
  /** WPGraphQL may return numeric strings. */
  width?: number | string | null;
  height?: number | string | null;
};

export type WooProductImage = {
  sourceUrl: string;
  altText?: string | null;
  /** Present on archive/card/search queries; omitted on PDP full-image queries. */
  mediaDetails?: {
    width?: number | null;
    height?: number | null;
    sizes?: WooProductImageSize[] | null;
  } | null;
};

export type WooProductDocument = {
  label?: string | null;
  url?: string | null;
};

export type WooMediaItem = {
  databaseId: number;
  sourceUrl: string;
  altText?: string | null;
};

export type WooProductAttribute = {
  name: string;
  label: string;
  options: string[] | null;
  terms?: {
    nodes: Array<{
      name: string;
      slug?: string | null;
    }>;
  } | null;
  visible: boolean;
};

export type WooVariationAttribute = {
  __typename?: string;
  name?: string | null;
  label?: string | null;
  value?: string | null;
  options?: string[] | null;
};

export type WooProductMetaData = {
  key: string;
  value: string | null;
};

export type WooProductCategory = {
  name: string;
  slug: string;
};

export type WooProductNode = {
  id: string;
  __typename?: string | null;
  name: string;
  slug: string;
  catalogVisibility?: string | null;
  price?: string | null;
  regularPrice?: string | null;
  onSale?: boolean | null;
  stockStatus?: string | null;
  sku?: string | null;
  weight?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  image?: WooProductImage | null;
  galleryImages?: {
    nodes: Array<WooProductImage>;
  } | null;
  shortDescription?: string | null;
  description?: string | null;
  attributes?: {
    nodes: WooProductAttribute[];
  } | null;
  metaData?: WooProductMetaData[] | null;
  productCategories?: {
    nodes: WooProductCategory[];
  } | null;
  productTags?: {
    nodes: Array<{ name: string; slug: string }>;
  } | null;
  productBrands?: {
    nodes: Array<{ name: string; slug: string }>;
  } | null;
  upsell?: {
    nodes: WooProductNode[];
  } | null;
  crossSell?: {
    nodes: WooProductNode[];
  } | null;
  related?: {
    nodes: WooProductNode[];
  } | null;
  /** Technical specs – expose via ACF or custom field in WordPress if needed */
  technicalInfo?: string | null;
  /** Document links – expose via ACF repeater or custom field in WordPress if needed */
  documents?: Array<WooProductDocument> | null;
  variations?: {
    nodes: WooProductVariationNode[];
  } | null;
};

export type WooProductVariationNode = {
  id: string;
  databaseId?: number | null;
  name?: string | null;
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  onSale?: boolean | null;
  stockStatus?: string | null;
  sku?: string | null;
  weight?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  image?: WooProductImage | null;
  attributes?: {
    nodes: WooVariationAttribute[];
  } | null;
  metaData?: WooProductMetaData[] | null;
};

export type WooProductsResponse = {
  products: {
    nodes: WooProductNode[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

export type WooProductBySlugResponse = {
  product: WooProductNode | null;
};

/** Response for listing product categories (slug, name, count). */
export type WooProductCategoriesListResponse = {
  productCategories: {
    nodes: Array<{ slug: string; name: string; count?: number | null }>;
  };
};

/** Response for productCategories(where: { slug: [...] }) – WooGraphQL connection. */
export type WooAccessoriesByCategoryResponse = {
  productCategories: {
    nodes: Array<{
      products: { nodes: WooProductNode[] };
    }>;
  };
};

/** FAQ row from JetEngine `archive-faq` (GraphQL `archiveFaq`). */
export type TermArchiveFaqItem = {
  id: string;
  question: string;
  /** May contain light HTML from WP; strip for schema / plain UI. */
  answer: string;
};

type WooTermArchiveBottomBlocksField = {
  archiveBottomBlocks?: Array<{
    index?: number | null;
    imageUrl?: string | null;
    inspImageUrl?: string | null;
    textHtml?: string | null;
    linkText?: string | null;
    linkUrl?: string | null;
  } | null> | null;
  archiveFaq?: Array<{
    question?: string | null;
    answer?: string | null;
  } | null> | null;
};

/** Category archive hero: Woo fields plus optional JetEngine TermNode fields. */
export type WooProductCategoryArchiveBannerNode = {
  name: string;
  slug: string;
  description?: string | null;
  /** Term meta banner URL when PB term GraphQL snippet is active */
  headerImage1?: string | null;
  image?: {
    sourceUrl?: string | null;
    altText?: string | null;
  } | null;
} & WooTermArchiveBottomBlocksField;

export type WooProductCategoryArchiveBannerResponse = {
  productCategories: {
    nodes: WooProductCategoryArchiveBannerNode[];
  };
};

/** Brand archive hero: Woo fields plus optional JetEngine TermNode fields. */
export type WooProductBrandArchiveBannerNode = {
  name: string;
  slug: string;
  description?: string | null;
  /** Term meta banner URL when PB term GraphQL snippet is active */
  headerImage1?: string | null;
} & WooTermArchiveBottomBlocksField;

export type WooProductBrandArchiveBannerResponse = {
  productBrands: {
    nodes: WooProductBrandArchiveBannerNode[];
  };
};

/** JetEngine bottom archive slot on a term (category / brand / attribute). */
export type TermArchiveBottomBlock = {
  index: number;
  imageUrl: string | null;
  inspImageUrl: string | null;
  textHtml: string | null;
  linkText: string | null;
  linkUrl: string | null;
};

/** Attribute-term archive (e.g. pa_aduro-deler) via `terms` + TaxonomyEnum. */
export type WooAttributeTermArchiveNode = {
  name: string;
  slug: string;
  description?: string | null;
  taxonomyName?: string | null;
  headerImage1?: string | null;
} & WooTermArchiveBottomBlocksField;

export type WooAttributeTermArchiveResponse = {
  terms: {
    nodes: WooAttributeTermArchiveNode[];
  };
};

export type WooMediaItemsByIdsResponse = {
  mediaItems: {
    nodes: WooMediaItem[];
  };
};

export type WpCategoryNode = {
  name: string;
  slug: string;
};

export type WpFeaturedImageNode = {
  sourceUrl: string;
  altText?: string | null;
};

export type WpPostNode = {
  id: string;
  databaseId?: number | null;
  slug: string;
  uri?: string | null;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  date?: string | null;
  modified?: string | null;
  author?: {
    node?: {
      databaseId?: number | null;
      name?: string | null;
      slug?: string | null;
    } | null;
  } | null;
  categories?: {
    nodes: WpCategoryNode[];
  } | null;
  featuredImage?: {
    node?: WpFeaturedImageNode | null;
  } | null;
  customFields?: Record<string, unknown> | null;
};

export type WpPostsByCategoryResponse = {
  posts: {
    nodes: WpPostNode[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

export type WpPostBySlugResponse = {
  post: WpPostNode | null;
};
