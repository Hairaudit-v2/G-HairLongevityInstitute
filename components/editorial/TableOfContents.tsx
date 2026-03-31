import type { EditorialTocItem } from "@/lib/content/types";

export default function TableOfContents({ items }: { items: EditorialTocItem[] }) {
  if (!items.length) return null;
  return (
    <nav className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft" aria-label="On this page">
      <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">On this page</p>
      <ol className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] rounded"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
