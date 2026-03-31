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
            className={`rounded-card border border-[rgb(var(--border-soft))] bg-card ${padding} shadow-soft transition hover:border-[rgb(var(--gold))]/20 ${scan ? "sm:flex sm:items-start sm:justify-between sm:gap-6" : ""}`}
          >
            <div className={scan ? "min-w-0 flex-1" : ""}>
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
                <Link href={HUB_PATH[a.hub]} className="hover:text-medical">
                  {HUB_LABEL[a.hub]}
                </Link>
                {" · "}
                <time dateTime={a.publishedAt}>{a.publishedAt}</time>
              </p>
              <TitleTag className="mt-1.5 text-lg font-semibold leading-snug text-[rgb(var(--text-primary))]">
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
            <p className={scan ? "mt-3 shrink-0 sm:mt-6" : "mt-3"}>
              <Link href={`/insights/${a.slug}`} className="text-sm font-semibold text-medical hover:underline">
                {scan ? "Read →" : "Read article →"}
              </Link>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
