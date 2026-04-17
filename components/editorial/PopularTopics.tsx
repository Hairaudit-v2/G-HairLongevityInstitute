import Link from "next/link";
import { POPULAR_TOPIC_KEYS } from "@/lib/content/taxonomy";

export default function PopularTopics() {
  return (
    <section className="rounded-card border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,244,239,0.94)_100%)] p-6 shadow-soft" aria-labelledby="popular-topics-heading">
      <h2 id="popular-topics-heading" className="text-sm font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
        Popular topics
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
        Common starting points for sudden shedding, ferritin, hormones, treatment questions, and scalp symptoms.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {POPULAR_TOPIC_KEYS.map(({ key, label }) => (
          <li key={key}>
            <Link
              href={`/insights?topic=${encodeURIComponent(key)}`}
              className="inline-flex rounded-full border border-[rgb(var(--border-soft))] bg-white/90 px-3.5 py-2 text-sm font-medium text-[rgb(var(--text-primary))] transition hover:border-[rgb(var(--gold))]/30 hover:bg-[rgb(var(--gold))]/[0.06]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
