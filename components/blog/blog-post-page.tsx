import type { BlogPost } from "@/lib/blog/types";
import { BlogPostHeader } from "@/components/blog/blog-post-header";
import { BlogPostFeaturedImage } from "@/components/blog/blog-post-featured-image";
import { BlogPostSections } from "@/components/blog/blog-post-sections";
import { BlogKortFortalt } from "@/components/blog/blog-kort-fortalt";
import { BlogPostGallery } from "@/components/blog/blog-post-gallery";
import { BlogArchiveCta } from "@/components/blog/blog-archive-cta";
import { BlogPostRowList } from "@/components/blog/blog-post-row";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

type BlogPostPageProps = {
  post: BlogPost;
  relatedPosts?: BlogPost[];
};

export function BlogPostPage({ post, relatedPosts = [] }: BlogPostPageProps) {
  const hasTldr = post.tldrItems.length > 0;

  return (
    <StorefrontPageShell>
      <main>
        <BlogPostHeader post={post} />
        {post.featuredImage ? (
          <BlogPostFeaturedImage
            image={post.featuredImage}
            title={post.title}
          />
        ) : null}
        <div className={`border-b border-border ${PAGE_SECTION_PY}`}>
          {hasTldr ? (
            <ContainedLayout>
              <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-start lg:gap-12 xl:gap-16">
                <BlogKortFortalt
                  items={post.tldrItems}
                  className="order-1 lg:order-2"
                />
                <div className="order-2 min-w-0 lg:order-1">
                  <BlogPostSections sections={post.sections} flush />
                </div>
              </div>
            </ContainedLayout>
          ) : (
            <BlogPostSections sections={post.sections} />
          )}
        </div>
        <BlogPostGallery urls={post.galleryUrls} title={post.title} />
        {relatedPosts.length > 0 ? (
          <section className={`border-t border-border ${PAGE_SECTION_PY}`}>
            <ContainedLayout>
              <h2 className="font-display mb-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Flere artikler
              </h2>
              <BlogPostRowList posts={relatedPosts.slice(0, 2)} />
            </ContainedLayout>
          </section>
        ) : null}
        <BlogArchiveCta />
      </main>
    </StorefrontPageShell>
  );
}
