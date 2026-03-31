/**
 * Single source for public site origin and metadata base URL.
 * Prefer NEXT_PUBLIC_SITE_URL in production so canonicals and OG URLs stay on the primary domain.
 */

export function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://hairlongevityinstitute.com";
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
