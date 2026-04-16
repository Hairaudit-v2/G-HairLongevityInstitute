/**
 * Single source for public site origin and metadata base URL.
 * Production and preview builds should always resolve to the primary domain unless an explicit override is set.
 */

const PRODUCTION_SITE_ORIGIN = "https://hairlongevityinstitute.com";

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, "");
}

export function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.NODE_ENV === "development") {
    if (process.env.VERCEL_URL) {
      return normalizeOrigin(`https://${process.env.VERCEL_URL}`);
    }
    return "http://localhost:3000";
  }
  return PRODUCTION_SITE_ORIGIN;
}

/** Next.js `metadataBase` expects a URL with protocol. */
export function getMetadataBaseUrl(): URL {
  const o = getSiteOrigin();
  return new URL(o.startsWith("http") ? o : `https://${o}`);
}

export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin.replace(/\/$/, "")}${p}`;
}

/**
 * Origin for `sitemap.xml` and `robots.txt` sitemap directive.
 * Prefer `NEXT_PUBLIC_SITE_URL` in production; otherwise the public marketing domain — avoids
 * emitting preview/staging hostnames as indexable URLs when the env var is unset.
 */
export function getSitemapSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  }
  return PRODUCTION_SITE_ORIGIN;
}
