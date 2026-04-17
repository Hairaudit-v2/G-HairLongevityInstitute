import Link from "next/link";
import type { EditorialArticle } from "@/lib/content/types";
import { HUB_LABEL, HUB_PATH } from "@/lib/content/taxonomy";

type ArticleTeaserListProps = {
  articles: EditorialArticle[];
  /** Tighter layout and shorter visible blurbs for the main insights index. */
  density?: "default" | "scan";
  /** Use h3 for titles when nested under a section h2 (insights index). */
  headingLevel?: "h2" | "h3";
};

export default function ArticleTeaserList({
  articles,
  density = "default",
  headingLevel = "h2",
}: ArticleTeaserListProps) {
  const scan = density === "scan";
  const padding = scan ? "p-4 sm:p-5" : "p-5";
  const gap = scan ? "space-y-3" : "space-y-4";
  const excerptClamp = scan ? "line-clamp-2" : "line-clamp-3";
  const deckClamp = scan ? "line-clamp-2" : "";

  if (!articles.length) {
    return (
      <p className="text-sm text-[rgb(var(--text-secondary))]">
        No articles match your filters yet. Try clearing search or browse a hub.
      </p>
    );
  }

  const TitleTag = headingLevel;

  return (
    <ul className={gap}>
      {articles.map((a) => (
        <li key={a.slug}>
          <article
            className={`rounded-card border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(249,246,242,0.94)_100%)] ${padding} shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--gold))]/25 hover:shadow-card ${scan ? "sm:flex sm:items-start sm:justify-between sm:gap-6" : ""}`}
          >
            <div className={scan ? "min-w-0 flex-1" : ""}>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
                <Link
                  href={HUB_PATH[a.hub]}
                  className="inline-flex rounded-full bg-[rgb(var(--gold))]/10 px-2.5 py-1 text-[rgb(var(--gold-dark))] transition hover:bg-[rgb(var(--gold))]/15"
                >
                  {HUB_LABEL[a.hub]}
                </Link>
                <span aria-hidden>·</span>
                <time dateTime={a.publishedAt}>{a.publishedAt}</time>
              </p>
              <TitleTag className="mt-3 text-lg font-semibold leading-snug text-[rgb(var(--text-primary))] sm:text-[1.35rem]">
                <Link href={`/insights/${a.slug}`} className="hover:text-medical">
                  {a.title}
                </Link>
              </TitleTag>
              {a.deck ? (
                <p
                  className={`mt-1.5 text-sm font-medium leading-snug text-[rgb(var(--text-secondary))] ${deckClamp}`}
                >
                  {a.deck}
                </p>
              ) : null}
              <p
                className={`mt-1.5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] ${excerptClamp}`}
              >
                {a.excerpt}
              </p>
            </div>
            <p className={scan ? "mt-4 shrink-0 sm:mt-8" : "mt-4"}>
              <Link
                href={`/insights/${a.slug}`}
                className="inline-flex rounded-full border border-[rgb(var(--medical))]/15 bg-white/85 px-3.5 py-2 text-sm font-semibold text-medical transition hover:border-[rgb(var(--medical))]/30 hover:bg-[rgb(var(--medical))]/5"
              >
                {scan ? "Read →" : "Read article →"}
              </Link>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
