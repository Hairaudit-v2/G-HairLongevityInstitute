import type { EditorialPerson } from "@/lib/content/types";
import Link from "next/link";

function PersonCard({ person, variant }: { person: EditorialPerson; variant: "author" | "reviewer" }) {
  const label = variant === "author" ? "Author" : "Reviewer";
  return (
    <div className="rounded-card border border-[rgb(var(--border-soft))] bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">{label}</p>
      <p className="mt-2 font-semibold text-[rgb(var(--text-primary))]">{person.name}</p>
      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{person.role}</p>
      {person.credentials ? (
        <p className="mt-2 text-sm text-[rgb(var(--text-muted))] leading-relaxed">{person.credentials}</p>
      ) : null}
      {person.profilePath ? (
        <p className="mt-3">
          <Link href={person.profilePath} className="text-sm font-medium text-medical hover:underline">
            Profile
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default function AuthorReviewerBlock({
  authors,
  reviewers,
}: {
  authors: EditorialPerson[];
  reviewers?: EditorialPerson[];
}) {
  return (
    <section className="border-t border-[rgb(var(--border-soft))] pt-10" aria-labelledby="author-block-heading">
      <h2 id="author-block-heading" className="text-lg font-semibold text-[rgb(var(--text-primary))]">
        Who wrote this and who checked it
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
        Articles are drafted for patient clarity, then reviewed for medical accuracy under HLI editorial standards.
        Sources are listed where they help you verify claims; this education still does not replace an exam or plan from
        your own clinician.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {authors.map((p) => (
          <PersonCard key={`${p.name}-author`} person={p} variant="author" />
        ))}
        {(reviewers ?? []).map((p) => (
          <PersonCard key={`${p.name}-rev`} person={p} variant="reviewer" />
        ))}
      </div>
    </section>
  );
}
