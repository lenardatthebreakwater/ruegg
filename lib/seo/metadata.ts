import type { Metadata } from "next";
import { getSiteBaseUrl, toAbsoluteUrl } from "@/lib/seo/site-url";

export const SITE_NAME = "Rüegg";
export const DEFAULT_SITE_DESCRIPTION =
  "Utforsk peiser, vedovner og tilbehør fra Rüegg. Kontakt oss for personlig veiledning og trygge merkevarer.";
const DEFAULT_SOCIAL_IMAGE_PATH = "/opengraph-image";

type SocialImageInput =
  | string
  | {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  socialImage?: SocialImageInput;
  robots?: Metadata["robots"];
};

export function getMetadataBase(): URL {
  return new URL(getSiteBaseUrl());
}

export function buildCanonical(path: string): string {
  return toAbsoluteUrl(path);
}

function buildSocialImage(image: SocialImageInput | undefined) {
  if (!image) {
    return [{ url: toAbsoluteUrl(DEFAULT_SOCIAL_IMAGE_PATH), alt: SITE_NAME }];
  }

  if (typeof image === "string") {
    return [{ url: toAbsoluteUrl(image), alt: SITE_NAME }];
  }

  return [
    {
      url: toAbsoluteUrl(image.url),
      alt: image.alt ?? SITE_NAME,
      width: image.width,
      height: image.height,
    },
  ];
}

export function buildPageMetadata({
  title,
  description,
  path,
  socialImage,
  robots,
}: BuildPageMetadataInput): Metadata {
  const canonical = buildCanonical(path);
  const images = buildSocialImage(socialImage);

  return {
    title,
    description,
    robots,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "nb_NO",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
