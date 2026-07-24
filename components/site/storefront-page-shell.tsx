import { SiteFooter } from "@/components/footer/site-footer";
import { WarmGlowBackground } from "@/components/homepage/warm-glow-background";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

type StorefrontPageShellProps = {
  children: React.ReactNode;
  footerClassName?: string;
  header?: React.ReactNode;
};

/** Shared storefront canvas: warm glow + header/footer stacking used across the site. */
export function StorefrontPageShell({
  children,
  footerClassName,
  header,
}: StorefrontPageShellProps) {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background">
      <WarmGlowBackground />
      {header ?? <SiteHeader />}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      <SiteFooter className={cn("relative z-10", footerClassName)} />
    </div>
  );
}
