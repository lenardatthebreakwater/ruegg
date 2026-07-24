import { ContainedLayout } from "@/components/layout/contained-layout";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

type PageBreadcrumbsProps = {
  items?: BreadcrumbItem[];
};

export function PageBreadcrumbs({ items }: PageBreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ContainedLayout as="div" className="pt-6 pb-6">
      <Breadcrumb items={items} />
    </ContainedLayout>
  );
}
