import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  queryArticles,
  type ContentSort,
  type EditorialContentType,
  type EditorialHubSlug,
} from "@/lib/content/index";
import EditorialPageShell from "@/components/editorial/EditorialPageShell";
import EditorialSearchPanel from "@/components/editorial/EditorialSearchPanel";
import ArticleTeaserList from "@/components/editorial/ArticleTeaserList";
import PopularTopics from "@/components/editorial/PopularTopics";
import { HUB_LABEL, HUB_PATH } from "@/lib/content/taxonomy";

export const metadata: Metadata = buildPageMetadata({
  path: "/insights",
  title: "Hair loss insights — biology, blood markers & treatment planning",
  metaDescription:
    "Evidence-framed articles on hair loss causes, blood markers, treatments, and scalp context from the Hair Longevity Institute. Search by topic, hub, or format.",
  appendBrand: true,
});

type SearchProps = { searchParams: Record<string, string | string[] | undefined> };

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

  return (
    <div className="py-12 sm:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">Insights</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl">
          Biology-first hair education
        </h1>
        <p className="mt-4 text-[rgb(var(--text-secondary))] leading-relaxed">
          Search across hubs for causes, blood markers, treatments, and continuity care — written in clear, clinical language.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-3xl">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-subtle" aria-hidden />}>
          <EditorialSearchPanel />
        </Suspense>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">Results</h2>
          <div className="mt-4">
            <ArticleTeaserList articles={articles} />
          </div>
        </div>
        <aside className="space-y-8 lg:pt-8">
          <PopularTopics />
          <nav className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft" aria-label="Hubs">
            <p className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">Hubs</p>
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
