export function SearchPopupSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-52 animate-pulse rounded bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded bg-muted" />
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={`search-skeleton-${index}`} className="flex">
            <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3">
              <div className="size-16 animate-pulse rounded-md bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
