import Link from "next/link";
import { Hash, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { FooterMadeByCredit } from "@/components/footer/footer-made-by-credit";
import { RueggWordmark } from "@/components/brand/ruegg-wordmark";
import { SITE_CONTACT } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { href: "/shop/", label: "Våre peiser" },
  { href: "/om-oss/", label: "Om oss" },
  { href: "/kontakt-oss/", label: "Kontakt oss" },
  { href: "/personvern/", label: "Personvern" },
] as const;

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "border-t border-white/10 bg-[#1F2226] py-12 text-neutral-100 dark:bg-[#1F2226] dark:text-neutral-100",
        className,
      )}
    >
      <ContainedLayout as="div">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <section className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <div className="flex min-h-9 items-center">
              <RueggWordmark className="text-neutral-100" />
            </div>
            <p className="max-w-md text-sm text-neutral-400">
              Sveitsisk kvalitet siden 1955. Utforsk peiser, vedovner og peisinnsatser
              fra Rüegg — med personlig veiledning og moderne design.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="flex min-h-9 items-center text-sm font-semibold uppercase tracking-wider text-neutral-100">
              Snarveier
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-neutral-400 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="flex min-h-9 items-center text-sm font-semibold uppercase tracking-wider text-neutral-100">
              Kontakt
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden />
                <span>{SITE_CONTACT.addressDisplay}</span>
              </li>
              <li className="flex items-start gap-3">
                <Hash className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden />
                <span>
                  {SITE_CONTACT.companyLegalName}, {SITE_CONTACT.orgNumberDisplay}
                </span>
              </li>
            </ul>
            <p className="text-sm text-neutral-400">
              Har du spørsmål om peis, montering eller produktvalg? Send oss en melding
              — vi hjelper deg gjerne.
            </p>
            <Button
              asChild
              variant="secondary"
              className="w-fit bg-white/10 text-neutral-100 hover:bg-white/15 hover:text-white"
            >
              <Link href="/kontakt-oss/">
                <Mail className="size-4" aria-hidden />
                Kontakt oss
              </Link>
            </Button>
          </section>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <FooterMadeByCredit />
        </div>
      </ContainedLayout>
    </footer>
  );
}
