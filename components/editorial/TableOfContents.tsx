import type { EditorialTocItem } from "@/lib/content/types";

export default function TableOfContents({ items }: { items: EditorialTocItem[] }) {
  if (!items.length) return null;
  return (
    <nav className="rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,244,239,0.95)_100%)] p-5 shadow-soft" aria-label="On this page">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold-dark))]">On this page</p>
      <ol className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block rounded-[0.9rem] px-3 py-2 text-medical underline-offset-2 transition hover:bg-white hover:text-[rgb(var(--text-primary))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] rounded"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
