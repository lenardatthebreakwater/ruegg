import Image from "next/image";
import type { BlogImage } from "@/lib/blog/types";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

type BlogPostFeaturedImageProps = {
  image: BlogImage;
  title: string;
};

export function BlogPostFeaturedImage({
  image,
  title,
}: BlogPostFeaturedImageProps) {
  return (
    <div className={PAGE_SECTION_PY}>
      <ContainedLayout className="max-w-5xl">
        <figure className="relative aspect-[16/9] overflow-hidden rounded-2xl md:aspect-[3/2]">
          <Image
            src={image.url}
            alt={image.alt ?? title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </figure>
      </ContainedLayout>
    </div>
  );
}
