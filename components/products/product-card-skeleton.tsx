import { cn } from "@/lib/utils";

type ProductCardSkeletonProps = {
  className?: string;
};

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-lg border border-border bg-white overflow-hidden shadow-sm dark:bg-card",
        className
      )}
    >
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-auto h-9 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </article>
  );
}
