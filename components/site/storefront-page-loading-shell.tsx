"use client";

import { SiteFooter } from "@/components/footer/site-footer";
import { WarmGlowBackground } from "@/components/homepage/warm-glow-background";
import { SiteHeaderLoading } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

type StorefrontPageLoadingShellProps = {
  children: React.ReactNode;
  footerClassName?: string;
};

/** Loading-state storefront shell with warm glow and non-async header. */
export function StorefrontPageLoadingShell({
  children,
  footerClassName,
}: StorefrontPageLoadingShellProps) {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background">
      <WarmGlowBackground />
      <SiteHeaderLoading />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      <SiteFooter className={cn("relative z-10", footerClassName)} />
    </div>
  );
}
