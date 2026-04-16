import Link from "next/link";
import { Container } from "@/components/public/PublicCTA";

export type GuideRelatedItem = {
  href: string;
  category: string;
  title: string;
  description: string;
};

type Props = {
  items: GuideRelatedItem[];
  headingId: string;
};

export function GuideRelatedGuides({ items, headingId }: Props) {
  return (
    <section
      className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16"
      aria-labelledby={headingId}
    >
      <Container>
        <h2 id={headingId} className="text-center text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
          Related guides
        </h2>
        <ul className="mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-5 shadow-soft transition hover:border-[rgb(var(--gold))]/25 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgb(var(--gold))]">
                  {item.category}
                </span>
                <span className="mt-2 text-sm font-semibold leading-snug text-[rgb(var(--text-primary))]">{item.title}</span>
                <span className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">{item.description}</span>
                <span className="mt-3 text-sm font-medium text-medical">View guide →</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
