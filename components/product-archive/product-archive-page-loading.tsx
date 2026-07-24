import { ProductArchiveSkeleton } from "@/components/product-archive/product-archive-skeleton";
import { StorefrontPageLoadingShell } from "@/components/site/storefront-page-loading-shell";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";

type ProductArchivePageLoadingProps = {
  title?: string;
  subtitle?: string;
  /** Overrides default Hjem &gt; Produkter when provided */
  breadcrumbs?: BreadcrumbItem[];
  /** Pulsing hero and brødsmulesti instead of static title (e.g. Suspense fallback) */
  heroPlaceholder?: boolean;
};

const DEFAULT_BREADCRUMBS: BreadcrumbItem[] = [
  { href: "/", label: "Hjem" },
  { label: "Produkter" },
];

export function ProductArchivePageLoading({
  title = "Produkter",
  subtitle = "Utforsk vårt utvalg av peiser og tilbehør",
  breadcrumbs = DEFAULT_BREADCRUMBS,
  heroPlaceholder = false,
}: ProductArchivePageLoadingProps) {
  return (
    <StorefrontPageLoadingShell>
      <ProductArchiveSkeleton
        heroPlaceholder={heroPlaceholder}
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
      />
    </StorefrontPageLoadingShell>
  );
}
