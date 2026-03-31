import type { EditorialArticle, EditorialContentType, EditorialHubSlug } from "@/lib/content/types";
import { EDITORIAL_ARTICLES } from "@/lib/content/articlesData";

export * from "@/lib/content/types";
export * from "@/lib/content/taxonomy";
export * from "@/lib/content/glossary";
export {
  EDITORIAL_CONTENT_GAPS_9_15,
  EDITORIAL_PUBLISH_ORDER_V1,
  EDITORIAL_RELATED_MAP_V1,
} from "@/lib/content/editorialPublishingPlan";
export {
  getExpectedSecondaryCtaLabel,
  validateEditorialCorpus,
  type EditorialHealthSummary,
  type EditorialIssue,
  type EditorialValidationResult,
} from "@/lib/content/validateEditorial";
export { EDITORIAL_ARTICLES } from "@/lib/content/articlesData";

export function getAllArticles(): EditorialArticle[] {
  return [...EDITORIAL_ARTICLES];
}

export function getArticleBySlug(slug: string): EditorialArticle | undefined {
  return EDITORIAL_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByHub(hub: EditorialHubSlug): EditorialArticle[] {
  return EDITORIAL_ARTICLES.filter((a) => a.hub === hub);
}

export type ContentSort = "newest" | "relevance";

export type ContentSearchFilters = {
  q?: string;
  hub?: EditorialHubSlug | "all";
  audience?: "all" | EditorialArticle["audience"];
  contentType?: "all" | EditorialContentType;
  topic?: string;
};

/** Weights for automated related picks (after curated `relatedSlugs`). */
const RELATED_WEIGHTS = {
  sameHub: 4,
  condition: 5,
  marker: 5,
  symptom: 3,
  treatment: 3,
  tag: 2,
} as const;

function scoreArticle(a: EditorialArticle, q: string): number {
  const lower = q.trim().toLowerCase();
  if (!lower) return 0;
  let score = 0;
  const hay =
    `${a.title} ${a.description} ${a.excerpt} ${a.deck ?? ""} ${a.contentType} ${(a.taxonomy.tags ?? []).join(" ")}`.toLowerCase();
  if (a.title.toLowerCase().includes(lower)) score += 10;
  if (hay.includes(lower)) score += 5;
  for (const t of a.taxonomy.tags ?? []) {
    if (t.includes(lower)) score += 2;
  }
  for (const arr of [
    a.taxonomy.conditions ?? [],
    a.taxonomy.markers ?? [],
    a.taxonomy.symptoms ?? [],
    a.taxonomy.treatments ?? [],
  ]) {
    for (const x of arr) {
      if (x.replace(/-/g, " ").includes(lower) || lower.includes(x)) score += 3;
    }
  }
  return score;
}

/**
 * Lightweight in-memory index for public editorial search (no DB).
 * `relevance` uses a simple token score when `q` is non-empty; otherwise falls back to newest.
 */
export function queryArticles(
  filters: ContentSearchFilters,
  sort: ContentSort = "newest"
): EditorialArticle[] {
  let list = [...EDITORIAL_ARTICLES];

  if (filters.hub && filters.hub !== "all") {
    list = list.filter((a) => a.hub === filters.hub);
  }

  if (filters.audience && filters.audience !== "all") {
    list = list.filter((a) => a.audience === filters.audience || a.audience === "both");
  }

  if (filters.contentType && filters.contentType !== "all") {
    list = list.filter((a) => a.contentType === filters.contentType);
  }

  if (filters.topic) {
    const t = filters.topic.toLowerCase();
    list = list.filter((a) => {
      const tags = (a.taxonomy.tags ?? []).map((x) => x.toLowerCase());
      const markers = (a.taxonomy.markers ?? []).map((x) => x.toLowerCase());
      return tags.some((x) => x.includes(t)) || markers.some((x) => x.includes(t));
    });
  }

  const q = filters.q?.trim() ?? "";
  if (q) {
    list = list
      .map((a) => ({ a, s: scoreArticle(a, q) }))
      .filter(({ s }) => s > 0)
      .sort((x, y) => y.s - x.s || (y.a.publishedAt > x.a.publishedAt ? 1 : -1))
      .map(({ a }) => a);
  } else if (sort === "newest" || sort === "relevance") {
    list.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  }

  return list;
}

function relatedContentScore(source: EditorialArticle, candidate: EditorialArticle): number {
  if (candidate.slug === source.slug) return -1;
  let score = 0;
  if (candidate.hub === source.hub) score += RELATED_WEIGHTS.sameHub;

  const cond = new Set(source.taxonomy.conditions ?? []);
  for (const c of candidate.taxonomy.conditions ?? []) {
    if (cond.has(c)) score += RELATED_WEIGHTS.condition;
  }

  const markers = new Set(source.taxonomy.markers ?? []);
  for (const m of candidate.taxonomy.markers ?? []) {
    if (markers.has(m)) score += RELATED_WEIGHTS.marker;
  }

  const symptoms = new Set(source.taxonomy.symptoms ?? []);
  for (const s of candidate.taxonomy.symptoms ?? []) {
    if (symptoms.has(s)) score += RELATED_WEIGHTS.symptom;
  }

  const treatments = new Set(source.taxonomy.treatments ?? []);
  for (const t of candidate.taxonomy.treatments ?? []) {
    if (treatments.has(t)) score += RELATED_WEIGHTS.treatment;
  }

  const tags = new Set(source.taxonomy.tags ?? []);
  for (const t of candidate.taxonomy.tags ?? []) {
    if (tags.has(t)) score += RELATED_WEIGHTS.tag;
  }

  return score;
}

/**
 * Related articles: curated `relatedSlugs` first, then scored by shared hub, conditions, markers,
 * symptoms, treatments, and tags.
 */
export function getRelatedByTaxonomy(article: EditorialArticle, limit = 4): EditorialArticle[] {
  const relatedFromMeta = article.relatedSlugs
    .map((s) => getArticleBySlug(s))
    .filter((x): x is EditorialArticle => Boolean(x));

  if (relatedFromMeta.length >= limit) return relatedFromMeta.slice(0, limit);

  const scored = EDITORIAL_ARTICLES.filter((a) => a.slug !== article.slug).map((a) => ({
    a,
    score: relatedContentScore(article, a),
  }));

  scored.sort(
    (x, y) =>
      y.score - x.score || (y.a.publishedAt > x.a.publishedAt ? 1 : -1)
  );

  const merged: EditorialArticle[] = [...relatedFromMeta];
  for (const { a } of scored) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.slug === a.slug)) merged.push(a);
  }

  return merged.slice(0, limit);
}

export function getAllSlugs(): string[] {
  return EDITORIAL_ARTICLES.map((a) => a.slug);
}
