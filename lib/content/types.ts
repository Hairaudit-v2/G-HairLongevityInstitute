import type { ReactNode } from "react";

/** Hub route segments matching public URL structure (v1 — no separate continuity hub). */
export type EditorialHubSlug =
  | "conditions"
  | "blood-markers"
  | "treatments"
  | "hair-loss-causes";

export type EditorialAudience = "patients" | "clinicians" | "both";

/** Editorial format — used for filtering and presentation. */
export type EditorialContentType =
  | "guide"
  | "explainer"
  | "comparison"
  | "interpretation"
  | "faq"
  | "decision";

/** Intended next-step emphasis (primary hero CTA remains “Start My Hair Analysis” per site rules). */
export type EditorialCtaType =
  | "start-assessment"
  | "book-consult"
  | "compare-treatments"
  | "see-hairaudit"
  | "read-more";

export const EDITORIAL_CONTENT_TYPES: readonly EditorialContentType[] = [
  "guide",
  "explainer",
  "comparison",
  "interpretation",
  "faq",
  "decision",
] as const;

export const EDITORIAL_CTA_TYPES: readonly EditorialCtaType[] = [
  "start-assessment",
  "book-consult",
  "compare-treatments",
  "see-hairaudit",
  "read-more",
] as const;

/**
 * Facets for discovery, internal linking, and related-content scoring.
 * Arrays are optional; omit an axis when it does not apply (consumers use `?? []`).
 */
export type EditorialTaxonomy = {
  conditions?: string[];
  markers?: string[];
  symptoms?: string[];
  treatments?: string[];
  tags?: string[];
};

export type EditorialPerson = {
  name: string;
  role: string;
  credentials?: string;
  profilePath?: string;
};

export type EditorialReference = {
  label: string;
  url?: string;
};

export type EditorialFaqItem = {
  question: string;
  answer: string;
};

export type EditorialTocItem = {
  id: string;
  label: string;
};

export type EditorialHeroImage = {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  priority?: boolean;
};

export type EditorialGuideLink = {
  href: string;
  label: string;
  title: string;
  description: string;
};

/** Import type only in consumers — defined in pillarGuides.ts to avoid circular imports here. */
export type EditorialPillarSlug =
  | "hair-longevity"
  | "postpartum-hair-loss"
  | "male-pattern-hair-loss"
  | "androgen-index"
  | "hair-loss-medications";

export type EditorialArticleMeta = {
  slug: string;
  title: string;
  /**
   * Optional `<title>` / Open Graph title override for SERP differentiation (H1 stays `title`).
   * Use sparingly when a pillar guide and an insight article share vocabulary.
   */
  seoTitle?: string;
  /** Optional subtitle shown on the article page header. */
  deck?: string;
  /** SEO / social description. */
  description: string;
  /** Short people-first summary for listings and previews. */
  excerpt: string;
  hub: EditorialHubSlug;
  audience: EditorialAudience;
  contentType: EditorialContentType;
  /** Recommended secondary hero action; does not replace the global primary CTA. */
  ctaType: EditorialCtaType;
  publishedAt: string;
  updatedAt: string;
  reviewedAt: string;
  taxonomy: EditorialTaxonomy;
  authors: EditorialPerson[];
  reviewers: EditorialPerson[];
  toc: EditorialTocItem[];
  faq: EditorialFaqItem[];
  /** Curated internal links (typically 3–5 slugs from the live corpus). */
  relatedSlugs: string[];
  /** Primary public guide pillar for hierarchy and internal linking (one per article). */
  primaryPillar: EditorialPillarSlug;
  /** Optional second guide when two lanes are legitimately relevant; keep sparse. */
  secondaryPillar?: EditorialPillarSlug;
  glossarySlugs?: string[];
  references: EditorialReference[];
  heroImage?: EditorialHeroImage;
  /**
   * Optional patient-facing PDF (served from `public/`). When set, the insight page shows a download CTA.
   */
  pdfHref?: string;
  /** Defaults to a calm “Download PDF”-style label in the UI when omitted. */
  pdfLabel?: string;
  /** Human-readable size for the link line (e.g. “632 KB”); optional. */
  pdfFileSize?: string;
};

export type EditorialArticle = EditorialArticleMeta & {
  Body: () => ReactNode;
};

/** True when at least one facet array is non-empty. */
export function articleHasFacets(t: EditorialTaxonomy): boolean {
  return [t.conditions, t.markers, t.symptoms, t.treatments, t.tags].some((a) => (a?.length ?? 0) > 0);
}
