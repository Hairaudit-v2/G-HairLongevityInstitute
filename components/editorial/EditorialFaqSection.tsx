import type { EditorialFaqItem } from "@/lib/content/types";

export default function EditorialFaqSection({ items }: { items: EditorialFaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className="border-t border-[rgb(var(--border-soft))] pt-10" aria-labelledby="article-faq-heading">
      <h2 id="article-faq-heading" className="text-lg font-semibold text-[rgb(var(--text-primary))]">
        Frequently asked questions
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
        Short answers to common patient questions, without replacing a proper clinical assessment.
      </p>
      <div className="mt-6 space-y-3">
        {items.map((faq) => (
          <details key={faq.question} className="group rounded-[1.25rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,244,239,0.94)_100%)] shadow-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-[rgb(var(--text-primary))] [&::-webkit-details-marker]:hidden">
              {faq.question}
              <svg
                className="h-5 w-5 shrink-0 text-[rgb(var(--text-muted))] transition group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="border-t border-[rgb(var(--border-soft))] px-5 pb-4 pt-2">
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
