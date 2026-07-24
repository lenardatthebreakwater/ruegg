import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/blog/blog-post-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { isLokalmonteringSlug } from "@/lib/blog/constants";
import {
  getBlogPostBySlug,
  getBlogPostStaticParams,
  getRelatedBlogPosts,
} from "@/lib/graphql/server-posts";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schema";

export const revalidate = 600;
export const dynamicParams = true;

type BlogSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    return await getBlogPostStaticParams();
  } catch (error) {
    console.error("[blog] generateStaticParams failed", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isLokalmonteringSlug(slug)) {
    return {};
  }

  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Artikkel ikke funnet" };
  }

  return buildPageMetadata({
    title: post.title,
    description:
      post.excerptText ??
      `Les mer om ${post.title} hos Peisbutikken.`,
    path: post.path,
    ...(post.featuredImage?.url
      ? { socialImage: { url: post.featuredImage.url } }
      : {}),
  });
}

export default async function BlogSlugPage({ params }: BlogSlugPageProps) {
  const { slug } = await params;

  if (isLokalmonteringSlug(slug)) {
    notFound();
  }

  const post = await getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(post.slug, 2);

  const breadcrumbs = [
    { label: "Hjem", href: "/" },
    { label: "Inspirasjon", href: "/blog/" },
    { label: post.title },
  ];

  return (
    <>
      <JsonLdScript
        data={buildBreadcrumbSchema(breadcrumbs, post.path)}
      />
      <JsonLdScript
        data={buildBlogPostingSchema({
          title: post.title,
          description: post.excerptText,
          path: post.path,
          datePublished: post.date,
          dateModified: post.modified,
          imageUrl: post.featuredImage?.url ?? null,
          authorName: post.author?.name ?? null,
        })}
      />
      <BlogPostPage post={post} relatedPosts={relatedPosts} />
    </>
  );
}
