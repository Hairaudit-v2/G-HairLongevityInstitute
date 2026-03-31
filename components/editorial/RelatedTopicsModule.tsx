import Link from "next/link";
import type { EditorialTaxonomy } from "@/lib/content/types";

function chip(href: string, label: string) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-[rgb(var(--border-soft))] bg-subtle/50 px-3 py-1 text-xs font-medium text-[rgb(var(--text-primary))] hover:border-[rgb(var(--gold))]/30"
    >
      {label}
    </Link>
  );
}

/** Internal discovery links derived from shared taxonomy (conditions, markers, symptoms, treatments). */
export default function RelatedTopicsModule({ taxonomy }: { taxonomy: EditorialTaxonomy }) {
  const blocks: { title: string; items: { href: string; label: string }[] }[] = [];

  const conditions = taxonomy.conditions ?? [];
  const markers = taxonomy.markers ?? [];
  const symptoms = taxonomy.symptoms ?? [];
  const treatments = taxonomy.treatments ?? [];
  const tags = taxonomy.tags ?? [];

  if (conditions.length) {
    blocks.push({
      title: "Conditions",
      items: conditions.map((c) => ({
        href: `/insights?q=${encodeURIComponent(c.replace(/-/g, " "))}`,
        label: c.replace(/-/g, " "),
      })),
    });
  }
  if (markers.length) {
    blocks.push({
      title: "Markers",
      items: markers.map((c) => ({
        href: `/insights?topic=${encodeURIComponent(c)}`,
        label: c.replace(/-/g, " "),
      })),
    });
  }
  if (symptoms.length) {
    blocks.push({
      title: "Symptoms",
      items: symptoms.map((c) => ({
        href: `/insights?q=${encodeURIComponent(c.replace(/-/g, " "))}`,
        label: c.replace(/-/g, " "),
      })),
    });
  }
  if (treatments.length) {
    blocks.push({
      title: "Treatments",
      items: treatments.map((c) => ({
        href: `/insights?q=${encodeURIComponent(c.replace(/-/g, " "))}`,
        label: c.replace(/-/g, " "),
      })),
    });
  }
  if (tags.length) {
    blocks.push({
      title: "Topics",
      items: tags.map((c) => ({
        href: `/insights?topic=${encodeURIComponent(c)}`,
        label: c.replace(/-/g, " "),
      })),
    });
  }

  if (!blocks.length) return null;

  return (
    <section className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft" aria-labelledby="related-topics-heading">
      <h2 id="related-topics-heading" className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
        Related topics
      </h2>
      <div className="mt-4 space-y-4">
        {blocks.map((b) => (
          <div key={b.title}>
            <p className="text-xs font-medium text-[rgb(var(--text-muted))]">{b.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {b.items.map((item) => (
                <span key={item.href}>{chip(item.href, item.label)}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
