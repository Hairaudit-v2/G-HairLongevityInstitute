/**
 * JSON-LD structured data for Hair Longevity Institute.
 * Minimal, truthful schema only. No ratings, reviews, or unsupported claims.
 */

/** Canonical site name for schema. */
const SITE_NAME = "Hair Longevity Institute™";

/** One-line description for WebSite schema (truthful, no keyword stuffing). */
const WEBSITE_DESCRIPTION =
  "Biology-first hair loss analysis and treatment planning. Hormone mapping, blood interpretation, and personalised strategy — delivered globally.";

/**
 * Base URL for absolute schema URLs. Mirrors sitemap/robots/layout logic.
 * Prefer NEXT_PUBLIC_SITE_URL; fallback Vercel URL or production domain.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://hairlongevityinstitute.com";
}

/** Logo path (relative). Used with base URL for absolute logo URL in schema. */
const LOGO_PATH = "/brand/hli-mark.png";

/**
 * Organization schema for Hair Longevity Institute.
 * sameAs omitted: ecosystem partners (HairAudit, Follicle Intelligence, IIOHR) are
 * separate entities; sameAs is for the same entity on other channels (e.g. social).
 */
export function getOrganizationSchema(baseUrl: string): Record<string, unknown> {
  const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: `${url.replace(/\/$/, "")}${LOGO_PATH}`,
  };
}

/**
 * WebSite schema. No SearchAction: site does not offer a meaningful site-search feature.
 */
export function getWebSiteSchema(baseUrl: string): Record<string, unknown> {
  const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  return {
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    description: WEBSITE_DESCRIPTION,
  };
}

/**
 * Combined @graph for a single script tag. Use on root layout for key public pages.
 */
export function getStructuredDataGraph(baseUrl: string): Record<string, unknown>[] {
  return [
    getOrganizationSchema(baseUrl),
    getWebSiteSchema(baseUrl),
  ];
}
