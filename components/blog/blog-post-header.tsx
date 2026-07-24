import type { BlogPost } from "@/lib/blog/types";
import {
  formatBlogDate,
  formatReadingTime,
  joinBlogMeta,
} from "@/lib/blog/format";
import { BlogReveal } from "@/components/blog/blog-reveal";
import { BlogCategoryTag } from "@/components/blog/blog-category-tag";
import {
  EDITORIAL_HEADER_BAND_CLASS,
  EditorialHeading,
} from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";

type BlogPostHeaderProps = {
  post: BlogPost;
};

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const meta = joinBlogMeta([
    formatBlogDate(post.date),
    formatReadingTime(post.readingTimeMinutes),
  ]);

  return (
    <header className={EDITORIAL_HEADER_BAND_CLASS}>
      <ContainedLayout className="max-w-4xl">
        <BlogReveal>
          <BlogCategoryTag post={post} />
          <EditorialHeading size="pageLarge" className="mt-4">
            {post.title}
          </EditorialHeading>
          {post.author?.name || meta ? (
            <p className="mt-6 text-sm text-muted-foreground md:text-base">
              {post.author?.name ? (
                <span className="font-medium text-foreground">
                  {post.author.name}
                </span>
              ) : null}
              {post.author?.name && meta ? (
                <span
                  aria-hidden
                  className="mx-2.5 inline-block h-3.5 w-px translate-y-0.5 bg-border align-middle"
                />
              ) : null}
              {meta ? <span>{meta}</span> : null}
            </p>
          ) : null}
          {post.excerptText ? (
            <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-muted-foreground md:text-lg">
              {post.excerptText}
            </p>
          ) : null}
        </BlogReveal>
      </ContainedLayout>
    </header>
  );
}
