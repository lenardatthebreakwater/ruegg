import type { Metadata } from "next";
import { BlogArchivePage } from "@/components/blog/blog-archive-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  BLOG_CATEGORY_LABELS,
  isBlogCategorySlug,
  type BlogCategorySlug,
} from "@/lib/blog/constants";
import { getBlogPosts } from "@/lib/graphql/server-posts";
import { buildFlatBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from "@/lib/seo/schema";

export const revalidate = 600;

type BlogPageProps = {
  searchParams: Promise<{ kategori?: string | string[] }>;
};

function resolveCategory(
  raw: string | string[] | undefined
): BlogCategorySlug | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const slug = value.trim().toLowerCase();
  return isBlogCategorySlug(slug) ? slug : null;
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = resolveCategory(params.kategori);
  const title = category
    ? category === "inspirasjon"
      ? "Inspirasjon"
      : `${BLOG_CATEGORY_LABELS[category]} | Inspirasjon`
    : "Inspirasjon";
  const description = category
    ? `Les om ${BLOG_CATEGORY_LABELS[category].toLowerCase()} fra Peisbutikken.`
    : "Inspirasjon, guider og råd om peis, ovn og fyring fra Peisbutikken.";

  return buildPageMetadata({
    title,
    description,
    path: category ? `/blog/?kategori=${category}` : "/blog/",
  });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const category = resolveCategory(params.kategori);
  const posts = await getBlogPosts(
    category ? { category } : undefined
  );

  const pagePath = "/blog/";
  const breadcrumbs = buildFlatBreadcrumbs("Inspirasjon");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);
  const collectionSchema = buildCollectionPageSchema({
    name: "Inspirasjon",
    description: "Inspirasjon, guider og råd om peis, ovn og fyring.",
    path: pagePath,
  });

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <JsonLdScript data={collectionSchema} />
      <BlogArchivePage posts={posts} activeCategory={category} />
    </>
  );
}
