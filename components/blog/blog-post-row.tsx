import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog/types";
import {
  formatBlogDate,
  formatReadingTime,
  joinBlogMeta,
} from "@/lib/blog/format";
import { BlogReveal } from "@/components/blog/blog-reveal";
import { BlogCategoryTag } from "@/components/blog/blog-category-tag";
import { cn } from "@/lib/utils";

type BlogPostRowProps = {
  post: BlogPost;
  /** Alternate image to the right on md+. */
  imageRight?: boolean;
  className?: string;
  delay?: number;
};

export function BlogPostRow({
  post,
  imageRight = false,
  className,
  delay = 0,
}: BlogPostRowProps) {
  const meta = joinBlogMeta([
    formatBlogDate(post.date),
    formatReadingTime(post.readingTimeMinutes),
  ]);

  return (
    <BlogReveal delay={delay}>
      <Link
        href={post.path}
        className={cn(
          "group grid gap-6 border-t border-border py-10 md:grid-cols-12 md:items-center md:gap-10",
          className
        )}
      >
        <div
          className={cn(
            "relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-foreground/5 md:col-span-5",
            imageRight && "md:order-2"
          )}
        >
          {post.featuredImage ? (
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt ?? post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" aria-hidden />
          )}
        </div>
        <div className={cn("md:col-span-7", imageRight && "md:order-1")}>
          <BlogCategoryTag post={post} />
          <h2 className="font-display mt-2.5 text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
            {post.title}
          </h2>
          {post.excerptText ? (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              {post.excerptText}
            </p>
          ) : null}
          <p className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            {meta ? <span>{meta}</span> : null}
            <span className="inline-flex items-center gap-1 font-medium text-primary opacity-0 transition-[opacity,translate] group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:opacity-100">
              Les mer
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </p>
        </div>
      </Link>
    </BlogReveal>
  );
}

type BlogPostRowListProps = {
  posts: BlogPost[];
  className?: string;
};

export function BlogPostRowList({ posts, className }: BlogPostRowListProps) {
  if (posts.length === 0) return null;

  return (
    <div className={cn(className)}>
      {posts.map((post, index) => (
        <BlogPostRow
          key={post.id}
          post={post}
          imageRight={index === 1}
          delay={Math.min(index * 0.06, 0.24)}
        />
      ))}
    </div>
  );
}
