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

type FeaturedPostCardProps = {
  post: BlogPost;
  className?: string;
};

export function FeaturedPostCard({ post, className }: FeaturedPostCardProps) {
  const meta = joinBlogMeta([
    formatBlogDate(post.date),
    formatReadingTime(post.readingTimeMinutes),
  ]);

  return (
    <BlogReveal>
      <Link
        href={post.path}
        className={cn(
          "group grid gap-6 overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.06] via-primary/[0.02] to-transparent p-5 transition-colors hover:border-primary/25 md:grid-cols-12 md:items-center md:gap-10 md:p-7",
          className
        )}
      >
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-foreground/5 md:col-span-7">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt ?? post.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02] group-active:-translate-y-px"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" aria-hidden />
          )}
        </div>
        <div className="md:col-span-5">
          <BlogCategoryTag post={post} />
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary md:text-4xl md:leading-[1.1]">
            {post.title}
          </h2>
          {post.excerptText ? (
            <p className="mt-4 line-clamp-2 text-base leading-relaxed text-muted-foreground">
              {post.excerptText}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-5 text-sm text-muted-foreground">{meta}</p>
          ) : null}
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Les artikkelen
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </div>
      </Link>
    </BlogReveal>
  );
}
