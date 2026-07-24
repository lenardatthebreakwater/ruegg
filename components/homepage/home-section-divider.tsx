import { ContainedLayout } from "@/components/layout/contained-layout";
import { Separator } from "@/components/ui/separator";

/** Horizontal rule aligned with the page content max width. */
export function HomeSectionDivider() {
  return (
    <div aria-hidden className="py-5 sm:py-6">
      <ContainedLayout as="div">
        <Separator />
      </ContainedLayout>
    </div>
  );
}
