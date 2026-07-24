const PRODUCT_ARCHIVE_FIELDS_FRAGMENT = `
  id
  __typename
  name
  slug
  shortDescription
  ... on SimpleProduct {
    price
    regularPrice
    onSale
    stockStatus
    sku
    attributes {
      nodes {
        __typename
        name
        label
        options
        ... on GlobalProductAttribute {
          # Default WPGraphQL page size is 10; reservedeler products can have 60+ model terms.
          terms(first: 100) {
            nodes {
              name
              slug
            }
          }
        }
        visible
      }
    }
    metaData(keysIn: [
      "energy_label",
      "energy-rating",
      "energy_rating",
      "energy_label_image"
    ]) {
      key
      value
    }
  }
  ... on VariableProduct {
    price
    regularPrice
    onSale
    stockStatus
    sku
    attributes {
      nodes {
        __typename
        name
        label
        options
        ... on GlobalProductAttribute {
          terms(first: 100) {
            nodes {
              name
              slug
            }
          }
        }
        visible
      }
    }
    metaData(keysIn: [
      "energy_label",
      "energy-rating",
      "energy_rating",
      "energy_label_image"
    ]) {
      key
      value
    }
  }
  image {
    sourceUrl
    altText
    mediaDetails {
      width
      height
      sizes {
        name
        sourceUrl
        width
        height
      }
    }
  }
  productCategories {
    nodes {
      name
      slug
    }
  }
  ... on SimpleProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on VariableProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on ExternalProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on GroupProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on Product {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
`;

const ARCHIVE_ORDERBY_WHERE = `orderby: [{ field: MENU_ORDER, order: ASC }], visibility: CATALOG`;
const SEARCH_ORDERBY_WHERE = `orderby: [{ field: MENU_ORDER, order: ASC }], visibility: SEARCH`;
const CATALOG_POPULARITY_WHERE = `orderby: { field: POPULARITY, order: DESC }, visibility: CATALOG`;

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int, $after: String) {
    products(first: $first, after: $after, where: { ${ARCHIVE_ORDERBY_WHERE} }) {
      nodes {
        ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_ON_SALE_QUERY = `
  query GetProductsOnSale($first: Int, $after: String) {
    products(
      first: $first,
      after: $after,
      where: { ${ARCHIVE_ORDERBY_WHERE}, onSale: true }
    ) {
      nodes {
        ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_BY_CATEGORY_QUERY = `
  query GetProductsByCategory($first: Int, $after: String, $categorySlug: [String]) {
    products(
      first: $first,
      after: $after,
      where: { ${ARCHIVE_ORDERBY_WHERE}, categoryIn: $categorySlug }
    ) {
      nodes {
        ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_BY_CATEGORY_ON_SALE_QUERY = `
  query GetProductsByCategoryOnSale(
    $first: Int,
    $after: String,
    $categorySlug: [String]
  ) {
    products(
      first: $first,
      after: $after,
      where: { ${ARCHIVE_ORDERBY_WHERE}, categoryIn: $categorySlug, onSale: true }
    ) {
      nodes {
        ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_BY_BRAND_QUERY = `
  query GetProductsByBrand($first: Int, $after: String, $brandSlug: [String]) {
    products(
      first: $first,
      after: $after,
      where: { ${ARCHIVE_ORDERBY_WHERE}, productBrandIn: $brandSlug }
    ) {
      nodes {
        ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_BY_BRAND_ON_SALE_QUERY = `
  query GetProductsByBrandOnSale($first: Int, $after: String, $brandSlug: [String]) {
    products(
      first: $first,
      after: $after,
      where: { ${ARCHIVE_ORDERBY_WHERE}, productBrandIn: $brandSlug, onSale: true }
    ) {
      nodes {
        ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_BY_CATEGORY_BRAND_QUERY = `
  query GetProductsByCategoryAndBrand(
    $first: Int,
    $after: String,
    $categorySlug: [String],
    $brandSlug: [String]
  ) {
    products(
      first: $first,
      after: $after,
      where: { ${ARCHIVE_ORDERBY_WHERE}, categoryIn: $categorySlug, productBrandIn: $brandSlug }
    ) {
      nodes {
        ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCTS_BY_CATEGORY_BRAND_ON_SALE_QUERY = `
  query GetProductsByCategoryAndBrandOnSale(
    $first: Int,
    $after: String,
    $categorySlug: [String],
    $brandSlug: [String]
  ) {
    products(
      first: $first,
      after: $after,
      where: {
        ${ARCHIVE_ORDERBY_WHERE},
        categoryIn: $categorySlug,
        productBrandIn: $brandSlug,
        onSale: true
      }
    ) {
      nodes {
        ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const SEARCH_PRODUCT_FIELDS_FRAGMENT = `
  id
  name
  slug
  catalogVisibility
  ... on SimpleProduct {
    price
    sku
  }
  ... on VariableProduct {
    price
    sku
  }
  ... on ExternalProduct {
    price
    sku
  }
  ... on GroupProduct {
    price
    sku
  }
  image {
    sourceUrl
    altText
    mediaDetails {
      width
      height
      sizes {
        name
        sourceUrl
        width
        height
      }
    }
  }
  productCategories {
    nodes {
      name
      slug
    }
  }
  ... on SimpleProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on VariableProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on ExternalProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on GroupProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on Product {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `
  query GetSearchProducts($first: Int!, $after: String) {
    products(
      first: $first,
      after: $after,
      where: { ${SEARCH_ORDERBY_WHERE} }
    ) {
      nodes {
        ${SEARCH_PRODUCT_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCT_CATEGORIES_LIST_QUERY = `
  query GetProductCategoriesList($first: Int!, $after: String) {
    productCategories(first: $first, after: $after, where: { hideEmpty: false }) {
      nodes {
        slug
        name
        count
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** Sitemap term list (categories). No `modified` — not on ProductCategory here. */
export const PRODUCT_CATEGORIES_SITEMAP_QUERY = `
  query GetProductCategoriesForSitemap($first: Int!, $after: String) {
    productCategories(first: $first, after: $after, where: { hideEmpty: false }) {
      nodes {
        slug
        name
        count
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** @deprecated Alias — same as PRODUCT_CATEGORIES_SITEMAP_QUERY. */
export const PRODUCT_CATEGORIES_SITEMAP_QUERY_BASE = PRODUCT_CATEGORIES_SITEMAP_QUERY;

/** Lightweight product fields for the XML sitemap (real lastmod + image). */
export const PRODUCTS_SITEMAP_QUERY = `
  query GetProductsForSitemap($first: Int!, $after: String) {
    products(first: $first, after: $after, where: { status: "publish" }) {
      nodes {
        slug
        modified
        catalogVisibility
        image {
          sourceUrl
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** Alias used by sitemap-data (same query — Product exposes \`modified\` here). */
export const PRODUCTS_SITEMAP_QUERY_BASE = PRODUCTS_SITEMAP_QUERY;

export const PRODUCT_BRANDS_LIST_QUERY = `
  query GetProductBrandsList($first: Int!, $after: String) {
    productBrands(first: $first, after: $after) {
      nodes {
        slug
        name
        count
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** Sitemap brand list. No `modified` — not on ProductBrand here. */
export const PRODUCT_BRANDS_SITEMAP_QUERY = `
  query GetProductBrandsForSitemap($first: Int!, $after: String) {
    productBrands(first: $first, after: $after) {
      nodes {
        slug
        name
        count
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** @deprecated Alias — same as PRODUCT_BRANDS_SITEMAP_QUERY. */
export const PRODUCT_BRANDS_SITEMAP_QUERY_BASE = PRODUCT_BRANDS_SITEMAP_QUERY;

export const ACCESSORIES_BY_CATEGORY_QUERY = `
  query GetAccessoriesByCategory($categorySlug: String!, $first: Int!) {
    productCategories(first: 1, where: { slug: [$categorySlug] }) {
      nodes {
        products(first: $first) {
          nodes {
            ${PRODUCT_ARCHIVE_FIELDS_FRAGMENT}
          }
        }
      }
    }
  }
`;

/** Shared JetEngine term archive fields (PB TermNode snippet). */
const TERM_ARCHIVE_BOTTOM_BLOCKS_FIELDS = `
        archiveBottomBlocks {
          index
          imageUrl
          inspImageUrl
          textHtml
          linkText
          linkUrl
        }
`;

const TERM_ARCHIVE_FAQ_FIELDS = `
        archiveFaq {
          question
          answer
        }
`;

/**
 * Product category for archive hero + optional JetEngine bottom/FAQ.
 * Custom fields come from PB term GraphQL snippet on TermNode; fetcher
 * falls back when fields are missing (see getProductCategoryArchiveBanner).
 */
export const PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY = `
  query GetProductCategoryArchiveBanner($categorySlug: String!) {
    productCategories(first: 1, where: { slug: [$categorySlug] }) {
      nodes {
        name
        slug
        description
        headerImage1
        image {
          sourceUrl
          altText
        }
${TERM_ARCHIVE_BOTTOM_BLOCKS_FIELDS}
${TERM_ARCHIVE_FAQ_FIELDS}
      }
    }
  }
`;

export const PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY_MEDIA = `
  query GetProductCategoryArchiveBanner($categorySlug: String!) {
    productCategories(first: 1, where: { slug: [$categorySlug] }) {
      nodes {
        name
        slug
        description
        headerImage1
        image {
          sourceUrl
          altText
        }
${TERM_ARCHIVE_BOTTOM_BLOCKS_FIELDS}
      }
    }
  }
`;

export const PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY_BASE = `
  query GetProductCategoryArchiveBanner($categorySlug: String!) {
    productCategories(first: 1, where: { slug: [$categorySlug] }) {
      nodes {
        name
        slug
        description
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

/**
 * Product brand for archive hero + optional JetEngine bottom/FAQ.
 * Custom fields come from PB term GraphQL snippet; fetcher falls back when
 * fields are missing (see getProductBrandArchiveBanner).
 */
export const PRODUCT_BRAND_ARCHIVE_BANNER_QUERY = `
  query GetProductBrandArchiveBanner($brandSlug: String!) {
    productBrands(first: 1, where: { slug: [$brandSlug] }) {
      nodes {
        name
        slug
        description
        headerImage1
${TERM_ARCHIVE_BOTTOM_BLOCKS_FIELDS}
${TERM_ARCHIVE_FAQ_FIELDS}
      }
    }
  }
`;

export const PRODUCT_BRAND_ARCHIVE_BANNER_QUERY_MEDIA = `
  query GetProductBrandArchiveBanner($brandSlug: String!) {
    productBrands(first: 1, where: { slug: [$brandSlug] }) {
      nodes {
        name
        slug
        description
        headerImage1
${TERM_ARCHIVE_BOTTOM_BLOCKS_FIELDS}
      }
    }
  }
`;

export const PRODUCT_BRAND_ARCHIVE_BANNER_QUERY_BASE = `
  query GetProductBrandArchiveBanner($brandSlug: String!) {
    productBrands(first: 1, where: { slug: [$brandSlug] }) {
      nodes {
        name
        slug
        description
      }
    }
  }
`;

/**
 * Product attribute term archive (reservedeler model terms, etc.).
 * `headerImage1` + `archiveBottomBlocks` + `archiveFaq` come from the PB term
 * GraphQL snippet (TermNode). Fetcher retries with BASE when fields are missing.
 */
export const ATTRIBUTE_TERM_ARCHIVE_QUERY = `
  query GetAttributeTermArchive($taxonomies: [TaxonomyEnum], $slug: String!) {
    terms(first: 1, where: { taxonomies: $taxonomies, slug: [$slug] }) {
      nodes {
        name
        slug
        description
        taxonomyName
        headerImage1
${TERM_ARCHIVE_BOTTOM_BLOCKS_FIELDS}
${TERM_ARCHIVE_FAQ_FIELDS}
      }
    }
  }
`;

export const ATTRIBUTE_TERM_ARCHIVE_QUERY_MEDIA = `
  query GetAttributeTermArchive($taxonomies: [TaxonomyEnum], $slug: String!) {
    terms(first: 1, where: { taxonomies: $taxonomies, slug: [$slug] }) {
      nodes {
        name
        slug
        description
        taxonomyName
        headerImage1
${TERM_ARCHIVE_BOTTOM_BLOCKS_FIELDS}
      }
    }
  }
`;

export const ATTRIBUTE_TERM_ARCHIVE_QUERY_BASE = `
  query GetAttributeTermArchive($taxonomies: [TaxonomyEnum], $slug: String!) {
    terms(first: 1, where: { taxonomies: $taxonomies, slug: [$slug] }) {
      nodes {
        name
        slug
        description
        taxonomyName
      }
    }
  }
`;

/** Card fields + energimerke meta (same keys as archive) so listings/carousels can show badges. */
const PRODUCT_CARD_FRAGMENT = `
  id
  name
  slug
  ... on SimpleProduct {
    price
    regularPrice
    onSale
    metaData(keysIn: [
      "energy_label",
      "energy-rating",
      "energy_rating",
      "energy_label_image"
    ]) {
      key
      value
    }
  }
  ... on VariableProduct {
    price
    regularPrice
    onSale
    metaData(keysIn: [
      "energy_label",
      "energy-rating",
      "energy_rating",
      "energy_label_image"
    ]) {
      key
      value
    }
  }
  image {
    sourceUrl
    altText
    mediaDetails {
      width
      height
      sizes {
        name
        sourceUrl
        width
        height
      }
    }
  }
  ... on SimpleProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on VariableProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on ExternalProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on GroupProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on Product {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
`;

/** Min peis accessory cards: card fields + typename/stock for ATC. */
const MIN_PEIS_ACCESSORY_CARD_FRAGMENT = `
  ${PRODUCT_CARD_FRAGMENT}
  __typename
  ... on SimpleProduct {
    stockStatus
  }
  ... on VariableProduct {
    stockStatus
  }
`;

const PRODUCT_DETAIL_FIELDS_FRAGMENT = `
  id
  __typename
  name
  slug
  ... on SimpleProduct {
    price
    regularPrice
    onSale
    stockStatus
    sku
    weight
    length
    width
    height
    attributes {
      nodes {
        __typename
        name
        label
        options
        ... on GlobalProductAttribute {
          terms(first: 100) {
            nodes {
              name
              slug
            }
          }
        }
        visible
      }
    }
    metaData(keysIn: [
      "energy_label",
      "energy-rating",
      "energy_rating",
      "energy_label_image",
      "delivery-period",
      "file",
      "tekniskdatacustom",
      "dimensjonercustom",
      "nobb",
      "product_description_cards",
      "product_inspiration_gallery",
      "product_blueprint_gallery",
      "insp-image-1",
      "insp-image-2",
      "insp-image-3",
      "insp-text-1",
      "insp-text-2",
      "insp-text-3",
      "_global_unique_id",
      "_wc_gtin",
      "gtin",
      "_rank_math_gtin_code",
      "_woosea_gtin",
      "_woosea_ean",
      "utstilt"
    ]) {
      key
      value
    }
  }
  ... on VariableProduct {
    price
    regularPrice
    onSale
    stockStatus
    sku
    weight
    length
    width
    height
    attributes {
      nodes {
        __typename
        name
        label
        options
        ... on GlobalProductAttribute {
          terms(first: 100) {
            nodes {
              name
              slug
            }
          }
        }
        visible
      }
    }
    metaData(keysIn: [
      "energy_label",
      "energy-rating",
      "energy_rating",
      "energy_label_image",
      "delivery-period",
      "file",
      "tekniskdatacustom",
      "dimensjonercustom",
      "nobb",
      "product_description_cards",
      "product_inspiration_gallery",
      "product_blueprint_gallery",
      "insp-image-1",
      "insp-image-2",
      "insp-image-3",
      "insp-text-1",
      "insp-text-2",
      "insp-text-3",
      "_global_unique_id",
      "_wc_gtin",
      "gtin",
      "_rank_math_gtin_code",
      "_woosea_gtin",
      "_woosea_ean",
      "utstilt"
    ]) {
      key
      value
    }
    variations(first: 100) {
      nodes {
        id
        databaseId
        name
        price
        regularPrice
        salePrice
        onSale
        stockStatus
        sku
        weight
        length
        width
        height
        image {
          sourceUrl
          altText
        }
        attributes {
          nodes {
            __typename
            name
            label
            value
          }
        }
        metaData(keysIn: [
          "energy_label",
          "energy-rating",
          "energy_rating",
          "energy_label_image",
          "nobb",
          "tekniskdatacustom",
          "dimensjonercustom",
          "_global_unique_id",
          "_wc_gtin",
          "gtin",
          "_rank_math_gtin_code",
          "_woosea_gtin",
          "_woosea_ean",
          "utstilt"
        ]) {
          key
          value
        }
      }
    }
  }
  image {
    sourceUrl
    altText
  }
  galleryImages(first: 10) {
    nodes {
      sourceUrl
      altText
    }
  }
  productCategories {
    nodes {
      name
      slug
    }
  }
  productTags(first: 40) {
    nodes {
      name
      slug
    }
  }
  ... on SimpleProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on VariableProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on ExternalProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on GroupProduct {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on Product {
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
`;

export const BEST_SELLING_QUERY = `
  query GetBestSelling($first: Int!) {
    products(first: $first, where: { ${CATALOG_POPULARITY_WHERE} }) {
      nodes {
        ${PRODUCT_CARD_FRAGMENT}
      }
    }
  }
`;

export const POPULAR_FIREPLACES_QUERY = `
  query GetPopularFireplaces($first: Int!) {
    products(first: $first, where: { ${CATALOG_POPULARITY_WHERE}, categoryIn: ["peisovn"] }) {
      nodes {
        ${PRODUCT_CARD_FRAGMENT}
      }
    }
  }
`;

export const PRODUCT_BY_SLUG_QUERY = `
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ${PRODUCT_DETAIL_FIELDS_FRAGMENT}
      shortDescription
      description
      ... on SimpleProduct {
        upsell {
          nodes {
            ${PRODUCT_CARD_FRAGMENT}
            shortDescription
          }
        }
        crossSell {
          nodes {
            ${PRODUCT_CARD_FRAGMENT}
          }
        }
        related(first: 6) {
          nodes {
            ${PRODUCT_CARD_FRAGMENT}
          }
        }
      }
      ... on VariableProduct {
        upsell {
          nodes {
            ${PRODUCT_CARD_FRAGMENT}
            shortDescription
          }
        }
        crossSell {
          nodes {
            ${PRODUCT_CARD_FRAGMENT}
          }
        }
        related(first: 6) {
          nodes {
            ${PRODUCT_CARD_FRAGMENT}
          }
        }
      }
    }
  }
`;

/** Slim peis fields for Min peis account (no variations gallery / PDP bloat). */
const MIN_PEIS_PRODUCT_CORE_FRAGMENT = `
  id
  __typename
  name
  slug
  image {
    sourceUrl
    altText
    mediaDetails {
      width
      height
      sizes {
        name
        sourceUrl
        width
        height
      }
    }
  }
  productCategories {
    nodes {
      name
      slug
    }
  }
  ... on SimpleProduct {
    price
    regularPrice
    onSale
    stockStatus
    sku
    weight
    length
    width
    height
    attributes {
      nodes {
        __typename
        name
        label
        options
        ... on GlobalProductAttribute {
          terms(first: 50) {
            nodes {
              name
              slug
            }
          }
        }
        visible
      }
    }
    metaData(keysIn: [
      "file",
      "tekniskdatacustom",
      "dimensjonercustom",
      "energy_label",
      "energy-rating",
      "energy_rating"
    ]) {
      key
      value
    }
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
  ... on VariableProduct {
    price
    regularPrice
    onSale
    stockStatus
    sku
    weight
    length
    width
    height
    attributes {
      nodes {
        __typename
        name
        label
        options
        ... on GlobalProductAttribute {
          terms(first: 50) {
            nodes {
              name
              slug
            }
          }
        }
        visible
      }
    }
    metaData(keysIn: [
      "file",
      "tekniskdatacustom",
      "dimensjonercustom",
      "energy_label",
      "energy-rating",
      "energy_rating"
    ]) {
      key
      value
    }
    productBrands {
      nodes {
        name
        slug
      }
    }
  }
`;

/** List/filter: classify peis without loading upsells. */
export const MIN_PEIS_LIST_PRODUCT_BY_SLUG_QUERY = `
  query GetMinPeisListProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ${MIN_PEIS_PRODUCT_CORE_FRAGMENT}
    }
  }
`;

/** Detail: core + upsell cards only (no crossSell/related/descriptions). */
export const MIN_PEIS_DETAIL_PRODUCT_BY_SLUG_QUERY = `
  query GetMinPeisDetailProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ${MIN_PEIS_PRODUCT_CORE_FRAGMENT}
      ... on SimpleProduct {
        upsell {
          nodes {
            ${MIN_PEIS_ACCESSORY_CARD_FRAGMENT}
          }
        }
      }
      ... on VariableProduct {
        upsell {
          nodes {
            ${MIN_PEIS_ACCESSORY_CARD_FRAGMENT}
          }
        }
      }
    }
  }
`;

export const MEDIA_ITEMS_BY_DATABASE_IDS_QUERY = `
  query GetMediaItemsByDatabaseIds($ids: [ID]) {
    mediaItems(where: { in: $ids }) {
      nodes {
        databaseId
        sourceUrl
        altText
      }
    }
  }
`;
