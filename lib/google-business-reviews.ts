import { unstable_cache } from "next/cache";
import { cache } from "react";

import {
  SOCIAL_PROOF_CAROUSEL_MIN_RATING,
  socialProofFallbackReviewQuotes,
  socialProofFallbackReviewSummary,
  type ReviewQuote,
  type ReviewSummary,
} from "@/lib/data/homepage";

/** ISR window for live GBP data (Worker has GMB_* even when Linux builds do not). */
const GMB_SOCIAL_PROOF_REVALIDATE_SECONDS = 3600;

type GoogleAccessTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleBusinessReview = {
  reviewId: string;
  starRating?: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime?: string;
  reviewer?: {
    displayName?: string;
    /** Present when the reviewer is not anonymous; see GBP Reviews API. */
    profilePhotoUrl?: string;
    profile_photo_url?: string;
    isAnonymous?: boolean;
  };
};

type GoogleBusinessReviewsResponse = {
  reviews?: GoogleBusinessReview[];
  nextPageToken?: string;
  error?: {
    message?: string;
  };
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function getOriginalComment(fullComment: string | undefined): string {
  if (!fullComment) return "";
  const originalPos = fullComment.indexOf("(Original)");
  if (originalPos === -1) return fullComment.trim();
  return fullComment.slice(originalPos + "(Original)".length).trim();
}

function getNorwegianRelativeTime(
  olderTimestampMs: number,
  nowTimestampMs = Date.now(),
): string {
  const diffSeconds = Math.floor((nowTimestampMs - olderTimestampMs) / 1000);

  if (diffSeconds < 60) return "akkurat nå";
  if (diffSeconds < 60 * 60) {
    const num = Math.floor(diffSeconds / 60);
    return `${num} minutt${num > 1 ? "er" : ""} siden`;
  }
  if (diffSeconds < 60 * 60 * 24) {
    const num = Math.floor(diffSeconds / (60 * 60));
    return `${num} time${num > 1 ? "r" : ""} siden`;
  }
  if (diffSeconds < 60 * 60 * 24 * 2) return "i går";
  if (diffSeconds < 60 * 60 * 24 * 7) {
    const num = Math.floor(diffSeconds / (60 * 60 * 24));
    return `${num} dag${num > 1 ? "er" : ""} siden`;
  }
  if (diffSeconds < 60 * 60 * 24 * 30) {
    const num = Math.floor(diffSeconds / (60 * 60 * 24 * 7));
    return `${num} uke${num > 1 ? "r" : ""} siden`;
  }
  if (diffSeconds < 60 * 60 * 24 * 365) {
    const num = Math.floor(diffSeconds / (60 * 60 * 24 * 30));
    return `${num} måned${num > 1 ? "er" : ""} siden`;
  }
  const num = Math.floor(diffSeconds / (60 * 60 * 24 * 365));
  return `${num} år${num > 1 ? "er" : ""} siden`;
}

function mapStarRating(starRating: GoogleBusinessReview["starRating"]): number {
  const ratingMap: Record<NonNullable<GoogleBusinessReview["starRating"]>, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return starRating ? ratingMap[starRating] : 0;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now) {
    return cachedAccessToken.token;
  }

  const clientId = process.env.GMB_CLIENT_ID;
  const clientSecret = process.env.GMB_CLIENT_SECRET;
  const refreshToken = process.env.GMB_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing GMB OAuth env vars");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Token HTTP ${response.status}`);
  }

  const body = (await response.json()) as GoogleAccessTokenResponse;
  if (!body.access_token) {
    throw new Error(
      body.error_description || body.error || "Unexpected token response from Google",
    );
  }

  const expiresIn = body.expires_in ?? 3600;
  cachedAccessToken = {
    token: body.access_token,
    expiresAt: now + (expiresIn - 60) * 1000,
  };

  return body.access_token;
}

async function getAllGoogleBusinessReviews(): Promise<GoogleBusinessReview[]> {
  const accountId = process.env.GMB_ACCOUNT_ID;
  const locationId = process.env.GMB_LOCATION_ID;

  if (!accountId || !locationId) {
    throw new Error("Missing GMB account/location env vars");
  }

  const accessToken = await getAccessToken();
  const baseUrl = `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews?pageSize=50`;

  const allReviews: GoogleBusinessReview[] = [];
  let pageToken = "";
  let pageCount = 0;
  const maxPages = Number(process.env.GMB_MAX_PAGES ?? "20");

  do {
    const url = pageToken
      ? `${baseUrl}&pageToken=${encodeURIComponent(pageToken)}`
      : baseUrl;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      // Keep homepage snappy while still refreshing regularly.
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) {
      throw new Error(`Reviews HTTP ${response.status}`);
    }

    const body = (await response.json()) as GoogleBusinessReviewsResponse;
    if (body.error) {
      throw new Error(body.error.message || "Google Business Profile API error");
    }

    if (body.reviews?.length) {
      allReviews.push(...body.reviews);
    }

    pageToken = body.nextPageToken ?? "";
    pageCount += 1;
  } while (pageToken && pageCount < maxPages);

  return allReviews;
}

/** Max reviews shown in homepage carousel (newest first). */
const HOMEPAGE_SOCIAL_PROOF_QUOTES = 30;

async function fetchLiveGoogleBusinessSocialProof(): Promise<{
  summary: ReviewSummary;
  quotes: ReviewQuote[];
}> {
  const reviews = await getAllGoogleBusinessReviews();
  const sorted = [...reviews].sort((a, b) => {
    const aTs = a.createTime ? Date.parse(a.createTime) : 0;
    const bTs = b.createTime ? Date.parse(b.createTime) : 0;
    return bTs - aTs;
  });

  const meetsCarouselRating = (r: (typeof sorted)[number]) =>
    mapStarRating(r.starRating) >= SOCIAL_PROOF_CAROUSEL_MIN_RATING;

  const sortedCarouselReviews = sorted.filter(meetsCarouselRating);

  const ratings = sorted.map((r) => mapStarRating(r.starRating)).filter((r) => r > 0);
  const avg = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
  const roundedRating = Number(avg.toFixed(1));

  const quotes: ReviewQuote[] = sortedCarouselReviews
    .slice(0, HOMEPAGE_SOCIAL_PROOF_QUOTES)
    .map((review) => {
      const createdAtMs = review.createTime ? Date.parse(review.createTime) : NaN;
      const reviewer = review.reviewer;
      const anonymous = reviewer?.isAnonymous === true;
      const rawPhoto =
        !anonymous && reviewer
          ? (reviewer.profilePhotoUrl ?? reviewer.profile_photo_url ?? "").trim()
          : "";

      return {
        id: review.reviewId,
        author: reviewer?.displayName || "Anonym",
        rating: mapStarRating(review.starRating),
        text: getOriginalComment(review.comment) || "Ingen kommentar",
        date: Number.isNaN(createdAtMs) ? undefined : getNorwegianRelativeTime(createdAtMs),
        ...(rawPhoto ? { avatarUrl: rawPhoto } : {}),
      };
    });

  return {
    summary: {
      rating: roundedRating,
      count: reviews.length,
      headline: "Oppdaterte Google-anmeldelser fra verifiserte kunder",
    },
    quotes,
  };
}

const getCachedLiveGoogleBusinessSocialProof = unstable_cache(
  fetchLiveGoogleBusinessSocialProof,
  ["gmb-social-proof"],
  {
    revalidate: GMB_SOCIAL_PROOF_REVALIDATE_SECONDS,
    tags: ["gmb-reviews"],
  },
);

/**
 * Live Google Business Profile social proof when `GMB_*` is configured;
 * otherwise the static homepage fallback (no throw — keeps SSG builds quiet).
 */
export async function getGoogleBusinessSocialProof(): Promise<{
  summary: ReviewSummary;
  quotes: ReviewQuote[];
}> {
  if (!isGoogleBusinessProfileConfigured()) {
    return {
      summary: socialProofFallbackReviewSummary,
      quotes: socialProofFallbackReviewQuotes,
    };
  }
  return getCachedLiveGoogleBusinessSocialProof();
}

/**
 * True when all server-side `GMB_*` variables are set so
 * `getGoogleBusinessSocialProof` can call the Google Business Profile API.
 * If false, the app uses `socialProofFallbackReview*` from `lib/data/homepage`.
 */
export function isGoogleBusinessProfileConfigured(): boolean {
  return (
    Boolean(process.env.GMB_CLIENT_ID) &&
    Boolean(process.env.GMB_CLIENT_SECRET) &&
    Boolean(process.env.GMB_REFRESH_TOKEN) &&
    Boolean(process.env.GMB_ACCOUNT_ID) &&
    Boolean(process.env.GMB_LOCATION_ID)
  );
}

/** Dedupes GMB work when multiple Server Components request social proof in the same render (e.g. homepage + header). */
export const getCachedGoogleBusinessSocialProof = cache(getGoogleBusinessSocialProof);
