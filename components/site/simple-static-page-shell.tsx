import { PageBreadcrumbs } from "@/components/site/page-breadcrumbs";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";

type SimpleStaticPageShellProps = {
  children?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  footerClassName?: string;
};

export function SimpleStaticPageShell({
  children,
  breadcrumbs,
  footerClassName,
}: SimpleStaticPageShellProps) {
  return (
    <StorefrontPageShell footerClassName={footerClassName}>
      <PageBreadcrumbs items={breadcrumbs} />
      <main className="flex flex-1 flex-col">{children}</main>
    </StorefrontPageShell>
  );
}
