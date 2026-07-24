/** Lightweight WP page fields for sitemap lastmod (legacy pages still in WP). */
export const PAGES_SITEMAP_QUERY = `
  query GetPagesForSitemap($first: Int!, $after: String) {
    pages(first: $first, after: $after, where: { status: PUBLISH }) {
      nodes {
        slug
        uri
        modified
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
