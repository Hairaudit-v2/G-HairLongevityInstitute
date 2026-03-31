import Link from "next/link";

const cardClass =
  "rounded-card border border-[rgb(var(--border-soft))] bg-card p-4 shadow-soft transition hover:border-[rgb(var(--gold))]/25";

const pathways: { title: string; blurb: string; href: string }[] = [
  {
    title: "I’m shedding suddenly",
    blurb: "Heavy or diffuse shedding after stress, illness, or pregnancy — what that can mean.",
    href: "/insights/telogen-effluvium-after-illness-or-stress",
  },
  {
    title: "My hair is thinning gradually",
    blurb: "Slow thinning, part widening, or pattern change — how causes are sorted out.",
    href: "/insights/diffuse-thinning-in-women",
  },
  {
    title: "I think hormones or blood tests may be involved",
    blurb: "Ferritin, thyroid, and other labs — when they help and when they don’t.",
    href: "/insights/what-blood-tests-matter-for-hair-loss",
  },
  {
    title: "I’ve already had treatment and still have concerns",
    blurb: "Medicines, PRP-style procedures, or a transplant — where to read next and how your care team fits in.",
    href: "/treatments",
  },
];

/**
 * Guided entry for /insights — four patient-framed paths using existing routes only.
 */
export default function InsightsPathways() {
  return (
    <section className="mx-auto mt-10 max-w-3xl" aria-labelledby="insights-start-heading">
      <h2 id="insights-start-heading" className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">
        Start here
      </h2>
      <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
        Pick the situation closest to yours, then use search below to go deeper.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {pathways.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className={`${cardClass} block h-full no-underline`}>
              <span className="font-semibold text-[rgb(var(--text-primary))]">{p.title}</span>
              <span className="mt-1 block text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{p.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
