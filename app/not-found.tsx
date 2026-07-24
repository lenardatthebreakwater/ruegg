import { NotFoundTracker } from "@/components/analytics/not-found-tracker";
import ErrorPage02 from "@/components/shadcn-studio/blocks/error-page-02/error-page-02";

export default function NotFound() {
  return (
    <>
      <NotFoundTracker />
      <ErrorPage02
        title="Siden finnes ikke"
        description="Beklager, siden du leter etter finnes ikke lenger eller er flyttet."
        primaryLabel="Til forsiden"
        primaryHref="/"
        secondaryLabel="Se alle produkter"
        secondaryHref="/shop/"
      />
    </>
  );
}
