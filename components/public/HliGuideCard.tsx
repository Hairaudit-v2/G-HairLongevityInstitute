import Image from "next/image";
import { SecondaryButton, UtilityLink } from "@/components/public/PublicCTA";
import type { HliFeaturedGuide } from "@/lib/guides/hliDownloadableGuides";

type Props = {
  guide: HliFeaturedGuide;
  /** Larger typography and framing for the “start here” guide */
  prominent?: boolean;
  /** Homepage-only thumbnail treatment */
  showThumbnail?: boolean;
};

/** Primary action: landing/PDF href, else editorial read-online href. */
function guideActionHref(guide: HliFeaturedGuide): string | undefined {
  return guide.href ?? guide.readOnlineHref;
}

function guideDownloadFilename(guide: HliFeaturedGuide): string | boolean | undefined {
  if (!guide.href || !guide.downloadAs) return undefined;
  return guide.downloadAs;
}

export function HliGuideCard({ guide, prominent, showThumbnail = false }: Props) {
  const actionHref = guideActionHref(guide);
  const download = guideDownloadFilename(guide);
  const showSecondaryLink = Boolean(guide.href && guide.readOnlineHref && guide.readOnlineLabel);

  return (
    <article
      className={
        prominent
          ? "relative flex h-full flex-col overflow-hidden rounded-card border border-[rgb(var(--gold))]/25 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(247,243,238,0.96)_100%)] p-8 shadow-[0_16px_44px_rgba(0,0,0,0.08)] sm:p-10"
          : "relative flex h-full flex-col overflow-hidden rounded-card border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(249,246,242,0.94)_100%)] p-6 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--gold))]/25 hover:shadow-card sm:p-7"
      }
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.12),transparent_70%)]"
        aria-hidden
      />
      {showThumbnail && guide.thumbnailSrc ? (
        <div className={prominent ? "relative mb-6 overflow-hidden rounded-[1.35rem] border border-[rgb(var(--border-soft))] bg-[rgb(var(--bg-subtle))]" : "relative mb-5 overflow-hidden rounded-[1.15rem] border border-[rgb(var(--border-soft))] bg-[rgb(var(--bg-subtle))]"}>
          <Image
            src={guide.thumbnailSrc}
            alt={guide.thumbnailAlt ?? ""}
            width={1200}
            height={780}
            className={prominent ? "aspect-[16/10] h-auto w-full object-cover" : "aspect-[16/10] h-auto w-full object-cover"}
            sizes={prominent ? "(max-width: 768px) 100vw, 960px" : "(max-width: 768px) 100vw, 420px"}
          />
        </div>
      ) : null}
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
            ? "relative mt-4 text-xl font-semibold leading-snug tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl"
            : "relative mt-3 text-lg font-semibold leading-snug tracking-tight text-[rgb(var(--text-primary))]"
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
