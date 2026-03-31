import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { EditorialHubSlug } from "@/lib/content/types";
import { getArticlesByHub } from "@/lib/content/index";
import { HUB_DESCRIPTION, HUB_LABEL, HUB_PATH } from "@/lib/content/taxonomy";
import EditorialPageShell from "@/components/editorial/EditorialPageShell";
import ArticleTeaserList from "@/components/editorial/ArticleTeaserList";
import PopularTopics from "@/components/editorial/PopularTopics";

export function hubMetadata(hub: EditorialHubSlug): Metadata {
  const label = HUB_LABEL[hub];
  const path = HUB_PATH[hub];
  const descriptions: Record<EditorialHubSlug, string> = {
    conditions:
      "Educational articles on scalp and hair conditions in a biology-first framework — not a substitute for personal medical assessment.",
    "blood-markers":
      "How blood markers relate to hair biology and when to discuss results with your clinician. From the Hair Longevity Institute.",
    treatments:
      "Treatment planning themes, evidence context, and continuity considerations for hair loss — clinical education from HLI.",
    "hair-loss-causes":
      "Hair loss causes, pattern recognition, and systemic contributors explained for patients and referring clinicians.",
  };
  return buildPageMetadata({
    path,
    title: `${label} — hair loss education hub`,
    metaDescription: descriptions[hub],
    appendBrand: true,
  });
}

export default function HubEditorialPage({ hub }: { hub: EditorialHubSlug }) {
  const articles = getArticlesByHub(hub);
  const label = HUB_LABEL[hub];

  return (
    <EditorialPageShell theme="light">
      <div className="py-12 sm:py-16">
        <header className="mx-auto max-w-3xl">
          <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">Insights hub</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl">
            {label}
          </h1>
          <p className="mt-4 text-[rgb(var(--text-secondary))] leading-relaxed">{HUB_DESCRIPTION[hub]}</p>
          <p className="mt-6 text-sm text-[rgb(var(--text-muted))]">
            <Link href="/insights" className="font-medium text-medical hover:underline">
              Search all insights
            </Link>
          </p>
        </header>
        <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {articles.length === 0 ? (
              <p className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-6 text-sm text-[rgb(var(--text-secondary))] shadow-soft leading-relaxed">
                New articles for this hub are in progress. Browse{" "}
                <Link href="/insights" className="font-medium text-medical hover:underline">
                  all insights
                </Link>{" "}
                or start with blood markers and hair loss causes.
              </p>
            ) : (
              <ArticleTeaserList articles={articles} />
            )}
          </div>
          <aside>
            <PopularTopics />
          </aside>
        </div>
      </div>
    </EditorialPageShell>
  );
}
