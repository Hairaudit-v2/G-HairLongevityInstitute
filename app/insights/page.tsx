import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { EditorialArticle } from "@/lib/content/types";
import {
  queryArticles,
  type ContentSort,
  type EditorialContentType,
  type EditorialHubSlug,
} from "@/lib/content/index";
import EditorialPageShell from "@/components/editorial/EditorialPageShell";
import EditorialSearchPanel from "@/components/editorial/EditorialSearchPanel";
import ArticleTeaserList from "@/components/editorial/ArticleTeaserList";
import InsightsPathways from "@/components/editorial/InsightsPathways";
import PopularTopics from "@/components/editorial/PopularTopics";
import { HUB_LABEL, HUB_PATH } from "@/lib/content/taxonomy";
import { INSIGHTS_FEATURED_SLUGS } from "@/lib/content/publicInsightPicks";

/** Faceted `/insights?...` views need per-request metadata (canonical `/insights`, noindex when filtered). */
export const dynamic = "force-dynamic";

function partitionInsightsFeatured(
  articles: EditorialArticle[],
  order: readonly string[]
): { featured: EditorialArticle[]; rest: EditorialArticle[] } {
  const featured = order
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is EditorialArticle => Boolean(a));
  const featuredSet = new Set(featured.map((a) => a.slug));
  const rest = articles.filter((a) => !featuredSet.has(a.slug));
  return { featured, rest };
}

type SearchProps = { searchParams: Record<string, string | string[] | undefined> };

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

function hasFacetOrSearchState(searchParams: SearchProps["searchParams"]): boolean {
  const q = (firstString(searchParams.q) ?? "").trim();
  const hub = firstString(searchParams.hub) ?? "all";
  const audience = firstString(searchParams.audience) ?? "all";
  const contentType = firstString(searchParams.contentType) ?? "all";
  const sort = firstString(searchParams.sort) ?? "newest";
  const topic = (firstString(searchParams.topic) ?? "").trim();
  return (
    q !== "" ||
    topic !== "" ||
    hub !== "all" ||
    audience !== "all" ||
    contentType !== "all" ||
    sort !== "newest"
  );
}

export function generateMetadata({ searchParams }: SearchProps): Metadata {
  const filtered = hasFacetOrSearchState(searchParams);
  return buildPageMetadata({
    path: "/insights",
    title: filtered
      ? "Hair loss insights search results"
      : "Hair loss insights — understand shedding, thinning, and next steps",
    metaDescription: filtered
      ? "Filtered Hair Longevity Institute insight results for hair loss causes, blood markers, treatments, and common patient questions."
      : "Clear guides on sudden shedding, gradual thinning, hormones and blood tests, scalp health, and treatment questions — from the Hair Longevity Institute. Search or browse by topic.",
    appendBrand: true,
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  });
}

function normalizeHub(v: string | undefined): EditorialHubSlug | "all" {
  const allowed = new Set(["conditions", "blood-markers", "treatments", "hair-loss-causes", "all"]);
  if (v && allowed.has(v)) return v as EditorialHubSlug | "all";
  return "all";
}

function normalizeContentType(v: string | undefined): EditorialContentType | "all" {
  const allowed = new Set([
    "guide",
    "explainer",
    "comparison",
    "interpretation",
    "faq",
    "decision",
    "all",
  ]);
  if (v && allowed.has(v)) return v as EditorialContentType | "all";
  return "all";
}

function InsightsContent({ searchParams }: SearchProps) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const hub = normalizeHub(typeof searchParams.hub === "string" ? searchParams.hub : undefined);
  const audience =
    typeof searchParams.audience === "string"
      ? searchParams.audience
      : "all";
  const contentType = normalizeContentType(
    typeof searchParams.contentType === "string" ? searchParams.contentType : undefined
  );
  const sort = (typeof searchParams.sort === "string" ? searchParams.sort : "newest") as ContentSort;
  const topic = typeof searchParams.topic === "string" ? searchParams.topic : "";

  const articles = queryArticles(
    {
      q,
      hub,
      audience: audience as "all" | "patients" | "clinicians" | "both",
      contentType,
      topic: topic || undefined,
    },
    q ? "relevance" : sort === "relevance" ? "relevance" : "newest"
  );

  const isDefaultView =
    q === "" && hub === "all" && audience === "all" && contentType === "all" && topic === "";
  const { featured, rest } = isDefaultView
    ? partitionInsightsFeatured(articles, INSIGHTS_FEATURED_SLUGS)
    : { featured: [] as EditorialArticle[], rest: articles };
  /** True on plain /insights: curated picks plus the rest of the library (both lists non-empty). Hidden when any filter/search/topic is active — single Results list then. */
  const showFeaturedBand = isDefaultView && featured.length > 0 && rest.length > 0;
  const resultCount = articles.length;

  return (
    <div className="pb-16 pt-8 sm:pb-20 sm:pt-10">
      <header className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,240,235,0.92)_100%)] px-6 py-8 text-center shadow-[0_18px_52px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.12),transparent_70%)]"
          aria-hidden
        />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--gold))] sm:text-sm sm:tracking-[0.2em]">
          Insights
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:mt-5 sm:text-4xl sm:leading-tight">
          What might be behind your hair loss?
        </h1>
        <p className="mx-auto mt-5 max-w-prose text-base leading-relaxed text-[rgb(var(--text-secondary))] sm:mt-6 sm:text-[1.0625rem]">
          Worried about sudden shedding, gradual thinning, hormones, blood tests, or an irritated scalp? Start below,
          then search — we cover medicines, office procedures, and long-term hair support in plain language. This is
          education, not a substitute for an exam with your doctor.
        </p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-2.5 text-left sm:grid-cols-3 sm:gap-3">
          <div className="rounded-full border border-[rgb(var(--border-soft))] bg-white/90 px-4 py-2.5 shadow-soft sm:rounded-[1.15rem] sm:px-4 sm:py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">Patient-first</p>
            <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">Guided reading for hair shedding, thinning, blood markers, and treatment questions.</p>
          </div>
          <div className="rounded-full border border-[rgb(var(--border-soft))] bg-white/90 px-4 py-2.5 shadow-soft sm:rounded-[1.15rem] sm:px-4 sm:py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">Evidence-aware</p>
            <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">Educational content that stays medically serious without becoming cold or overwhelming.</p>
          </div>
          <div className="rounded-full border border-[rgb(var(--border-soft))] bg-white/90 px-4 py-2.5 shadow-soft sm:rounded-[1.15rem] sm:px-4 sm:py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">Easy to navigate</p>
            <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">Browse curated starting points, then narrow down by topic, hub, audience, or format.</p>
          </div>
        </div>
      </header>

      <InsightsPathways />

      <div className="mx-auto mt-12 max-w-3xl sm:mt-14">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-subtle" aria-hidden />}>
          <EditorialSearchPanel />
        </Suspense>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-10 lg:mt-14 lg:grid-cols-[1fr_300px]">
        <div className={showFeaturedBand ? "pt-2" : ""}>
          {showFeaturedBand ? (
            <>
              <div className="rounded-[1.75rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,240,235,0.78)_100%)] p-6 shadow-[0_18px_52px_rgba(0,0,0,0.06)] sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--gold))]">
                  Suggested first reads
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-xl">
                  Common starting points
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                  Curated starting articles — including recent deep-dives — plus evergreen entry points for labs and sudden
                  shedding.
                </p>
                <div className="mt-6">
                  <ArticleTeaserList
                    articles={featured}
                    density="scan"
                    headingLevel="h3"
                  />
                </div>
              </div>
              <div
                className="my-12 border-t-2 border-[rgb(var(--border-soft))] pt-12"
                role="separator"
                aria-hidden
              />
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
              <h2 className="text-lg font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-xl">
                All insights
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                Full library, newest first — or use filters in search above.
              </p>
                </div>
                <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
                  {rest.length} articles
                </p>
              </div>
              <div className="mt-6">
                <ArticleTeaserList articles={rest} density="scan" headingLevel="h3" />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">Results</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                    Refined results based on your current search and filters.
                  </p>
                </div>
                <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
                  {resultCount} article{resultCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="mt-4">
                <ArticleTeaserList articles={articles} density="scan" headingLevel="h3" />
              </div>
            </>
          )}
        </div>
        <aside className="space-y-8 lg:pt-8">
          <PopularTopics />
          <nav className="rounded-card border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,244,239,0.94)_100%)] p-5 shadow-soft" aria-label="Hubs">
            <p className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">Hubs</p>
            <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
              Browse by causes, blood markers, and treatment questions without losing the main library structure.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {(Object.keys(HUB_PATH) as EditorialHubSlug[]).map((slug) => (
                <li key={slug}>
                  <Link href={HUB_PATH[slug]} className="font-medium text-medical hover:underline">
                    {HUB_LABEL[slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}

export default function InsightsPage({ searchParams }: SearchProps) {
  return (
    <EditorialPageShell theme="light">
      <InsightsContent searchParams={searchParams} />
    </EditorialPageShell>
  );
}
