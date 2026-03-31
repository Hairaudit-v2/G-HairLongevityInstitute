import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo/site";

/**
 * Crawling policy (pair with per-route `metadata.robots` where needed):
 *
 * - **Indexable:** public marketing, insights, hubs, glossary, legal pages listed in `sitemap.ts`.
 *   Canonical URLs come from `NEXT_PUBLIC_SITE_URL` / `getSiteOrigin()` so previews stay off duplicate hosts.
 *
 * - **Non-indexable:** `metadata.robots: noindex` on login, longevity dashboard/analytics, 404-like editorial
 *   slugs; `robots.txt` disallow for `/portal/`, `/api/`, `/login/`, private longevity paths, etc.
 *
 * Login URLs are disallow’d here; still set noindex on those pages so mirrors that ignore robots.txt do not surface them.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/portal/",
        "/admin/",
        "/doctor/",
        "/login/",
        "/api/",
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
