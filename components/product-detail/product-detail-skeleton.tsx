import { ContainedLayout } from "@/components/layout/contained-layout";

export function ProductDetailSkeleton() {
  return (
    <div className="py-10">
      <ContainedLayout className="flex flex-col gap-6">
        <div className="h-5 w-64 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
          <div className="flex flex-col gap-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </ContainedLayout>
    </div>
  );
}
