import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ServiceLandingPage } from "@/components/service-pages";
import {
  buildLokalmonteringMeta,
  buildLokalmonteringPublicPath,
  mapLocalMonteringPostToServicePageData,
} from "@/lib/content-mapping/local-montering-post-mapper";
import { getPeismonteringPostBySlug } from "@/lib/graphql/server-posts";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo/schema";

export const revalidate = 600;

/**
 * On-demand ISR: these pages are served via the /peismontering-i-:place
 * rewrites and are rendered on first visit, then cached as static HTML.
 * Without this the route is fully dynamic (re-rendered per request).
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

type LokalmonteringPageProps = {
  params: Promise<{ slug: string }>;
};

function buildLocalBreadcrumbs(place: string) {
  return [
    { label: "Hjem", href: "/" },
    { label: "Peismontering", href: "/category/peismontering/" },
    { label: place },
  ];
}

export async function generateMetadata({
  params,
}: LokalmonteringPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPeismonteringPostBySlug(slug);

  if (!post) {
    const decodedSlug = decodeURIComponent(slug);
    return buildPageMetadata({
      title: "Lokal montering ikke funnet",
      description: "Siden du leter etter finnes ikke.",
      path: buildLokalmonteringPublicPath(decodedSlug),
    });
  }

  const meta = buildLokalmonteringMeta(post);
  return buildPageMetadata({
    title: meta.title,
    description: meta.description,
    path: buildLokalmonteringPublicPath(post.slug),
  });
}

export default async function LokalmonteringPage({
  params,
}: LokalmonteringPageProps) {
  const { slug } = await params;
  const post = await getPeismonteringPostBySlug(slug);
  if (!post) notFound();

  const meta = buildLokalmonteringMeta(post);
  const pageData = mapLocalMonteringPostToServicePageData(post);
  const pagePath = buildLokalmonteringPublicPath(post.slug);
  const breadcrumbs = buildLocalBreadcrumbs(meta.place);

  return (
    <>
      <JsonLdScript data={buildBreadcrumbSchema(breadcrumbs, pagePath)} />
      <JsonLdScript data={buildFaqSchema(pageData.faqItems)} />
      <ServiceLandingPage data={pageData} breadcrumbs={breadcrumbs} />
    </>
  );
}
