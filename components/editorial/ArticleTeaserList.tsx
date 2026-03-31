import Link from "next/link";
import type { EditorialArticle } from "@/lib/content/types";
import { HUB_LABEL, HUB_PATH } from "@/lib/content/taxonomy";

export default function ArticleTeaserList({ articles }: { articles: EditorialArticle[] }) {
  if (!articles.length) {
    return (
      <p className="text-sm text-[rgb(var(--text-secondary))]">
        No articles match your filters yet. Try clearing search or browse a hub.
      </p>
    );
  }
  return (
    <ul className="space-y-4">
      {articles.map((a) => (
        <li key={a.slug}>
          <article className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft transition hover:border-[rgb(var(--gold))]/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
              <Link href={HUB_PATH[a.hub]} className="hover:text-medical">
                {HUB_LABEL[a.hub]}
              </Link>
              {" · "}
              <time dateTime={a.publishedAt}>{a.publishedAt}</time>
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[rgb(var(--text-primary))]">
              <Link href={`/insights/${a.slug}`} className="hover:text-medical">
                {a.title}
              </Link>
            </h2>
            {a.deck ? <p className="mt-2 text-sm font-medium text-[rgb(var(--text-secondary))]">{a.deck}</p> : null}
            <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed line-clamp-3">{a.description}</p>
            <p className="mt-3">
              <Link href={`/insights/${a.slug}`} className="text-sm font-semibold text-medical hover:underline">
                Read article →
              </Link>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
