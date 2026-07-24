import Image from "next/image";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

type BlogPostGalleryProps = {
  urls: string[];
  title: string;
};

export function BlogPostGallery({ urls, title }: BlogPostGalleryProps) {
  if (urls.length === 0) return null;

  const [first, ...rest] = urls;

  return (
    <section className={`border-t border-border ${PAGE_SECTION_PY}`}>
      <ContainedLayout className="max-w-5xl">
        <h2 className="font-display mb-8 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Galleri
        </h2>
        <div className="grid gap-4 md:grid-cols-12 md:gap-6">
          {first ? (
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl md:col-span-5 md:row-span-2 md:aspect-auto md:min-h-[28rem]">
              <Image
                src={first}
                alt={`${title}, bilde 1`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          ) : null}
          <div className="grid gap-4 md:col-span-7">
            {rest.slice(0, 4).map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <Image
                  src={url}
                  alt={`${title}, bilde ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </ContainedLayout>
    </section>
  );
}
