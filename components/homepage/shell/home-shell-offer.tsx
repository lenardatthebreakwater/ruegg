import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ShellReveal } from "@/components/homepage/shell/shell-reveal";
import { ShellSectionFrame } from "@/components/homepage/shell/shell-section-frame";
import {
  SHELL_CTA_PRIMARY,
  SHELL_CTA_SECONDARY,
} from "@/components/homepage/shell/shell-cta";

/**
 * Lead / offer band - NOT cart. Request a quote or browse catalog.
 */
export function HomeShellOffer() {
  return (
    <ShellSectionFrame
      id="tilbud"
      title="Be om tilbud"
      description="Fortell oss om prosjektet. Vi kommer tilbake med råd og et uforpliktende tilbud."
      tone="cream"
      align="center"
    >
      <ShellReveal>
        <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className={SHELL_CTA_PRIMARY}>
            <Link href="/kontakt-oss/">Be om tilbud</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className={SHELL_CTA_SECONDARY}
          >
            <Link href="/shop/">Utforsk peiser</Link>
          </Button>
        </div>
      </ShellReveal>
    </ShellSectionFrame>
  );
}
