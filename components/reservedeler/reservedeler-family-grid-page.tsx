import { ReservedelerGridSection } from "@/components/reservedeler/reservedeler-grid-section";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { getBrandsForReservedelerFamily } from "@/lib/reservedeler/families";
import { getReservedelerItems } from "@/lib/reservedeler/server-items";

type ReservedelerFamilyGridPageProps = {
  familySlug: string;
  breadcrumbs?: BreadcrumbItem[];
};

export async function ReservedelerFamilyGridPage({
  familySlug,
  breadcrumbs,
}: ReservedelerFamilyGridPageProps) {
  const allItems = await getReservedelerItems();
  const familyBrands = new Set(getBrandsForReservedelerFamily(familySlug));
  const items = allItems.filter(
    (item) => familyBrands.has(item.brandSlug)
  );

  return (
    <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
      <ReservedelerGridSection items={items} />
    </SimpleStaticPageShell>
  );
}
