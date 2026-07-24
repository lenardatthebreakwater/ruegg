import { META_RUBRIC_NESTED_CARD_CLASS } from "@/components/editorial";
import { cn } from "@/lib/utils";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? "h-4 w-full"}`}
      aria-hidden
    />
  );
}

export function OrdersListSkeleton() {
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster ordrer...</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            META_RUBRIC_NESTED_CARD_CLASS,
            "flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-3.5"
          )}
        >
          <div className="w-full min-w-0 space-y-1.5">
            <SkeletonBar className="h-4 w-32" />
            <SkeletonBar className="h-3 w-44" />
            <SkeletonBar className="h-7 w-40" />
            <SkeletonBar className="h-5 w-36" />
          </div>
          <SkeletonBar className="h-9 w-28 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div
      className="min-w-0 space-y-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster ordre...</span>
      <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <SkeletonBar className="h-3 w-36" />
            <SkeletonBar className="h-4 w-44" />
          </div>
          <SkeletonBar className="h-8 w-40" />
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonBar className="h-4 w-24" />
        {[0, 1].map((index) => (
          <div key={index} className="flex justify-between gap-4 py-1">
            <div className="flex w-full items-start gap-3">
              <SkeletonBar className="size-14 shrink-0 rounded-md sm:size-16" />
              <div className="w-full space-y-2">
                <SkeletonBar className="h-4 w-40" />
                <SkeletonBar className="h-3 w-20" />
              </div>
            </div>
            <SkeletonBar className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="h-3 w-36" />
          <SkeletonBar className="h-3 w-40" />
          <SkeletonBar className="h-3 w-24" />
        </div>
        <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
          <SkeletonBar className="h-4 w-32" />
          <SkeletonBar className="h-3 w-36" />
          <SkeletonBar className="h-3 w-40" />
          <SkeletonBar className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
