"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { EDITORIAL_EVENT } from "@/lib/analytics/editorialEvents";

export default function GlossaryViewTracker({ slug, term }: { slug: string; term: string }) {
  useEffect(() => {
    track(EDITORIAL_EVENT.GLOSSARY_TERM_VIEW, { slug, term: term.slice(0, 80) });
  }, [slug, term]);
  return null;
}
