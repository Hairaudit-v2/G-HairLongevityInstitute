import { SecondaryButton, UtilityLink } from "@/components/public/PublicCTA";
import type { HliFeaturedGuide } from "@/lib/guides/hliDownloadableGuides";

type Props = {
  guide: HliFeaturedGuide;
  /** Larger typography and framing for the “start here” guide */
  prominent?: boolean;
};

/** Primary action: landing/PDF href, else editorial read-online href. */
function guideActionHref(guide: HliFeaturedGuide): string | undefined {
  return guide.href ?? guide.readOnlineHref;
}

function guideDownloadFilename(guide: HliFeaturedGuide): string | boolean | undefined {
  if (!guide.href || !guide.downloadAs) return undefined;
  return guide.downloadAs;
}

export function HliGuideCard({ guide, prominent }: Props) {
  const actionHref = guideActionHref(guide);
  const download = guideDownloadFilename(guide);
  const showSecondaryLink = Boolean(guide.href && guide.readOnlineHref && guide.readOnlineLabel);

  return (
    <article
      className={
        prominent
          ? "flex h-full flex-col rounded-card border border-[rgb(var(--gold))]/25 bg-card p-8 shadow-card sm:p-10"
          : "flex h-full flex-col rounded-card border border-[rgb(var(--border-soft))] bg-card p-6 shadow-soft transition hover:border-[rgb(var(--gold))]/20 hover:shadow-card sm:p-7"
      }
    >
      <p
        className={
          prominent
            ? "text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--gold))]"
            : "text-xs font-semibold uppercase tracking-[0.1em] text-[rgb(var(--gold))]"
        }
      >
        {guide.category}
      </p>
      <h3
        className={
          prominent
            ? "mt-4 text-xl font-semibold leading-snug tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl"
            : "mt-3 text-lg font-semibold leading-snug tracking-tight text-[rgb(var(--text-primary))]"
        }
      >
        {guide.title}
      </h3>
      <p
        className={
          prominent
            ? "mt-4 flex-1 text-base leading-relaxed text-[rgb(var(--text-secondary))] sm:text-[1.0625rem]"
            : "mt-3 flex-1 text-sm leading-relaxed text-[rgb(var(--text-secondary))]"
        }
      >
        {guide.description}
      </p>
      <div className={prominent ? "mt-8 flex flex-col items-stretch gap-3 sm:items-start" : "mt-6 flex flex-col items-stretch gap-3 sm:items-start"}>
        {actionHref ? (
          <SecondaryButton href={actionHref} download={download}>
            {guide.ctaLabel}
          </SecondaryButton>
        ) : (
          <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Guide link coming soon.</p>
        )}
        {showSecondaryLink ? (
          <UtilityLink href={guide.readOnlineHref!} className="text-left sm:text-left">
            {guide.readOnlineLabel}
          </UtilityLink>
        ) : null}
      </div>
    </article>
  );
}
