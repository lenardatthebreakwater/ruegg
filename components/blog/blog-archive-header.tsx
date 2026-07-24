import {
  EDITORIAL_HEADER_BAND_CLASS,
  EditorialPageHeaderInner,
} from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { BlogReveal } from "@/components/blog/blog-reveal";

type BlogArchiveHeaderProps = {
  title?: string;
  description?: string;
};

export function BlogArchiveHeader({
  title = "Inspirasjon",
  description = "Guider og råd om peis, ovn og fyring.",
}: BlogArchiveHeaderProps) {
  return (
    <header className={EDITORIAL_HEADER_BAND_CLASS}>
      <ContainedLayout>
        <BlogReveal>
          <EditorialPageHeaderInner title={title} description={description} />
        </BlogReveal>
      </ContainedLayout>
    </header>
  );
}
