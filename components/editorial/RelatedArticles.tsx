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
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
        Continue reading with closely related patient education, topic cluster links, and supporting explainers.
      </p>
      <ul className="mt-4 space-y-4">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/insights/${a.slug}`}
              className="group block rounded-[1.25rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,244,239,0.94)_100%)] p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--gold))]/25"
            >
              <span className="inline-flex rounded-full bg-[rgb(var(--gold))]/10 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[rgb(var(--gold-dark))]">
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
