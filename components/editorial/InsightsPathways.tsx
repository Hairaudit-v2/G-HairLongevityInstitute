import Link from "next/link";

const cardClass =
  "group flex min-h-[7.5rem] flex-col rounded-xl border border-[rgb(var(--border-soft))] bg-card/95 p-5 shadow-soft backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--gold))]/35 hover:shadow-md sm:min-h-[8rem] sm:p-6";

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
    title: "I’m comparing minoxidil routes",
    blurb: "Topical versus oral minoxidil — what’s shared, what differs, and why “stronger” isn’t the whole story.",
    href: "/insights/oral-minoxidil-vs-topical-minoxidil",
  },
];

/**
 * Guided entry for /insights — four patient-framed paths using existing routes only.
 */
export default function InsightsPathways() {
  return (
    <section
      className="relative mx-auto mt-12 max-w-6xl sm:mt-14"
      aria-labelledby="insights-start-heading"
    >
      <div className="rounded-2xl border border-[rgb(var(--border-soft))] bg-gradient-to-b from-[rgb(var(--gold))]/[0.09] via-card to-card px-5 py-7 shadow-soft ring-1 ring-[rgb(var(--gold))]/[0.12] sm:px-8 sm:py-9">
        <div className="mx-auto max-w-2xl text-center sm:max-w-none">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">First step</p>
          <h2
            id="insights-start-heading"
            className="mt-2 text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl"
          >
            Start here
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
            Choose what matches you most. Then use search when you want to narrow down.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5">
          {pathways.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className={`${cardClass} block h-full border-l-[3px] border-l-[rgb(var(--gold))]/75 pl-4 no-underline sm:pl-5`}
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
                  Go to guide
                </span>
                <span className="mt-1.5 block text-base font-semibold leading-snug text-[rgb(var(--text-primary))] group-hover:text-medical">
                  {p.title}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-[rgb(var(--text-secondary))]">{p.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
