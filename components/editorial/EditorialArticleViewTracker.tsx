"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { EDITORIAL_EVENT } from "@/lib/analytics/editorialEvents";

export default function EditorialArticleViewTracker({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    track(EDITORIAL_EVENT.ARTICLE_VIEW, { slug, title: title.slice(0, 120) });
  }, [slug, title]);
  return null;
}
