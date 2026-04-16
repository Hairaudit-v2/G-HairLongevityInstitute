import Link from "next/link";
import { Container } from "@/components/public/PublicCTA";

export type GuideSupportingReadItem = {
  href: string;
  category: string;
  title: string;
  description: string;
};

type Props = {
  items: GuideSupportingReadItem[];
  headingId: string;
  title?: string;
  intro?: string;
  theme?: "card" | "subtle";
};

export function GuideSupportingReads({
  items,
  headingId,
  title = "Best next reads",
  intro,
  theme = "subtle",
}: Props) {
  const sectionClass =
    theme === "card"
      ? "border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16"
      : "border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16";

  return (
    <section className={sectionClass} aria-labelledby={headingId}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 id={headingId} className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              {intro}
            </p>
          ) : null}
        </div>
        <ul className="mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft transition hover:border-[rgb(var(--gold))]/25 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgb(var(--gold))]">
                  {item.category}
                </span>
                <span className="mt-2 text-sm font-semibold leading-snug text-[rgb(var(--text-primary))]">
                  {item.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                  {item.description}
                </span>
                <span className="mt-3 text-sm font-medium text-medical">Read next →</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
