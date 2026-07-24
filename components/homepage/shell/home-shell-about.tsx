import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ShellReveal } from "@/components/homepage/shell/shell-reveal";
import { ShellSectionFrame } from "@/components/homepage/shell/shell-section-frame";
import {
  SHELL_CTA_PRIMARY,
  SHELL_CTA_SECONDARY,
} from "@/components/homepage/shell/shell-cta";

const HERITAGE_IMAGE = "/images/homepage/shell/about-heritage.jpg";

/** Short heritage band - Om Rüegg. */
export function HomeShellAbout() {
  return (
    <ShellSectionFrame
      id="om-ruegg"
      title="Sveitsisk ild, norsk hjem"
      description="Rüegg har laget peiser siden 1955. På ruegg.no møter du samme håndverk, med råd tilpasset norske boliger og arkitekter."
    >
      <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
        <ShellReveal>
          <div className="max-w-[55ch]">
            <p className="text-base leading-relaxed text-[color:var(--ruegg-swiss-muted)]">
              Vi bygger den norske opplevelsen rundt katalog og rådgivning.
              Utforsk modeller, still spørsmål, og be om tilbud når du er klar.
              Ingen handlekurv. Bare ærlig veiledning før du bestemmer deg.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className={SHELL_CTA_PRIMARY}>
                <Link href="/om-oss/">Les mer om oss</Link>
              </Button>
              <Button asChild variant="outline" className={SHELL_CTA_SECONDARY}>
                <Link href="/kontakt-oss/">Be om tilbud</Link>
              </Button>
            </div>
          </div>
        </ShellReveal>
        <ShellReveal delay={0.1} offset={32}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[color:var(--ruegg-swiss-cream)]">
            <Image
              src={HERITAGE_IMAGE}
              alt="Rüegg peis i et rolig, materialrikt interiør"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </ShellReveal>
      </div>
    </ShellSectionFrame>
  );
}
