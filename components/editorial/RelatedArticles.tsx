import Link from "next/link";
import type { EditorialArticle } from "@/lib/content/types";
import { HUB_LABEL, HUB_PATH } from "@/lib/content/taxonomy";

export default function RelatedArticles({ articles }: { articles: EditorialArticle[] }) {
  if (!articles.length) return null;
  return (
    <section className="border-t border-[rgb(var(--border-soft))] pt-10" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-lg font-semibold text-[rgb(var(--text-primary))]">
        Related articles
      </h2>
      <ul className="mt-4 space-y-4">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/insights/${a.slug}`}
              className="group block rounded-card border border-[rgb(var(--border-soft))] bg-card p-4 shadow-soft transition hover:border-[rgb(var(--gold))]/25"
            >
              <span className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--text-muted))]">
                {HUB_LABEL[a.hub]}
              </span>
              <span className="mt-1 block font-semibold text-[rgb(var(--text-primary))] group-hover:text-medical">
                {a.title}
              </span>
              <span className="mt-1 block text-sm text-[rgb(var(--text-secondary))] line-clamp-2">{a.description}</span>
              <span className="mt-2 inline-block text-xs font-medium text-medical">Read →</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-[rgb(var(--text-muted))]">
        Browse by topic:{" "}
        <Link href={HUB_PATH["blood-markers"]} className="font-medium text-medical hover:underline">
          Blood markers
        </Link>
        {" · "}
        <Link href={HUB_PATH["hair-loss-causes"]} className="font-medium text-medical hover:underline">
          Hair loss causes
        </Link>
      </p>
    </section>
  );
}
