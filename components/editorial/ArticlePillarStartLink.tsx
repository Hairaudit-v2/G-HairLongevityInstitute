import Link from "next/link";
import type { EditorialPillarSlug } from "@/lib/content/types";
import { pillarTopBlurb } from "@/lib/content/pillarGuides";

export default function ArticlePillarStartLink({ pillar }: { pillar: EditorialPillarSlug }) {
  const { href, guideTitle, blurb } = pillarTopBlurb(pillar);

  return (
    <div className="rounded-card border border-[rgb(var(--border-soft))] bg-subtle/60 p-4 shadow-soft sm:p-5">
      <p className="text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
        <Link
          href={href}
          className="font-semibold text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
        >
          Start with the full guide
        </Link>
        <span className="text-[rgb(var(--text-muted))]"> — </span>
        <span className="font-medium text-[rgb(var(--text-primary))]">{guideTitle}.</span>{" "}
        {blurb}
      </p>
    </div>
  );
}
