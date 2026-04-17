import { HLI_CONVERSION_FAQ_ITEMS } from "@/lib/content/hliConversionFaq";

type Variant = "light" | "dark";

export function ConversionFaqList({
  variant = "light",
  id,
  heading,
  headingId,
  /** When true, render heading + list only (no outer section element) for nesting inside a parent section. */
  embedded = false,
}: {
  variant?: Variant;
  id?: string;
  heading: string;
  headingId: string;
  embedded?: boolean;
}) {
  const wrap = "mx-auto max-w-2xl";
  const card =
    variant === "light"
      ? "group rounded-card border border-[rgb(var(--border-soft))] bg-card shadow-soft"
      : "group rounded-2xl border border-white/10 bg-black/20";
  const summary =
    variant === "light"
      ? "flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-[rgb(var(--text-primary))] [&::-webkit-details-marker]:hidden"
      : "flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-medium text-white/90 [&::-webkit-details-marker]:hidden sm:px-5 sm:py-4";
  const divider = variant === "light" ? "border-[rgb(var(--border-soft))]" : "border-white/10";
  const answer =
    variant === "light"
      ? "text-sm text-[rgb(var(--text-secondary))] leading-relaxed"
      : "text-sm text-white/70 leading-relaxed";
  const icon = variant === "light" ? "text-[rgb(var(--text-muted))]" : "text-white/45";
  const title =
    variant === "light"
      ? "text-center text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl"
      : "text-lg font-semibold text-white sm:text-xl";

  const inner = (
    <>
      <h2 id={headingId} className={title}>
        {heading}
      </h2>
      <div className="mt-8 space-y-3 sm:mt-10">
        {HLI_CONVERSION_FAQ_ITEMS.map((faq) => (
          <details key={faq.q} className={card}>
            <summary className={summary}>
              {faq.q}
              <svg
                className={`h-5 w-5 shrink-0 transition group-open:rotate-180 ${icon}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className={`border-t px-5 pb-4 pt-2 ${divider} ${variant === "dark" ? "px-4 sm:px-5" : ""}`}>
              <p className={answer}>{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </>
  );

  if (embedded) {
    return <div className={wrap}>{inner}</div>;
  }

  return (
    <section id={id} className={wrap} aria-labelledby={headingId}>
      {inner}
    </section>
  );
}
