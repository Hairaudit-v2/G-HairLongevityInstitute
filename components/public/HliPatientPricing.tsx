import {
  HLI_PATIENT_PRICING_TIERS,
  HLI_PRICING_PATIENT_NOTES,
} from "@/lib/content/hliPatientPricing";

type Theme = "light" | "dark";

const shell: Record<Theme, { section: string; card: string; title: string; price: string; body: string; best: string; bestLabel: string; notes: string }> = {
  light: {
    section: "text-[rgb(var(--text-primary))]",
    card: "rounded-card border border-[rgb(var(--border-soft))] bg-card p-6 shadow-soft",
    title: "text-lg font-semibold text-[rgb(var(--text-primary))]",
    price: "shrink-0 text-sm font-semibold tabular-nums text-[rgb(var(--gold))]",
    body: "mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]",
    best: "mt-3 text-sm leading-relaxed text-[rgb(var(--text-muted))]",
    bestLabel: "font-medium text-[rgb(var(--text-secondary))]",
    notes: "rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-6 text-sm leading-relaxed text-[rgb(var(--text-secondary))]",
  },
  dark: {
    section: "text-white",
    card: "rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7",
    title: "text-lg font-semibold text-white",
    price: "shrink-0 text-sm font-semibold tabular-nums text-[rgb(var(--gold))]",
    body: "mt-3 text-sm leading-relaxed text-white/75",
    best: "mt-3 text-sm leading-relaxed text-white/60",
    bestLabel: "font-medium text-white/80",
    notes: "rounded-3xl border border-white/10 bg-black/20 p-6 text-sm leading-relaxed text-white/70",
  },
};

export function HliPatientPricing({
  theme = "light",
  id = "patient-pricing",
  headingId = "patient-pricing-heading",
  intro,
}: {
  theme?: Theme;
  /** Section id for skip links / in-page anchors */
  id?: string;
  headingId?: string;
  /** Optional line under the main heading */
  intro?: string;
}) {
  const t = shell[theme];

  return (
    <section id={id} className={t.section} aria-labelledby={headingId}>
      <div className="text-center">
        <h2 id={headingId} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Pricing
        </h2>
        {intro ? (
          <p
            className={
              theme === "light"
                ? "mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base"
                : "mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base"
            }
          >
            {intro}
          </p>
        ) : null}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {HLI_PATIENT_PRICING_TIERS.map((tier) => (
          <article key={tier.id} className={t.card}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <h3 className={t.title}>{tier.title}</h3>
              <p className={t.price}>{tier.price}</p>
            </div>
            <p className={t.body}>{tier.body}</p>
            <p className={t.best}>
              <span className={t.bestLabel}>Best for:</span> {tier.bestFor}
            </p>
          </article>
        ))}
      </div>

      <div className={`mt-10 ${t.notes}`}>
        <p className={theme === "light" ? "font-medium text-[rgb(var(--text-primary))]" : "font-medium text-white"}>
          Good to know
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {HLI_PRICING_PATIENT_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
