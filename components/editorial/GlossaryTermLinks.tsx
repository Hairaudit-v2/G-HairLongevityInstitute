import Link from "next/link";
import { getGlossaryBySlug, glossaryPath } from "@/lib/content/glossary";

export default function GlossaryTermLinks({ slugs }: { slugs: string[] }) {
  const entries = slugs.map(getGlossaryBySlug).filter(Boolean);
  if (!entries.length) return null;
  return (
    <section className="rounded-card border border-[rgb(var(--border-soft))] bg-subtle/40 p-5" aria-labelledby="glossary-terms-heading">
      <h2 id="glossary-terms-heading" className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
        Terms in this article
      </h2>
      <ul className="mt-3 space-y-3">
        {entries.map((g) =>
          g ? (
            <li key={g.slug}>
              <Link href={glossaryPath(g.slug)} className="font-semibold text-medical hover:underline">
                {g.term}
              </Link>
              <p className="mt-1 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{g.shortDefinition}</p>
            </li>
          ) : null
        )}
      </ul>
    </section>
  );
}
