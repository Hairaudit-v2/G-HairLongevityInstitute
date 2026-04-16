/** Matches secondary actions in `EditorialHeroCtas` for a consistent hero-adjacent control. */
const pdfLinkClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/30 px-6 py-3 text-sm font-semibold text-medical hover:bg-medical/5 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]";

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
    <div className="mt-6">
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
