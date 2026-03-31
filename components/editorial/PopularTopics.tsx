import Link from "next/link";
import { POPULAR_TOPIC_KEYS } from "@/lib/content/taxonomy";

export default function PopularTopics() {
  return (
    <section className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-6 shadow-soft" aria-labelledby="popular-topics-heading">
      <h2 id="popular-topics-heading" className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
        Popular topics
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {POPULAR_TOPIC_KEYS.map(({ key, label }) => (
          <li key={key}>
            <Link
              href={`/insights?topic=${encodeURIComponent(key)}`}
              className="inline-flex rounded-full border border-[rgb(var(--border-soft))] bg-subtle/50 px-3 py-1.5 text-sm font-medium text-[rgb(var(--text-primary))] transition hover:border-[rgb(var(--gold))]/30 hover:bg-subtle"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
