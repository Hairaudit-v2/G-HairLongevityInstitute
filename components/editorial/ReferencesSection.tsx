import type { EditorialReference } from "@/lib/content/types";

export default function ReferencesSection({ references }: { references: EditorialReference[] }) {
  if (!references.length) return null;
  return (
    <section className="border-t border-[rgb(var(--border-soft))] pt-10" aria-labelledby="refs-heading">
      <h2 id="refs-heading" className="text-lg font-semibold text-[rgb(var(--text-primary))]">
        References & further reading
      </h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[rgb(var(--text-secondary))]">
        {references.map((ref, i) => (
          <li key={i} className="leading-relaxed">
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-medical underline-offset-2 hover:underline"
              >
                {ref.label}
              </a>
            ) : (
              ref.label
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
