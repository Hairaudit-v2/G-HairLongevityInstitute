/** Matches secondary actions in `EditorialHeroCtas` for a consistent hero-adjacent control. */
const pdfLinkClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/20 bg-white/90 px-6 py-3 text-sm font-semibold text-medical shadow-[0_6px_18px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgb(var(--medical))]/5 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]";

export default function InsightArticlePdfLink({
  href,
  label = "Download patient guide PDF",
  fileSize,
}: {
  href: string;
  label?: string;
  fileSize?: string;
}) {
  const sizeSuffix = fileSize ? ` (${fileSize})` : "";

  return (
    <div className="mt-6 rounded-[1.25rem] border border-[rgb(var(--border-soft))] bg-white/85 p-4 shadow-soft">
      <p className="text-sm text-[rgb(var(--text-muted))]">
        Prefer a printable version? Download the PDF.
      </p>
      <div className="mt-3">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          download
          className={pdfLinkClass}
        >
          {label}
          {sizeSuffix}
        </a>
      </div>
    </div>
  );
}
