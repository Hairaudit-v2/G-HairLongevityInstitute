import type { MetadataRoute } from "next";
import { isLongevityEnabled } from "@/lib/features";
import { getAllSlugs } from "@/lib/content/index";
import { GLOSSARY, glossaryPath } from "@/lib/content/glossary";
import { FEATURED_HLI_GUIDES } from "@/lib/guides/hliDownloadableGuides";
import { getSiteOrigin } from "@/lib/seo/site";

const STATIC_PUBLIC_PATHS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.9 },
  { path: "/science", changeFrequency: "monthly", priority: 0.9 },
  { path: "/for-professionals", changeFrequency: "monthly", priority: 0.9 },
  { path: "/book", changeFrequency: "monthly", priority: 0.9 },
  { path: "/membership", changeFrequency: "monthly", priority: 0.85 },
  { path: "/start", changeFrequency: "monthly", priority: 0.95 },
  { path: "/insights", changeFrequency: "weekly", priority: 0.95 },
  { path: "/guides", changeFrequency: "weekly", priority: 0.95 },
  { path: "/conditions", changeFrequency: "weekly", priority: 0.85 },
  { path: "/blood-markers", changeFrequency: "weekly", priority: 0.9 },
  { path: "/treatments", changeFrequency: "weekly", priority: 0.85 },
  { path: "/hair-loss-causes", changeFrequency: "weekly", priority: 0.9 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.5 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const now = new Date();
  const seen = new Set<string>();

  const entries: MetadataRoute.Sitemap = [];

  function pushEntry(
    path: string,
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"],
    priority: number
  ) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}${normalizedPath}`;
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({
      url,
      lastModified: now,
      changeFrequency,
      priority,
    });
  }

  for (const e of STATIC_PUBLIC_PATHS) {
    pushEntry(e.path, e.changeFrequency, e.priority);
  }

  for (const guide of FEATURED_HLI_GUIDES) {
    if (guide.href?.startsWith("/guides/")) {
      pushEntry(guide.href, "monthly", guide.id === "hair-longevity-foundational" ? 0.92 : 0.82);
    }
  }

  if (isLongevityEnabled()) {
    pushEntry("/longevity", "monthly", 0.9);
    pushEntry("/longevity/start", "monthly", 0.95);
  }

  for (const slug of getAllSlugs()) {
    pushEntry(`/insights/${slug}`, "monthly", 0.8);
  }

  for (const g of GLOSSARY) {
    pushEntry(glossaryPath(g.slug), "monthly", 0.55);
  }

  return entries;
}
