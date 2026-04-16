import type { Metadata } from "next";
import { absoluteUrl, getMetadataBaseUrl } from "@/lib/seo/site";

const BRAND_SUFFIX = "Hair Longevity Institute™";
const DEFAULT_OG_PATH = "/brand/hli-mark.png";
const DEFAULT_OG_ALT = "Hair Longevity Institute";

export type BuildPageMetadataInput = {
  /** Path only, e.g. `/about` */
  path: string;
  /** Page title without repeating the full brand if unnecessary */
  title: string;
  metaDescription: string;
  /** If true, appends ` | ${BRAND_SUFFIX}` when title does not already include it */
  appendBrand?: boolean;
  ogImage?: string | { url: string; width?: number; height?: number; alt?: string };
  robots?: Metadata["robots"];
  openGraphType?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
  };
};

function normalizeTitle(title: string, appendBrand: boolean): string {
  if (!appendBrand) return title;
  if (title.includes("Hair Longevity Institute")) return title;
  return `${title} | ${BRAND_SUFFIX}`;
}

/**
 * Consistent canonical, Open Graph, and Twitter metadata for public marketing pages.
 * Relies on root `metadataBase` from layout; still sets explicit `alternates.canonical`
 * (path-only URLs resolved with `absoluteUrl` / `getSiteOrigin()` — keep in sync with `NEXT_PUBLIC_SITE_URL` in production).
 */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const canonical = absoluteUrl(path);
  const appendBrand = input.appendBrand !== false;
  const fullTitle = normalizeTitle(input.title, appendBrand);

  const og =
    typeof input.ogImage === "object" && input.ogImage !== null
      ? input.ogImage
      : {
          url: typeof input.ogImage === "string" ? input.ogImage : DEFAULT_OG_PATH,
          width: 512,
          height: 512,
          alt: DEFAULT_OG_ALT,
        };

  const ogImageUrl = og.url.startsWith("http") ? og.url : absoluteUrl(og.url);

  const metadata: Metadata = {
    metadataBase: getMetadataBaseUrl(),
    title: fullTitle,
    description: input.metaDescription,
    alternates: { canonical },
    robots: input.robots,
    openGraph: {
      type: input.openGraphType ?? "website",
      url: canonical,
      siteName: BRAND_SUFFIX,
      title: fullTitle,
      description: input.metaDescription,
      images: [{ url: ogImageUrl, width: og.width, height: og.height, alt: og.alt ?? DEFAULT_OG_ALT }],
      ...(input.openGraphType === "article" && input.article?.publishedTime
        ? { publishedTime: input.article.publishedTime }
        : {}),
      ...(input.openGraphType === "article" && input.article?.modifiedTime
        ? { modifiedTime: input.article.modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.metaDescription,
      images: [ogImageUrl],
    },
  };

  return metadata;
}

export { BRAND_SUFFIX, DEFAULT_OG_PATH };
export { getSiteOrigin } from "@/lib/seo/site";
