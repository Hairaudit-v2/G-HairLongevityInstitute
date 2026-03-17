import type { MetadataRoute } from "next";

/**
 * Base URL for sitemap reference. Must match the domain crawlers use (production).
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://hairlongevityinstitute.com";
}

/**
 * Disallow: portal, admin, doctor, longevity dashboard/analytics/intake, audits, test.
 * Public marketing and login pages remain allowed via allow: '/'.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/portal/",
        "/admin/",
        "/doctor/",
        "/longevity/dashboard",
        "/longevity/analytics/",
        "/longevity/intake/",
        "/audits/",
        "/test",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
