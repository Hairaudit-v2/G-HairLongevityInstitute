import type { MetadataRoute } from "next";
import { isLongevityEnabled } from "@/lib/features";
import { getAllSlugs } from "@/lib/content/index";
import { GLOSSARY, glossaryPath } from "@/lib/content/glossary";
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

  const entries: MetadataRoute.Sitemap = STATIC_PUBLIC_PATHS.map((e) => ({
    url: `${base}${e.path}`,
    lastModified: now,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));

  if (isLongevityEnabled()) {
    entries.push(
      {
        url: `${base}/longevity`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.9,
      },
      {
        url: `${base}/longevity/start`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.95,
      }
    );
  }

  for (const slug of getAllSlugs()) {
    entries.push({
      url: `${base}/insights/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const g of GLOSSARY) {
    entries.push({
      url: `${base}${glossaryPath(g.slug)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    });
  }

  return entries;
}
