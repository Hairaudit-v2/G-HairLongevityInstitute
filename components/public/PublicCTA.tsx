import Link from "next/link";

/** Primary CTA — gold accent, soft shadow, medical-grade */
export function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--text-primary))] shadow-soft transition hover:opacity-92 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] ${className}`}
    >
      {children}
    </Link>
  );
}

/** Secondary — muted medical (blue-green) border, calm */
export function SecondaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-btn border border-[rgb(var(--medical))]/30 bg-white px-6 py-3 text-sm font-semibold text-[rgb(var(--medical))] shadow-soft transition hover:bg-[rgb(var(--medical))]/5 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] ${className}`}
    >
      {children}
    </Link>
  );
}

/** Lower-priority / utility actions */
export function UtilityLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg text-sm font-medium text-[rgb(var(--text-secondary))] transition hover:text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))]/30 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] ${className}`}
    >
      {children}
    </Link>
  );
}

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>;
}

/** Section titles — large readable headings, relaxed subtitle */
export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">
          {eyebrow.toUpperCase()}
        </p>
      ) : null}
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
