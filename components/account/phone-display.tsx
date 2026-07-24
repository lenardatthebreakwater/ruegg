"use client";

import { useEffect, useState } from "react";
import parsePhoneNumberFromString from "libphonenumber-js";
import { hasFlag } from "country-flag-icons";
import {
  flagSvgToDataUri,
  getCachedFlagSvg,
  loadFlagSvg,
} from "@/lib/account/flag-svg";
import { cn } from "@/lib/utils";

/** Default region for numbers stored without a country calling code (Norwegian store). */
const DEFAULT_PHONE_COUNTRY = "NO" as const;

type PhoneDisplayProps = {
  phone: string;
  className?: string;
};

type RemoteFlag = {
  countryCode: string;
  svg: string;
};

/**
 * Display-only phone content: national number with an optional soft
 * country-flag watermark (no sticker flag). AddressBlock owns the Phone badge.
 * No `tel:` link. Never renders emoji flags or bare ISO letters like «NO».
 */
export function PhoneDisplay({ phone, className }: PhoneDisplayProps) {
  const trimmed = phone.trim();
  const parsed =
    parsePhoneNumberFromString(trimmed) ??
    parsePhoneNumberFromString(trimmed, DEFAULT_PHONE_COUNTRY);

  const countryCode = parsed?.country ?? null;
  const cachedSvg =
    countryCode && hasFlag(countryCode)
      ? getCachedFlagSvg(countryCode)
      : null;

  const [remoteFlag, setRemoteFlag] = useState<RemoteFlag | null>(null);

  // External flag SVG chunk load for non-cached countries (NO is sync-cached).
  useEffect(() => {
    if (!countryCode || !hasFlag(countryCode) || getCachedFlagSvg(countryCode)) {
      return;
    }
    let cancelled = false;
    void loadFlagSvg(countryCode).then((svg) => {
      if (cancelled || !svg) return;
      setRemoteFlag({ countryCode, svg });
    });
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  const flagSvg =
    cachedSvg ??
    (remoteFlag?.countryCode === countryCode ? remoteFlag.svg : null);
  const flagSrc = flagSvg ? flagSvgToDataUri(flagSvg) : null;
  const showFlag = flagSrc != null;
  const displayText = showFlag && parsed ? parsed.formatNational() : trimmed;
  const ariaLabel = parsed?.country
    ? parsed.formatInternational()
    : trimmed;
  const isNorway = countryCode === "NO";

  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        "relative isolate flex min-w-0 items-center overflow-hidden rounded-md",
        showFlag && "min-h-7 pr-9 pl-1.5",
        isNorway &&
          "bg-gradient-to-r from-sky-100 via-sky-100/55 via-[68%] to-transparent dark:from-sky-500/[0.16] dark:via-sky-500/[0.07] dark:via-[55%] dark:to-transparent",
        className
      )}
    >
      {showFlag && flagSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- inline SVG data URI; not a remote asset
        <img
          src={flagSrc}
          alt=""
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-0 my-auto h-[130%] w-[4.75rem] select-none object-cover object-left",
            "opacity-[0.24] dark:opacity-[0.22]",
            "[mask-image:linear-gradient(90deg,transparent_0%,black_45%,black_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_45%,black_100%)]"
          )}
        />
      ) : null}
      <span className="relative z-10 min-w-0 text-foreground">{displayText}</span>
    </span>
  );
}
