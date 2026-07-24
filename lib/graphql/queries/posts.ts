const WORDPRESS_POST_FIELDS_FRAGMENT = `
  id
  databaseId
  slug
  uri
  title
  excerpt
  content
  date
  modified
  author {
    node {
      databaseId
      name
      slug
    }
  }
  categories {
    nodes {
      name
      slug
    }
  }
  featuredImage {
    node {
      sourceUrl
      altText
    }
  }
`;

export const PEISMONTERING_POSTS_QUERY = `
  query GetPeismonteringPosts($first: Int!, $after: String) {
    posts(
      first: $first,
      after: $after,
      where: {
        categoryName: "peismontering",
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        ${WORDPRESS_POST_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** Posts in a single WP category (used for blog multi-category merge). */
export const POSTS_BY_CATEGORY_QUERY = `
  query GetPostsByCategory($categoryName: String!, $first: Int!, $after: String) {
    posts(
      first: $first,
      after: $after,
      where: {
        categoryName: $categoryName,
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        ${WORDPRESS_POST_FIELDS_FRAGMENT}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const POST_BY_SLUG_QUERY = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ${WORDPRESS_POST_FIELDS_FRAGMENT}
    }
  }
`;

/** Card fields only — used for related-post rails (no content / custom fields). */
const WORDPRESS_POST_CARD_FIELDS_FRAGMENT = `
  id
  databaseId
  slug
  uri
  title
  excerpt
  date
  modified
  author {
    node {
      databaseId
      name
      slug
    }
  }
  categories {
    nodes {
      name
      slug
    }
  }
  featuredImage {
    node {
      sourceUrl
      altText
    }
  }
`;

/**
 * Bounded related-post list for a single blog category.
 * Callers merge a few categories and take a small top-N — never paginate fully.
 */
export const RELATED_POSTS_BY_CATEGORY_QUERY = `
  query GetRelatedPostsByCategory($categoryName: String!, $first: Int!) {
    posts(
      first: $first,
      where: {
        categoryName: $categoryName,
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        ${WORDPRESS_POST_CARD_FIELDS_FRAGMENT}
      }
    }
  }
`;
