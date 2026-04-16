import type { EditorialArticle, EditorialCtaType } from "@/lib/content/types";
import { articleHasFacets } from "@/lib/content/types";
import { GLOSSARY } from "@/lib/content/glossary";
import { EDITORIAL_BODY_SECTION_IDS } from "@/lib/content/seed/bodySectionIds";
import { EDITORIAL_PILLAR_SLUGS } from "@/lib/content/pillarGuides";

export type EditorialIssueSeverity = "error" | "warning";

export type EditorialIssue = {
  severity: EditorialIssueSeverity;
  slug?: string;
  code: string;
  message: string;
};

export type EditorialHealthSummary = {
  articleCount: number;
  missingHeroImages: string[];
  missingReviewers: string[];
  /** All references lack URLs (pending citations). */
  placeholderReferencesOnly: string[];
  invalidRelatedLinks: { slug: string; bad: string[] }[];
  /** v1 model has no seoTitle; duplicate page titles. */
  duplicateTitles: string[][];
  duplicateDescriptions: string[][];
  taxonomyFingerprintsToReview: { fingerprint: string; slugs: string[] }[];
  sharedTagsTop: { tag: string; count: number; slugs: string[] }[];
};

export type EditorialValidationResult = {
  issues: EditorialIssue[];
  health: EditorialHealthSummary;
  ok: boolean;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(d: string): boolean {
  if (!ISO_DATE.test(d)) return false;
  const t = Date.parse(`${d}T12:00:00.000Z`);
  return !Number.isNaN(t);
}

/** Secondary hero control label (primary is always Start My Hair Analysis). */
export function getExpectedSecondaryCtaLabel(ctaType: EditorialCtaType): string {
  switch (ctaType) {
    case "start-assessment":
    case "book-consult":
      return "Book consultation";
    case "compare-treatments":
      return "Treatment themes";
    case "see-hairaudit":
      return "Visit HairAudit";
    case "read-more":
      return "Browse insights";
    default:
      return "";
  }
}

function tocMatchesBodyOrder(tocIds: string[], bodyIds: readonly string[] | undefined): boolean {
  if (!bodyIds || tocIds.length !== bodyIds.length) return false;
  return tocIds.every((id, i) => id === bodyIds[i]);
}

/**
 * Content-governance checks for the code-based editorial corpus.
 * Safe to run in dev, CI, or scripts; does not mutate data.
 */
export function validateEditorialCorpus(articles: EditorialArticle[]): EditorialValidationResult {
  const issues: EditorialIssue[] = [];
  const allSlugs = new Set(articles.map((a) => a.slug));
  const slugCounts = new Map<string, number>();
  for (const a of articles) {
    slugCounts.set(a.slug, (slugCounts.get(a.slug) ?? 0) + 1);
  }
  for (const [slug, n] of slugCounts) {
    if (n > 1) {
      issues.push({ severity: "error", slug, code: "DUPLICATE_SLUG", message: `Duplicate slug (${n}x): ${slug}` });
    }
  }

  const missingHeroImages: string[] = [];
  const missingReviewers: string[] = [];
  const placeholderRefs: string[] = [];
  const invalidRelated: { slug: string; bad: string[] }[] = [];

  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();
  const fingerprintMap = new Map<string, string[]>();
  const tagUsage = new Map<string, string[]>();

  const glossarySet = new Set(GLOSSARY.map((g) => g.slug));
  const pillarSet = new Set<string>(EDITORIAL_PILLAR_SLUGS);

  for (const a of articles) {
    if (!a.slug?.trim()) {
      issues.push({ severity: "error", code: "EMPTY_SLUG", message: "Article missing slug" });
      continue;
    }

    for (const field of ["title", "description", "excerpt"] as const) {
      const v = a[field]?.trim() ?? "";
      if (!v) {
        issues.push({
          severity: "error",
          slug: a.slug,
          code: `EMPTY_${field.toUpperCase()}`,
          message: `Empty ${field}`,
        });
      }
    }

    if (!a.authors?.length) {
      issues.push({ severity: "error", slug: a.slug, code: "NO_AUTHORS", message: "No authors" });
    }
    if (!a.reviewers?.length) {
      issues.push({ severity: "error", slug: a.slug, code: "NO_REVIEWERS", message: "No reviewers" });
      missingReviewers.push(a.slug);
    }

    if (!a.toc?.length) {
      issues.push({ severity: "error", slug: a.slug, code: "EMPTY_TOC", message: "Empty TOC" });
    }
    if (!a.faq?.length) {
      issues.push({ severity: "error", slug: a.slug, code: "EMPTY_FAQ", message: "Empty FAQ" });
    }
    for (let i = 0; i < (a.faq?.length ?? 0); i++) {
      const item = a.faq[i];
      if (!item.question?.trim() || !item.answer?.trim()) {
        issues.push({
          severity: "error",
          slug: a.slug,
          code: "FAQ_EMPTY",
          message: `FAQ item ${i + 1} has empty question or answer`,
        });
      }
    }

    if (!a.references?.length) {
      issues.push({ severity: "error", slug: a.slug, code: "EMPTY_REFERENCES", message: "No references" });
    }
    for (let i = 0; i < (a.references?.length ?? 0); i++) {
      const r = a.references[i];
      if (!r.label?.trim()) {
        issues.push({
          severity: "error",
          slug: a.slug,
          code: "REF_EMPTY_LABEL",
          message: `Reference ${i + 1} has empty label`,
        });
      }
    }
    const allRefsPending = (a.references ?? []).length > 0 && (a.references ?? []).every((r) => !r.url);
    if (allRefsPending) {
      placeholderRefs.push(a.slug);
    }

    if (!a.relatedSlugs?.length) {
      issues.push({ severity: "error", slug: a.slug, code: "EMPTY_RELATED", message: "relatedSlugs empty" });
    }

    const badRelated: string[] = [];
    for (const r of a.relatedSlugs ?? []) {
      if (r === a.slug) badRelated.push(`${r} (self)`);
      else if (!allSlugs.has(r)) badRelated.push(`${r} (missing)`);
    }
    if (badRelated.length) {
      invalidRelated.push({ slug: a.slug, bad: badRelated });
      issues.push({
        severity: "error",
        slug: a.slug,
        code: "INVALID_RELATED",
        message: `Invalid relatedSlugs: ${badRelated.join(", ")}`,
      });
    }

    if (!a.primaryPillar || !pillarSet.has(a.primaryPillar)) {
      issues.push({
        severity: "error",
        slug: a.slug,
        code: "BAD_PRIMARY_PILLAR",
        message: "primaryPillar must be set to a valid public guide pillar",
      });
    }
    if (a.secondaryPillar) {
      if (!pillarSet.has(a.secondaryPillar)) {
        issues.push({
          severity: "error",
          slug: a.slug,
          code: "BAD_SECONDARY_PILLAR",
          message: "secondaryPillar must be a valid public guide pillar when set",
        });
      } else if (a.secondaryPillar === a.primaryPillar) {
        issues.push({
          severity: "error",
          slug: a.slug,
          code: "PILLAR_DUPLICATE",
          message: "secondaryPillar must differ from primaryPillar",
        });
      }
    }

    for (const d of [a.publishedAt, a.updatedAt, a.reviewedAt]) {
      if (!isValidIsoDate(d)) {
        issues.push({
          severity: "error",
          slug: a.slug,
          code: "BAD_DATE",
          message: `Invalid ISO date (expected YYYY-MM-DD): ${d}`,
        });
      }
    }

    if (a.publishedAt && a.updatedAt && a.publishedAt > a.updatedAt) {
      issues.push({
        severity: "warning",
        slug: a.slug,
        code: "DATE_ORDER",
        message: "publishedAt is after updatedAt",
      });
    }

    if (!articleHasFacets(a.taxonomy)) {
      issues.push({
        severity: "error",
        slug: a.slug,
        code: "NO_FACETS",
        message: "No taxonomy facets beyond hub",
      });
    }

    const bodyIds = EDITORIAL_BODY_SECTION_IDS[a.slug];
    const tocIds = a.toc.map((t) => t.id);
    if (!bodyIds) {
      issues.push({
        severity: "warning",
        slug: a.slug,
        code: "BODY_IDS_MAP",
        message: "No EDITORIAL_BODY_SECTION_IDS entry — add to bodySectionIds.ts",
      });
    } else if (!tocMatchesBodyOrder(tocIds, bodyIds)) {
      issues.push({
        severity: "error",
        slug: a.slug,
        code: "TOC_BODY_MISMATCH",
        message: `TOC ids/order must match bodySectionIds.ts. TOC: [${tocIds.join(", ")}] | Body: [${[...bodyIds].join(", ")}]`,
      });
    }

    for (const g of a.glossarySlugs ?? []) {
      if (!glossarySet.has(g)) {
        issues.push({
          severity: "warning",
          slug: a.slug,
          code: "GLOSSARY_SLUG",
          message: `glossarySlugs references missing term: ${g}`,
        });
      }
    }

    if (typeof a.Body !== "function") {
      issues.push({ severity: "error", slug: a.slug, code: "NO_BODY", message: "Body is not a function" });
    }

    if (!a.heroImage) {
      missingHeroImages.push(a.slug);
    }

    const tKey = a.title.trim().toLowerCase();
    titleMap.set(tKey, [...(titleMap.get(tKey) ?? []), a.slug]);
    const dKey = a.description.trim().toLowerCase();
    descMap.set(dKey, [...(descMap.get(dKey) ?? []), a.slug]);

    const fp = [
      [...(a.taxonomy.conditions ?? [])].sort().join("|"),
      [...(a.taxonomy.markers ?? [])].sort().join("|"),
      [...(a.taxonomy.symptoms ?? [])].sort().join("|"),
      [...(a.taxonomy.treatments ?? [])].sort().join("|"),
      [...(a.taxonomy.tags ?? [])].sort().join("|"),
    ].join("::");
    fingerprintMap.set(fp, [...(fingerprintMap.get(fp) ?? []), a.slug]);

    for (const tag of a.taxonomy.tags ?? []) {
      tagUsage.set(tag, [...(tagUsage.get(tag) ?? []), a.slug]);
    }
  }

  const duplicateTitles = [...titleMap.values()].filter((s) => s.length > 1);
  const duplicateDescriptions = [...descMap.values()].filter((s) => s.length > 1);
  const taxonomyFingerprintsToReview = [...fingerprintMap.entries()]
    .filter(([, s]) => s.length > 1)
    .map(([fingerprint, slugs]) => ({ fingerprint, slugs }));

  const sharedTagsTop = [...tagUsage.entries()]
    .filter(([, s]) => s.length > 1)
    .map(([tag, slugs]) => ({ tag, count: slugs.length, slugs }))
    .sort((x, y) => y.count - x.count);

  const errors = issues.filter((i) => i.severity === "error");
  const health: EditorialHealthSummary = {
    articleCount: articles.length,
    missingHeroImages,
    missingReviewers,
    placeholderReferencesOnly: placeholderRefs,
    invalidRelatedLinks: invalidRelated,
    duplicateTitles,
    duplicateDescriptions,
    taxonomyFingerprintsToReview,
    sharedTagsTop,
  };

  return { issues, health, ok: errors.length === 0 };
}
