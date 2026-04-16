import Link from "next/link";
import type { EditorialGuideLink } from "@/lib/content/types";

export default function ArticleGuideLinks({ guides }: { guides: EditorialGuideLink[] }) {
  if (!guides.length) return null;

  return (
    <section className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft" aria-labelledby="article-guide-links-heading">
      <h2 id="article-guide-links-heading" className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
        Related guides
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
        Pillar pages sit above a single article: broader intent, FAQs, and where this topic fits in the full hair-loss map.
      </p>
      <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.href}>
            <Link
              href={guide.href}
              className="flex h-full flex-col rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-4 transition hover:border-[rgb(var(--gold))]/25 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--gold))]">
                {guide.label}
              </span>
              <span className="mt-2 text-sm font-semibold leading-snug text-[rgb(var(--text-primary))]">
                {guide.title}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                {guide.description}
              </span>
              <span className="mt-3 text-sm font-medium text-medical">View guide →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
