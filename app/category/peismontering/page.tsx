import type { Metadata } from "next";
import Link from "next/link";
import { EditorialAccentPill } from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SectionIntro } from "@/components/section-intro";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildLokalmonteringMeta,
  buildLokalmonteringPublicPath,
} from "@/lib/content-mapping/local-montering-post-mapper";
import { getPeismonteringPosts } from "@/lib/graphql/server-posts";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export const revalidate = 600;

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Peismontering i ditt område",
    description:
      "Finn lokal peismontering i ditt område. Se informasjon om prosess, priser og hvordan du får uforpliktende tilbud.",
    path: "/category/peismontering/",
  });
}

export default async function CategoryPeismonteringPage() {
  const posts = await getPeismonteringPosts();
  const breadcrumbs = [
    { label: "Hjem", href: "/" },
    { label: "Peismontering" },
  ];

  return (
    <>
      <JsonLdScript
        data={buildBreadcrumbSchema(breadcrumbs, "/category/peismontering/")}
      />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <section
          className={`border-b border-border bg-gradient-to-b from-primary/[0.05] to-transparent ${PAGE_SECTION_PY}`}
        >
          <ContainedLayout as="div" className="flex flex-col gap-8">
            <div>
              <EditorialAccentPill />
              <SectionIntro
                heading="h1"
                size="hero"
                title="Peismontering i ditt område"
                description="Velg området ditt for å lese om hvordan vi jobber lokalt med montering, tilbud og vanlige spørsmål."
                align="left"
                className="pt-0 pb-0"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const meta = buildLokalmonteringMeta(post);
                const path = buildLokalmonteringPublicPath(post.slug);
                return (
                  <Card
                    key={post.id}
                    className="border border-border bg-card shadow-xs ring-1 ring-foreground/5 dark:ring-border"
                  >
                    <CardHeader>
                      <CardTitle className="font-display text-lg font-semibold tracking-tight">
                        {meta.place}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {meta.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="redOutline" className="w-full">
                        <Link href={path}>Se lokal side</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </ContainedLayout>
        </section>
      </SimpleStaticPageShell>
    </>
  );
}
