// app/page.tsx
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import {
  Container,
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
  UtilityLink,
} from "@/components/public/PublicCTA";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium tracking-wide text-white/70 sm:text-sm sm:text-white/80">
      {children}
    </span>
  );
}

const PLATFORM_STEPS = [
  { label: "Assessment", short: "Assess" },
  { label: "Uploads", short: "Upload" },
  { label: "Triage", short: "Triage" },
  { label: "Specialist review", short: "Review" },
  { label: "Summary release", short: "Summary" },
];

function HeroPlatformPreview() {
  return (
    <div
      className="relative"
      aria-hidden
    >
      {/* Soft glow behind main card */}
      <div
        className="absolute -inset-px rounded-[1.25rem] bg-gradient-to-b from-[rgb(var(--gold))]/10 via-transparent to-transparent opacity-60"
        style={{ filter: "blur(12px)" }}
      />
      <div className="absolute inset-0 rounded-[1.25rem] bg-[rgb(var(--gold))]/[0.03]" style={{ filter: "blur(20px)" }} />

      <div className="relative rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45),0_1px_0_0_rgba(255,255,255,0.06)_inset,0_0_0_1px_rgba(255,255,255,0.04)] sm:p-5 md:p-6">
        {/* Platform flow — compact on mobile, more breathing room on desktop */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]/90 sm:text-xs">
          Your pathway
        </p>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5">
          {PLATFORM_STEPS.map((step, i) => (
            <span
              key={step.label}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 backdrop-blur-sm sm:px-3.5 sm:py-2 sm:text-[13px]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[rgb(var(--gold))]/10 text-[10px] font-semibold text-[rgb(var(--gold))] sm:h-6 sm:w-6 sm:text-xs">
                {i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.short}</span>
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent sm:mt-5" />

        {/* Outputs — premium card within card */}
        <div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4 shadow-lg shadow-black/20 sm:mt-5 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--gold))]/15 sm:h-[4.5rem] sm:w-[4.5rem]">
              <img
                src="/brand/hli-mark.png"
                alt=""
                width={64}
                height={64}
                className="h-11 w-11 object-contain opacity-95 sm:h-12 sm:w-12"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[rgb(var(--gold))]/90 sm:text-xs">
                Your outputs
              </p>
              <p className="text-lg font-semibold text-white sm:text-xl">
                Hair Longevity Score™
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
            {[
              "DHT Risk Index™",
              "Follicle Stability Rating™",
              "Regenerative Urgency Level™",
              "Personalised roadmap",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5 text-xs text-white/85 sm:px-4 sm:py-3 sm:text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 sm:mt-5 sm:px-4 sm:py-3.5">
            <span className="text-xs text-white/60 sm:text-sm">Typical turnaround</span>
            <span className="text-lg font-semibold text-white sm:text-xl">48 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const CARE_PATHWAY_STEPS = [
  {
    step: 1,
    title: "Assessment",
    why: "We capture your full picture so nothing is missed.",
    body: "Guided intake: your history, concerns, medications, and goals. No referral required.",
  },
  {
    step: 2,
    title: "Uploads",
    why: "Your data stays secure and gives us a precise baseline.",
    body: "Blood tests (PDF or images), hair photos, and supporting documents — all encrypted.",
  },
  {
    step: 3,
    title: "Triage",
    why: "Every case reaches a senior specialist — no wrong queue.",
    body: "Your case is prioritised and routed to a trichologist with 30+ years experience.",
  },
  {
    step: 4,
    title: "Specialist review",
    why: "One expert interprets everything through a hair-longevity lens.",
    body: "Blood interpretation, Follicle Intelligence™ mapping, and strategy design.",
  },
  {
    step: 5,
    title: "Summary release",
    why: "You get a clear roadmap, not a stack of printouts.",
    body: "Your personalised diagnostic summary and roadmap — typically within 48 hours.",
  },
  {
    step: 6,
    title: "Continuity care",
    why: "We track changes over time so your strategy evolves with you.",
    body: "Return to your portal for follow-up, blood-result uploads, and reassessments.",
  },
] as const;

function CarePathwaySection({
  startHref,
  useLongevity,
}: {
  startHref: string;
  useLongevity: boolean;
}) {
  return (
    <section
      className="relative overflow-hidden border-t border-white/[0.06] py-[var(--section-py)] md:py-[var(--section-py-lg)]"
      aria-labelledby="care-pathway-heading"
    >
      {/* Subtle ambient background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(198,167,94,0.04),transparent_60%)]"
        aria-hidden
      />

      <Container>
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
            Your care pathway
          </p>
          <h2
            id="care-pathway-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            A structured platform, not just a clinic.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
            Six steps. One journey. From first assessment to ongoing continuity —
            guided at every step so you always know where you stand.
          </p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[rgb(var(--gold))]/90" role="doc-subtitle">
            One path. No conflicting advice.
          </p>
        </header>

        {/* Timeline — vertical on mobile, horizontal on desktop */}
        <div className="mt-12 sm:mt-16">
          {/* Desktop: horizontal journey strip with connecting line */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connecting line above cards */}
              <div
                className="absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-[rgb(var(--gold))]/30 to-transparent"
                aria-hidden
              />
              <div className="grid grid-cols-6 gap-4">
                {CARE_PATHWAY_STEPS.map((item, i) => (
                  <div key={item.step} className="relative flex flex-col items-center">
                    {/* Step node on the line */}
                    <div className="relative z-10 flex h-16 w-full items-center justify-center">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[rgb(var(--gold))]/40 bg-[rgb(var(--bg))] text-sm font-semibold text-[rgb(var(--gold))] shadow-[0_0_0_4px_rgba(15,27,45,1),0_0_20px_-4px_rgba(198,167,94,0.2)]"
                        aria-hidden
                      >
                        {item.step}
                      </span>
                    </div>
                    {/* Card */}
                    <div className="mt-2 flex w-full flex-1 flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.04)_inset] transition hover:border-white/[0.12] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
                      <h3 className="text-base font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs font-medium leading-snug text-[rgb(var(--gold))]/90">
                        {item.why}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-white/60">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile & tablet: vertical timeline */}
          <div className="lg:hidden">
            <ul className="space-y-0" role="list">
              {CARE_PATHWAY_STEPS.map((item, i) => (
                <li key={item.step} className="relative flex gap-4 sm:gap-5">
                  {/* Vertical line + node */}
                  <div className="flex shrink-0 flex-col items-center">
                    <span
                      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[rgb(var(--gold))]/40 bg-[rgb(var(--bg))] text-sm font-semibold text-[rgb(var(--gold))] shadow-[0_0_0_4px_rgba(15,27,45,1),0_0_16px_-4px_rgba(198,167,94,0.15)]"
                      aria-hidden
                    >
                      {item.step}
                    </span>
                    {i < CARE_PATHWAY_STEPS.length - 1 && (
                      <div
                        className="mt-1 min-h-[60px] w-px flex-1 bg-gradient-to-b from-[rgb(var(--gold))]/30 via-[rgb(var(--gold))]/15 to-transparent"
                        aria-hidden
                      />
                    )}
                  </div>
                  {/* Card */}
                  <div className="pb-10 sm:pb-12">
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-5">
                      <h3 className="text-lg font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-snug text-[rgb(var(--gold))]/90">
                        {item.why}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-white/65">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Closing line + CTAs */}
        <div className="mt-12 flex flex-col items-center gap-6 sm:mt-16">
          <p className="max-w-xl text-center text-sm text-white/60">
            This is structured care — not a one-off appointment. Your data, your
            timeline, and your ongoing strategy live in one place.
          </p>
          <p className="text-center text-xs font-medium uppercase tracking-[0.08em] text-white/45" aria-hidden>
            No referral required · Usually 48 hours to your summary
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
            <PrimaryButton href={startHref}>
              Start assessment
            </PrimaryButton>
            <SecondaryButton href="#how-it-works">
              See how it works
            </SecondaryButton>
            {useLongevity && (
              <UtilityLink href="/portal" className="sm:ml-1">
                Patient portal
              </UtilityLink>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function Page() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";
  const startLabel = "Start assessment";

  return (
    <main className="min-h-screen">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel={startLabel}
      />

      {/* Hero — premium health-tech */}
      <section className="relative overflow-hidden">
        {/* Ambient gradients — subtle depth */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="absolute -top-[40%] left-1/2 h-[80%] w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(198,167,94,0.14),transparent_55%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(79,107,99,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />
        </div>

        <Container>
          <div className="grid items-center gap-14 py-16 sm:py-20 md:grid-cols-2 md:gap-20 md:py-24 lg:py-28 lg:gap-24">
            {/* Left: copy — first on mobile, left on desktop */}
            <div className="relative order-1">
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                <Pill>30+ years international clinical experience</Pill>
                <Pill>Biology-driven hair strategy</Pill>
                <Pill>Powered by Follicle Intelligence™</Pill>
              </div>

              <h1 className="mt-8 text-4xl font-light tracking-tight text-white sm:mt-10 sm:text-5xl md:text-6xl lg:text-[3.25rem] lg:leading-[1.15]">
                Biology first.
                <span className="mt-2 block font-semibold text-[rgb(var(--gold))]">
                  Hair for life.
                </span>
              </h1>
              <p className="mt-4 text-sm font-medium tracking-wide text-white/65 sm:text-base" role="doc-subtitle">
                Clarity on what&apos;s driving your hair — and a clear path forward.
              </p>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:mt-8 sm:text-xl">
                Your biology, mapped. Your strategy, clear. Your hair, protected
                for the long term.
              </p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
                Structured assessment, specialist review, and a roadmap you can
                trust — typically within 48 hours.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-4">
                <PrimaryButton href={startHref}>
                  Start assessment
                </PrimaryButton>
                <SecondaryButton href="#how-it-works">
                  See how it works
                </SecondaryButton>
              </div>
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:mt-5">
                <UtilityLink href="/book">Book specialist consultation</UtilityLink>
                {useLongevity && (
                  <>
                    <span className="text-white/30" aria-hidden>·</span>
                    <UtilityLink href="/portal">Patient portal</UtilityLink>
                  </>
                )}
              </p>
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.08em] text-white/45 sm:mt-6" aria-hidden>
                No referral required · Typically 48 hours to your summary
              </p>

              <p className="mt-8 text-xs leading-relaxed text-white/50 sm:mt-10">
                We provide structured biological interpretation and strategy.
                Prescriptions, where required, must be obtained via your local
                doctor or a partnered prescriber.
              </p>
            </div>

            {/* Right: platform preview — second on mobile, right on desktop */}
            <div className="relative order-2 md:pl-4">
              <HeroPlatformPreview />
            </div>
          </div>
        </Container>
      </section>

      {/* Returning user entry — visible, not overpowering */}
      {useLongevity && (
        <section className="border-b border-white/10 bg-black/5 py-4">
          <Container>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-white/65">
              <span>Already have an account?</span>
              <Link href="/login/patient" className="font-medium text-[rgb(var(--gold))] hover:underline">
                Patient login
              </Link>
              <span className="text-white/30" aria-hidden>·</span>
              <Link href="/login/trichologist" className="font-medium text-white/80 hover:underline">
                Trichologist portal
              </Link>
            </p>
          </Container>
        </section>
      )}

      {/* Trust bar */}
      <section className="border-y border-white/10 bg-black/10 py-6">
        <Container>
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.08em] text-white/50 sm:mb-5 sm:text-sm">
            Focus on your next step — we handle the rest.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center text-sm text-white/75 sm:justify-between sm:gap-6">
            <span className="flex items-center justify-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--gold))]/15 text-[rgb(var(--gold))]">
                <LockIcon />
              </span>
              Secure uploads &amp; encrypted data
            </span>
            <span className="flex items-center justify-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--gold))]/15 text-[rgb(var(--gold))]">
                <BadgeIcon />
              </span>
              30+ years specialist experience
            </span>
            <span className="flex items-center justify-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--gold))]/15 text-[rgb(var(--gold))]">
                <ClockIcon />
              </span>
              48-hour diagnostic turnaround
            </span>
            <span className="flex items-center justify-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--gold))]/15 text-[rgb(var(--gold))]">
                <DocIcon />
              </span>
              Interpretation only — no prescription dependency
            </span>
          </div>
        </Container>
      </section>

      {/* Your care pathway — signature premium timeline */}
      <CarePathwaySection startHref={startHref} useLongevity={useLongevity} />

      {/* Why patients choose HLI — motivation & emotional relevance */}
      <section
        className="relative overflow-hidden border-t border-white/[0.06] py-[var(--section-py)] md:py-[var(--section-py-lg)]"
        aria-labelledby="why-patients-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(79,107,99,0.04),transparent_55%)]"
          aria-hidden
        />
        <Container>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
              Why patients choose us
            </p>
            <h2
              id="why-patients-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Why patients choose Hair Longevity Institute
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              People come to us when they want clearer answers, less guesswork,
              and a sense of forward direction — not another product push.
            </p>
            <div className="mt-5 border-l-2 border-[rgb(var(--gold))]/50 pl-4 py-0.5" role="presentation" aria-hidden>
              <p className="text-base font-semibold tracking-wide text-[rgb(var(--gold))]/95">
                Where clarity replaces the noise.
              </p>
            </div>
          </header>

          <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                benefit: "Stop piecing together conflicting advice",
                capability:
                  "One structured interpretation from your bloods, history, and goals. One roadmap — so you're not left comparing forums, ads, and conflicting opinions.",
              },
              {
                benefit: "Organise the signals that matter",
                capability:
                  "We don't fixate on a single number. Our framework maps the biological domains that actually affect your hair, so you see what's relevant and what's noise.",
              },
              {
                benefit: "A process that leaves nothing to chance",
                capability:
                  "Guided assessment, secure uploads, specialist review, and a summary you can trust. Each step is designed so the important details aren't missed.",
              },
              {
                benefit: "Move forward with greater clarity",
                capability:
                  "You get a clear next step and a place to return. Follow-up, reassessments, and continuity care so your strategy evolves with you over time.",
              },
            ].map((card) => (
              <div
                key={card.benefit}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)_inset] transition hover:border-white/[0.12] sm:p-6"
              >
                <h3 className="text-lg font-semibold text-white">
                  {card.benefit}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {card.capability}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm font-semibold uppercase tracking-[0.08em] text-[rgb(var(--gold))]/80 sm:mt-12" aria-hidden>
            That&apos;s why we built it this way.
          </p>
        </Container>
      </section>

      {/* Inside the platform — product preview */}
      <section
        className="relative overflow-hidden border-t border-white/[0.06] py-[var(--section-py)] md:py-[var(--section-py-lg)]"
        aria-labelledby="inside-platform-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(198,167,94,0.03),transparent_65%)]"
          aria-hidden
        />
        <Container>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
              Inside the platform
            </p>
            <h2
              id="inside-platform-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              A real system for your care journey
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              Assessment progress, uploads, review status, and your summary —
              all in one place. This is what the platform looks like in practice.
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/70" role="doc-subtitle">
              You always see where your case stands.
            </p>
          </header>

          {/* Mock interface — single “window” */}
          <div className="mx-auto mt-12 max-w-4xl sm:mt-16">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04)_inset]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/20 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
                </div>
                <span className="ml-2 text-xs font-medium text-white/50">
                  Patient portal — example view
                </span>
              </div>

              {/* Content grid */}
              <div className="grid gap-0 md:grid-cols-12">
                {/* Left: Progress */}
                <div className="border-b border-white/[0.06] p-4 md:col-span-4 md:border-b-0 md:border-r md:border-white/[0.06] md:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    Your progress
                  </p>
                  <ul className="mt-4 space-y-3" role="list" aria-hidden>
                    {[
                      { label: "Assessment", status: "complete" },
                      { label: "Uploads", status: "complete" },
                      { label: "Triage", status: "complete" },
                      { label: "Specialist review", status: "in progress" },
                      { label: "Summary", status: "pending" },
                    ].map((item) => (
                      <li key={item.label} className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                            item.status === "complete"
                              ? "bg-[rgb(var(--gold))]/20 text-[rgb(var(--gold))]"
                              : item.status === "in progress"
                                ? "border border-[rgb(var(--gold))]/40 bg-[rgb(var(--gold))]/10 text-[rgb(var(--gold))]"
                                : "bg-white/[0.06] text-white/40"
                          }`}
                          aria-hidden
                        >
                          {item.status === "complete" ? (
                            <CheckIcon className="h-3.5 w-3.5" />
                          ) : (
                            item.status === "in progress" ? "•" : "—"
                          )}
                        </span>
                        <span className="text-sm text-white/80">{item.label}</span>
                        {item.status === "complete" && (
                          <span className="ml-auto text-[10px] uppercase tracking-wider text-white/40">
                            Done
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Documents + Summary */}
                <div className="md:col-span-8 md:flex md:flex-col">
                  <div className="flex-1 border-b border-white/[0.06] p-4 md:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      Documents
                    </p>
                    <ul className="mt-3 space-y-2" role="list" aria-hidden>
                      {[
                        { name: "Blood panel", type: "PDF" },
                        { name: "Hair photos", type: "3 images" },
                        { name: "Medication list", type: "Submitted" },
                      ].map((doc) => (
                        <li
                          key={doc.name}
                          className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[10px] font-medium text-white/50">
                            {doc.type}
                          </span>
                          <span className="text-sm text-white/70">{doc.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 md:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      Your summary
                    </p>
                    <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                      <p className="text-sm text-white/60">
                        Diagnostic summary & roadmap — available after specialist review.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {["Hair Longevity Score™", "Next steps"].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-white/[0.06] bg-black/20 px-2.5 py-1 text-[11px] text-white/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continuity hint — bottom bar */}
              <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/10 px-4 py-2.5">
                <span className="text-[11px] text-white/40">
                  Follow-up assessments & continuity care in your portal
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/30">
                  Example only
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust & proof — deeper confidence layer */}
      <section
        className="relative overflow-hidden border-t border-white/[0.06] bg-black/10 py-[var(--section-py)] md:py-[var(--section-py-lg)]"
        aria-labelledby="trust-proof-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(198,167,94,0.03),transparent_60%)]"
          aria-hidden
        />
        <Container>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
              Trust & transparency
            </p>
            <h2
              id="trust-proof-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Built for confidence
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              From how your data is handled to how your summary is prepared —
              here’s what you can expect.
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/65" role="doc-subtitle">
              No surprises once you begin.
            </p>
          </header>

          {/* Trust cards */}
          <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Clinician-guided review",
                body: "Every case is reviewed by a senior trichologist with 30+ years experience. You receive a human interpretation and strategy — not algorithm-only output.",
              },
              {
                title: "Secure uploads & organised records",
                body: "Your documents and history are stored securely. You have one place for your assessments, uploads, and summaries — so nothing gets lost in the inbox.",
              },
              {
                title: "Structured summary release",
                body: "You receive a clear, written summary and roadmap — typically within 48 hours. Interpretation and next-step recommendations, not raw results without context.",
              },
              {
                title: "Continuity-based design",
                body: "The platform is built for follow-up. Reassessments, updated bloods, and ongoing strategy adjustments so your care doesn’t stop after one report.",
              },
              {
                title: "Experience & care philosophy",
                body: "Biology-first interpretation. We don’t prescribe; we map, interpret, and recommend. Where medication is needed, you work with your own doctor or a partnered prescriber.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-6"
              >
                <h3 className="text-base font-semibold text-white sm:text-lg">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          {/* What happens after you submit — compact strip */}
          <div className="mt-14 sm:mt-16">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-white/60">
              What happens after you submit
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:mt-8 md:flex-row md:items-center md:justify-center md:gap-0">
              {[
                { step: "1", label: "Received & triaged" },
                { step: "2", label: "Routed to specialist" },
                { step: "3", label: "Review & interpretation" },
                { step: "4", label: "Summary prepared" },
                { step: "5", label: "Released to you" },
              ].map((item, i) => (
                <div key={item.step} className="flex items-center">
                  <div className="flex items-center gap-3 md:flex-col md:gap-2 md:px-2">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--gold))]/30 bg-[rgb(var(--bg))] text-xs font-semibold text-[rgb(var(--gold))]"
                      aria-hidden
                    >
                      {item.step}
                    </span>
                    <span className="text-sm font-medium text-white/80 md:text-center md:text-xs lg:text-sm">
                      {item.label}
                    </span>
                  </div>
                  {i < 4 && (
                    <div
                      className="ml-4 h-px w-6 shrink-0 bg-white/15 md:ml-0 md:h-8 md:w-px md:flex-shrink-0"
                      aria-hidden
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-white/50 sm:mt-5">
              Typical turnaround: 48 hours from complete submission.
            </p>
          </div>

          {/* Summary preview mockup — no fake data */}
          <div className="mt-14 sm:mt-16">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-white/60">
              Your summary may include
            </p>
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-6">
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--gold))]/10">
                  <img src="/brand/hli-mark.png" alt="" width={56} height={56} className="h-9 w-9 object-contain opacity-90 sm:h-10 sm:w-10" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--gold))]/90">
                    Example structure
                  </p>
                  <p className="text-sm font-medium text-white/90">
                    Diagnostic summary & roadmap
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/50" aria-hidden />
                  Hair Longevity Score™ and risk indices
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/50" aria-hidden />
                  Written interpretation of relevant markers
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/50" aria-hidden />
                  Next-step recommendations
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/50" aria-hidden />
                  Guidance for follow-up or GP discussion
                </li>
              </ul>
              <p className="mt-4 text-xs text-white/50">
                We provide interpretation and strategy only. We do not diagnose, prescribe, or guarantee outcomes.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Problem */}
      <section className="border-t border-white/10 bg-black/10 py-[var(--section-py)] md:py-[var(--section-py-lg)]">
        <Container>
          <SectionTitle
            eyebrow="Why this exists"
            title="Hair loss is rarely caused by one factor."
            subtitle="It is influenced by androgen exposure, thyroid conversion, iron availability, cortisol load, inflammation, nutrient sufficiency, age-triggered receptor sensitivity, and medication interactions."
          />
          <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3">
            {[
              "Most people are treated with a single product.",
              "Most platforms sell medication, not clarity.",
              "Your biology deserves structured interpretation.",
            ].map((t) => (
              <div
                key={t}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 sm:p-6"
              >
                {t}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Approach */}
      <section className="py-[var(--section-py)] md:py-[var(--section-py-lg)]">
        <Container>
          <SectionTitle
            eyebrow="Our approach"
            title="Precision trichology, built for long-term stability."
            subtitle="Using Follicle Intelligence™, we assess five biological domains and convert complexity into clear, actionable strategy."
          />
          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {[
              "Androgen exposure",
              "Thyroid & metabolic function",
              "Inflammatory load",
              "Nutrient sufficiency",
              "Follicle integrity & pattern stability",
            ].map((d) => (
              <div
                key={d}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/85 sm:p-5"
              >
                {d}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works — simplified for conversion */}
      <section
        id="how-it-works"
        className="border-t border-white/10 bg-black/10 py-[var(--section-py)] md:py-[var(--section-py-lg)]"
      >
        <Container>
          <SectionTitle
            eyebrow="How it works"
            title="Three steps. No guesswork."
            subtitle="Start with your blood tests and hair photos. We deliver a structured diagnostic summary and strategy plan."
          />
          <div className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-3">
            {[
              {
                step: "Step 1",
                title: "Upload your data",
                body: "Securely upload blood tests, medications, supplements, and hair photographs. No referral required.",
              },
              {
                step: "Step 2",
                title: "Specialist review",
                body: "Your case is reviewed by a senior international trichologist with 30+ years of clinical experience.",
              },
              {
                step: "Step 3",
                title: "Receive your roadmap",
                body: "Within 48 hours you receive clear interpretation, a personalised strategy, and next-step recommendations.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7"
              >
                <span className="text-sm font-semibold tracking-widest text-[rgb(var(--gold))]">
                  {s.step}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center">
            <PrimaryButton href={startHref}>Start assessment</PrimaryButton>
            <SecondaryButton href="#how-it-works">See how it works</SecondaryButton>
            <UtilityLink href="/book">Book specialist consultation</UtilityLink>
          </div>
        </Container>
      </section>

      {/* Who it's for */}
      <section
        id="who-its-for"
        className="py-[var(--section-py)] md:py-[var(--section-py-lg)]"
      >
        <Container>
          <SectionTitle
            eyebrow="Who it's for"
            title="For people who want long-term control."
            subtitle="Ideal for early recession, TRT acceleration, diffuse thinning, postpartum loss, stress shedding, and post-transplant stability."
          />
          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2">
            {[
              "Men experiencing early recession or crown thinning",
              "Individuals on TRT or hormone optimisation programs",
              "Women with diffuse thinning or cycle-related shedding",
              "Postpartum hair loss and recovery planning",
              "High-stress professionals with sudden shedding",
              "Post-transplant maintenance and stability monitoring",
            ].map((x) => (
              <div
                key={x}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 sm:p-6"
              >
                {x}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Services */}
      <section
        id="services"
        className="border-t border-white/10 bg-black/10 py-[var(--section-py)] md:py-[var(--section-py-lg)]"
      >
        <Container>
          <SectionTitle
            eyebrow="Services"
            title="Choose your level of support."
            subtitle="Start with a diagnostic review, then escalate to specialist consultation and ongoing membership if needed."
          />
          <div className="mt-12 grid gap-6 sm:mt-14 md:grid-cols-3 md:gap-8">
            {[
              {
                name: "Digital Diagnostic Review",
                price: "From $25",
                items: [
                  "Structured blood analysis",
                  "Risk profiling + summary",
                  "Written recommendations",
                  "48-hour turnaround",
                ],
                cta: { label: "Start Review", href: startHref },
              },
              {
                name: "Specialist Strategy Consultation",
                price: "From $199",
                items: [
                  "Full interpretation + roadmap",
                  "45-min consult (Zoom)",
                  "Protocol plan + GP guidance",
                  "Regenerative & timing advice",
                ],
                cta: { label: "Book Consultation", href: "/book" },
              },
              {
                name: "Hair Longevity Membership",
                price: "$19 / month",
                items: [
                  "Ongoing optimisation",
                  "6-month reassessments",
                  "Score tracking over time",
                  "Priority support",
                ],
                cta: { label: "Join Membership", href: "/membership" },
              },
            ].map((p) => (
              <div
                key={p.name}
                className="flex flex-col rounded-3xl border border-white/[0.12] bg-white/[0.04] p-6 shadow-xl shadow-black/20 sm:p-8 md:min-h-0"
              >
                <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {p.name}
                </h3>
                <p className="mt-3 text-lg font-semibold text-[rgb(var(--gold))] sm:text-xl">
                  {p.price}
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm leading-relaxed text-white/80 sm:mt-8 sm:space-y-3.5">
                  {p.items.map((i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 text-[rgb(var(--gold))]/80" aria-hidden>•</span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-2 sm:mt-10">
                  <PrimaryButton href={p.cta.href}>{p.cta.label}</PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ — strategic, conversion-oriented */}
      <section
        id="faq"
        className="border-t border-white/[0.06] py-[var(--section-py)] md:py-[var(--section-py-lg)]"
        aria-labelledby="faq-heading"
      >
        <Container>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
              FAQ
            </p>
            <h2
              id="faq-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Questions we hear often
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              Clear expectations help you decide. Here are the answers that
              matter most before you start.
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/65" role="doc-subtitle">
              The first step is easier when you have answers.
            </p>
          </header>

          <div className="mx-auto mt-12 max-w-3xl space-y-3 sm:mt-16">
            {[
              {
                q: "What is Hair Longevity Institute?",
                a: "Hair Longevity Institute is a structured patient platform for hair-related biological assessment and strategy. We combine a guided intake, secure document uploads, and specialist review by a senior trichologist (30+ years experience) to deliver a clear interpretation of your bloods, history, and goals — and a roadmap for next steps. We focus on interpretation and strategy, not prescriptions or one-off consultations.",
              },
              {
                q: "Is this just an online consultation?",
                a: "No. It’s a full pathway: you complete an assessment, upload bloods and photos, your case is triaged and reviewed by a specialist, and you receive a written summary and roadmap — typically within 48 hours. You can also book a live specialist consultation if you want a deeper discussion. The platform is built so you can return for follow-up and reassessments over time.",
              },
              {
                q: "What happens after I submit?",
                a: "Your case is triaged and routed to a senior trichologist. They review your intake, bloods, and photos using our Follicle Intelligence™ framework, then prepare a structured diagnostic summary and next-step recommendations. You receive this in your portal (and by email where applicable), usually within 48 hours of us having everything we need. You'll see status in your portal — you’ll know when it’s with the specialist and when your summary is ready.",
              },
              {
                q: "What do I need before I start?",
                a: "A few minutes for the guided intake, and whatever you already have: recent blood tests (if any), hair photos (front, temples, crown — good lighting, no filters), and a rough idea of medications and supplements. You don’t need a referral. If you don’t have bloods yet, you can still start; we can outline what to ask your GP for and you can upload results later.",
              },
              {
                q: "Do I need blood tests already?",
                a: "Helpful but not mandatory to begin. The most useful interpretation comes when we have bloods (e.g. thyroid, iron, hormones, metabolic markers) and your history together. If you don’t have them yet, start the assessment anyway — we’ll indicate what’s most relevant for your situation and you can upload results when you have them, or request a support letter for your doctor.",
              },
              {
                q: "Is this useful if I have already tried treatment?",
                a: "Yes. Many of our patients have tried topical or oral treatments and want a clearer picture of what’s going on and what to do next. We map your biology in context — including current medications — and give you a structured view of risk indices, stability, and options. That can help you and your doctor decide on next steps without replacing your existing care.",
              },
              {
                q: "Can I upload previous results?",
                a: "Yes. You can upload past blood work, letters, or other relevant documents. Having a timeline of results helps us spot trends and give you a more informed interpretation. All uploads are secure and organised in your record so nothing gets lost.",
              },
              {
                q: "Will this support follow-up over time?",
                a: "Yes. The platform is built for continuity. You can return to your patient portal to upload new bloods, start a follow-up assessment, or track your care journey. We don’t treat the first summary as the end — reassessments and ongoing strategy are part of how the system is designed.",
              },
              {
                q: "Can you prescribe medication?",
                a: "We provide interpretation and strategy only. Prescriptions, where needed, must be obtained from your local doctor or a partnered prescriber. We focus on mapping your biology and giving you and your clinician clear, actionable guidance.",
              },
              {
                q: "Is this suitable if I'm on TRT?",
                a: "Yes. TRT-related androgen exposure and DHT risk are a core part of our framework. We regularly interpret bloods and history for people on TRT and factor that into your risk indices and next-step recommendations.",
              },
              {
                q: "Do you support women's hair loss?",
                a: "Yes. We assess diffuse thinning, cycle-related shedding, iron and thyroid status, and stress-driven loss. The same platform and specialist review apply — we tailor the interpretation to your context.",
              },
              {
                q: "How fast will I receive my summary?",
                a: "Most diagnostic summaries are delivered within 48 hours after we have your complete submission (intake plus any uploads we need). You’ll see status in your portal so you know when it’s in review and when it’s ready.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.03)_inset] transition hover:border-white/[0.12] open:border-white/[0.12] open:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
                  <span className="pr-2">{faq.q}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[rgb(var(--gold))] transition group-open:rotate-180" aria-hidden>
                    <ChevronDownIcon className="h-4 w-4" />
                  </span>
                </summary>
                <div className="border-t border-white/[0.06] px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
                  <p className="pt-4 text-sm leading-relaxed text-white/70 sm:text-[15px]">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center sm:mt-16">
            <p className="text-sm text-white/60">
              Ready to start?
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-white/45" aria-hidden>
              No referral needed · Typically 48 hours to your summary
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton href={startHref}>Start assessment</PrimaryButton>
              <SecondaryButton href="#how-it-works">See how it works</SecondaryButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section
        id="start"
        className="border-t border-white/10 bg-black/10 py-[var(--section-py)] md:py-[var(--section-py-lg)]"
      >
        <Container>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-[rgb(var(--gold))]">
                  START TODAY
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Understand your biology. Protect your hair long-term.
                </h2>
                <p className="mt-4 text-white/75">
                  Begin with a structured diagnostic review. Escalate to
                  specialist consultation for a deeper roadmap and ongoing
                  optimisation.
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-white/45" aria-hidden>
                  No referral required · Typically 48 hours to your summary
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
                <PrimaryButton href={startHref}>
                  Start assessment
                </PrimaryButton>
                <SecondaryButton href="#how-it-works">
                  See how it works
                </SecondaryButton>
                <UtilityLink href="/book">Book specialist consultation</UtilityLink>
                {useLongevity && (
                  <UtilityLink href="/portal">Patient portal</UtilityLink>
                )}
              </div>
            </div>
          </div>

          <PublicFooter />
        </Container>
      </section>
    </main>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
function BadgeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
