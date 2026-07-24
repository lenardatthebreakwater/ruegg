"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import {
  useAnimatedIcon,
  type AnimatedIconComponent,
} from "@/components/icons/animated-icon";
import {
  AnimatedBrickWallIcon,
  AnimatedTruckIcon,
  AnimatedWrenchIcon,
} from "@/components/icons/storefront-animated-icons";
import { ContainedLayout } from "@/components/layout/contained-layout";
import type { ReviewSummary } from "@/lib/data/homepage";
import {
  googleBusinessKnowledgePanelUrl,
  siteTopBarQuickLinks,
  type SiteTopBarQuickLinkIcon,
} from "@/lib/data/site-top-bar";
import { cn } from "@/lib/utils";

/** Matches prior Lucide `size-3` (12px) in the utility strip. */
const TOP_BAR_ICON_PROPS = {
  size: 12,
  duration: 0.75,
  className: "shrink-0 text-neutral-400",
  "aria-hidden": true as const,
};

const topBarAnimatedIcons: Record<
  SiteTopBarQuickLinkIcon,
  AnimatedIconComponent
> = {
  truck: AnimatedTruckIcon,
  wrench: AnimatedWrenchIcon,
  brickWall: AnimatedBrickWallIcon,
};

type SiteTopBarProps = {
  reviewSummary: ReviewSummary;
  className?: string;
};

function GoogleMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <span key={i} className="relative inline-flex h-3 w-3 shrink-0">
            <Star className="absolute inset-0 size-3 fill-neutral-600 stroke-transparent" />
            {fill > 0 ? (
              <span
                className="absolute inset-0 overflow-hidden text-start"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="size-3 shrink-0 fill-[#FFD700] stroke-[#FFD700]" />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

type TopBarQuickLinkProps = {
  href: string;
  label: string;
  icon: SiteTopBarQuickLinkIcon;
};

function TopBarQuickLink({ href, label, icon }: TopBarQuickLinkProps) {
  const { ref, triggerProps } = useAnimatedIcon();
  const Icon = topBarAnimatedIcons[icon];
  const shortLabel =
    label === "Hjemlevering" ? "Frakt" : label === "Piperehab" ? "Pipe" : null;

  return (
    <Link
      href={href}
      {...triggerProps}
      className="inline-flex items-center gap-1.5 text-neutral-200 outline-offset-4 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon ref={ref} {...TOP_BAR_ICON_PROPS} />
      {shortLabel ? (
        <>
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </Link>
  );
}

export function SiteTopBar({ reviewSummary, className }: SiteTopBarProps) {
  const { rating, count } = reviewSummary;
  const ratingLabel = rating.toLocaleString("nb-NO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-none rounded-tl-none rounded-tr-none border-b border-white/10 bg-[#1F2226] text-neutral-100 dark:bg-[#1F2226]",
        className,
      )}
    >
      <ContainedLayout className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs">
        <nav aria-label="Snarveier" className="flex flex-wrap items-center gap-x-3 gap-y-1.5 md:gap-x-4">
          {siteTopBarQuickLinks.map(({ href, label, icon }) => (
            <TopBarQuickLink
              key={href}
              href={href}
              label={label}
              icon={icon}
            />
          ))}
        </nav>

        <a
          href={googleBusinessKnowledgePanelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-md py-0.5 text-neutral-200 outline-offset-4 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Google ${ratingLabel} av 5, ${count} anmeldelser (åpnes i ny fane)`}
        >
          <GoogleMarkIcon className="size-3.5 shrink-0" />
          <ReviewStars rating={rating} />
          <span className="whitespace-nowrap font-medium tabular-nums">{ratingLabel}</span>
          {/* Review count omitted below sm to keep one row on ~390px phones. */}
          <span className="hidden whitespace-nowrap text-neutral-400 sm:inline">
            {count} anmeldelser
          </span>
        </a>
      </ContainedLayout>
    </div>
  );
}
