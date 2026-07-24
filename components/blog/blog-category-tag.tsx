import type { BlogPost } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

type BlogCategoryTagProps = {
  post: BlogPost;
  className?: string;
};

/** Small brand-red category label used on archive cards and article headers. */
export function BlogCategoryTag({ post, className }: BlogCategoryTagProps) {
  const category = post.categories[0];
  if (!category) return null;

  return (
    <span
      className={cn(
        "text-xs font-semibold tracking-[0.14em] text-primary uppercase",
        className
      )}
    >
      {category.name}
    </span>
  );
}
