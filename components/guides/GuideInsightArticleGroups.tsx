import Link from "next/link";
import { getArticleBySlug } from "@/lib/content/index";
import type { EditorialPillarSlug } from "@/lib/content/types";
import { GUIDE_INSIGHT_CLUSTERS } from "@/lib/content/guideInsightClusters";
import { Container } from "@/components/public/PublicCTA";

type Props = {
  pillar: EditorialPillarSlug;
  headingId: string;
  sectionHeading?: string;
};

export function GuideInsightArticleGroups({
  pillar,
  headingId,
  sectionHeading = "Insight articles connected to this guide",
}: Props) {
  const groups = GUIDE_INSIGHT_CLUSTERS[pillar];
  if (!groups?.length) return null;

  return (
    <section
      className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16"
      aria-labelledby={headingId}
    >
      <Container>
        <div className="mx-auto max-w-3xl">
          <h2
            id={headingId}
            className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl"
          >
            {sectionHeading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
            Short articles go deep on one question; this guide keeps the broader lane. Follow one thread at a time.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-10">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-base font-semibold text-[rgb(var(--text-primary))]">{group.title}</h3>
              {group.intro ? (
                <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">{group.intro}</p>
              ) : null}
              <ul className="mt-4 space-y-3 list-none p-0">
                {group.items.map(({ slug, note }) => {
                  const article = getArticleBySlug(slug);
                  if (!article) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/insights/${slug}`}
                        className="group block rounded-card border border-[rgb(var(--border-soft))] bg-card p-4 shadow-soft transition hover:border-[rgb(var(--gold))]/25 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
                      >
                        <span className="text-sm font-semibold leading-snug text-[rgb(var(--text-primary))] group-hover:text-medical">
                          {article.title}
                        </span>
                        {note ? (
                          <span className="mt-1 block text-sm leading-relaxed text-[rgb(var(--text-muted))]">
                            {note}
                          </span>
                        ) : (
                          <span className="mt-1 block text-sm leading-relaxed text-[rgb(var(--text-secondary))] line-clamp-2">
                            {article.excerpt}
                          </span>
                        )}
                        <span className="mt-2 inline-block text-sm font-medium text-medical">Read insight →</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
