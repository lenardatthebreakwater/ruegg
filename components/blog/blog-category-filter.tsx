import {
  BLOG_CATEGORY_LABELS,
  BLOG_CATEGORY_SLUGS,
  type BlogCategorySlug,
} from "@/lib/blog/constants";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { cn } from "@/lib/utils";
import Link from "next/link";

type BlogCategoryFilterProps = {
  active?: BlogCategorySlug | null;
  className?: string;
};

export function BlogCategoryFilter({
  active = null,
  className,
}: BlogCategoryFilterProps) {
  return (
    <ContainedLayout className={cn("pt-8", className)}>
      <nav aria-label="Filtrer artikler" className="flex flex-wrap gap-2">
        <FilterChip href="/blog/" label="Alle" active={!active} />
        {BLOG_CATEGORY_SLUGS.map((slug) => (
          <FilterChip
            key={slug}
            href={`/blog/?kategori=${slug}`}
            label={BLOG_CATEGORY_LABELS[slug]}
            active={active === slug}
          />
        ))}
      </nav>
    </ContainedLayout>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[0px_4px_10px_rgba(187,0,19,0.22)]"
          : "border-border bg-background text-muted-foreground hover:border-primary/35 hover:bg-primary/[0.04] hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
