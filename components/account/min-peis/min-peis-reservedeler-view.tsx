import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { MinPeisReservedelerEmpty } from "@/components/account/min-peis/min-peis-reservedeler-empty";
import { MinPeisReservedelerGrid } from "@/components/account/min-peis/min-peis-reservedeler-grid";
import {
  EditorialEyebrow,
  EditorialHeading,
} from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { getMinPeisReservedeler } from "@/lib/account/min-peis-reservedeler";
import { getSessionFromCookies } from "@/lib/auth/session";
import { buildReservedelerItemHref } from "@/lib/products/paths";

type MinPeisReservedelerViewProps = {
  slug: string;
};

export async function MinPeisReservedelerView({
  slug,
}: MinPeisReservedelerViewProps) {
  const cookieStore = await cookies();
  const session = getSessionFromCookies(cookieStore);
  const detailHref = `/min-konto/min-peis/${encodeURIComponent(slug)}/`;

  if (!session?.token) {
    return null;
  }

  let payload: Awaited<ReturnType<typeof getMinPeisReservedeler>> = null;
  try {
    payload = await getMinPeisReservedeler(session.token, slug);
  } catch {
    payload = null;
  }

  if (!payload) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-700" role="alert">
          Fant ikke denne peisen på kontoen din.
        </p>
        <Button asChild variant="outline">
          <Link href="/min-konto/min-peis/">Tilbake til Min peis</Link>
        </Button>
      </div>
    );
  }

  const { fireplace, matchedItem, products, ownedProductSlugs } = payload;
  const hasParts = products.length > 0;
  const storefrontItemHref = matchedItem
    ? buildReservedelerItemHref(matchedItem.brandSlug, matchedItem.itemSlug)
    : null;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={detailHref}>
            <ArrowLeft data-icon="inline-start" />
            Tilbake til peisen
          </Link>
        </Button>
      </div>

      <header className="space-y-2">
        <EditorialEyebrow>Reservedeler</EditorialEyebrow>
        {fireplace.brand ? (
          <p className="text-sm font-medium text-muted-foreground">
            {fireplace.brand}
          </p>
        ) : null}
        <EditorialHeading size="account">{fireplace.name}</EditorialHeading>
        <p className="text-sm text-muted-foreground">
          {hasParts
            ? `Deler som passer til ${fireplace.name}.`
            : `Reservedeler til ${fireplace.name}.`}
        </p>
      </header>

      {hasParts ? (
        <section
          aria-labelledby="min-peis-reservedeler-heading"
          className="space-y-3"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2
              id="min-peis-reservedeler-heading"
              className="text-base font-medium text-foreground"
            >
              {products.length === 1
                ? "1 reservedel"
                : `${products.length} reservedeler`}
            </h2>
            {storefrontItemHref ? (
              <Button asChild variant="link" size="sm" className="h-auto px-0">
                <Link href={storefrontItemHref}>Åpne i reservedeler</Link>
              </Button>
            ) : null}
          </div>
          <MinPeisReservedelerGrid
            products={products}
            ownedProductSlugs={ownedProductSlugs}
          />
        </section>
      ) : (
        <MinPeisReservedelerEmpty
          peisName={fireplace.name}
          storefrontItemHref={storefrontItemHref}
        />
      )}
    </div>
  );
}
