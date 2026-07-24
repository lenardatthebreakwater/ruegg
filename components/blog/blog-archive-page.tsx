import type { BlogPost } from "@/lib/blog/types";
import { BlogArchiveHeader } from "@/components/blog/blog-archive-header";
import { BlogArchiveCta } from "@/components/blog/blog-archive-cta";
import { BlogCategoryFilter } from "@/components/blog/blog-category-filter";
import { BlogEmptyState } from "@/components/blog/blog-empty-state";
import { FeaturedPostCard } from "@/components/blog/featured-post-card";
import { BlogPostRowList } from "@/components/blog/blog-post-row";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import type { BlogCategorySlug } from "@/lib/blog/constants";

type BlogArchivePageProps = {
  posts: BlogPost[];
  activeCategory?: BlogCategorySlug | null;
};

export function BlogArchivePage({
  posts,
  activeCategory = null,
}: BlogArchivePageProps) {
  const [featured, ...rest] = posts;

  return (
    <StorefrontPageShell>
      <main>
        <BlogArchiveHeader />
        <BlogCategoryFilter active={activeCategory} />
        {posts.length === 0 ? (
          <BlogEmptyState />
        ) : (
          <section className={PAGE_SECTION_PY}>
            <ContainedLayout className="space-y-8 md:space-y-10">
              {featured ? <FeaturedPostCard post={featured} /> : null}
              <BlogPostRowList posts={rest} />
            </ContainedLayout>
          </section>
        )}
        <BlogArchiveCta />
      </main>
    </StorefrontPageShell>
  );
}
