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
} from "@/components/public/PublicCTA";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
      {children}
    </span>
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,167,94,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(79,107,99,0.10),transparent_55%)]" />
        <Container>
          <div className="grid items-center gap-12 py-14 md:grid-cols-2 md:gap-16 md:py-20">
            <div>
              <div className="flex flex-wrap gap-3">
                <Pill>30+ years international clinical experience</Pill>
                <Pill>Biology-driven hair strategy</Pill>
                <Pill>Powered by Follicle Intelligence™</Pill>
              </div>

              <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.1]">
                Biology first.
                <span className="mt-2 block text-[rgb(var(--gold))]">
                  Hair for life.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                Advanced hormone mapping, blood analysis, and regenerative hair
                strategy — delivered globally through our structured assessment
                platform and Follicle Intelligence™ framework.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <PrimaryButton href={startHref}>
                  Start your assessment
                </PrimaryButton>
                <SecondaryButton href="/book">
                  Book specialist consultation
                </SecondaryButton>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-white/55">
                We provide structured biological interpretation and strategy.
                Prescriptions, where required, must be obtained via your local
                doctor or a partnered prescriber.
              </p>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 sm:p-8">
                <div className="flex items-center gap-4">
                  <img
                    src="/brand/hli-mark.png"
                    alt="HLI"
                    width={56}
                    height={56}
                    className="h-14 w-14"
                  />
                  <div>
                    <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">
                      YOUR OUTPUTS
                    </p>
                    <p className="text-xl font-semibold text-white">
                      Hair Longevity Score™
                    </p>
                  </div>
                </div>

                <ul className="mt-6 grid gap-3 sm:mt-8 sm:gap-4">
                  {[
                    "DHT Risk Index™",
                    "Follicle Stability Rating™",
                    "Regenerative Urgency Level™",
                    "Personalised Hair Longevity Roadmap",
                  ].map((label) => (
                    <li
                      key={label}
                      className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3.5 text-sm text-white/85 sm:px-5 sm:py-4"
                    >
                      {label}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4 sm:mt-8 sm:p-5">
                  <p className="text-sm text-white/70">Typical turnaround</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust bar */}
      <section className="border-y border-white/10 bg-black/10 py-6">
        <Container>
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

      {/* Platform: your care pathway */}
      <section className="py-[var(--section-py)] md:py-[var(--section-py-lg)]">
        <Container>
          <SectionTitle
            eyebrow="Your care pathway"
            title="A structured platform, not just a clinic."
            subtitle="From first assessment to ongoing continuity — one clear journey with specialist review and your summary when ready."
          />
          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Assessment",
                body: "Complete a guided intake: your history, concerns, medications, and goals. No referral required.",
              },
              {
                step: "2",
                title: "Uploads",
                body: "Securely upload blood tests (PDF or images), hair photos, and any supporting documents.",
              },
              {
                step: "3",
                title: "Triage",
                body: "Your case is prioritised and routed to a senior trichologist for review.",
              },
              {
                step: "4",
                title: "Specialist review",
                body: "30+ years experience. Blood interpretation, Follicle Intelligence™ mapping, and strategy design.",
              },
              {
                step: "5",
                title: "Summary release",
                body: "Your personalised diagnostic summary and roadmap are released to you — typically within 48 hours.",
              },
              {
                step: "6",
                title: "Continuity care",
                body: "Return to your patient portal for follow-up, blood-result uploads, and reassessments over time.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
              >
                <span className="text-sm font-semibold tracking-widest text-[rgb(var(--gold))]">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          {useLongevity && (
            <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
              <PrimaryButton href={startHref}>Start your assessment</PrimaryButton>
              <SecondaryButton href="/portal">Open patient portal</SecondaryButton>
            </div>
          )}
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
          <div className="mt-10 flex flex-wrap gap-3 sm:mt-12">
            <PrimaryButton href={startHref}>Start your assessment</PrimaryButton>
            <SecondaryButton href="/book">Book consultation</SecondaryButton>
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
          <div className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-3">
            {[
              {
                name: "Digital Diagnostic Review",
                price: "From $59",
                items: [
                  "Structured blood analysis",
                  "Risk profiling + summary",
                  "Written recommendations",
                  "48-hour turnaround",
                ],
                cta: { label: "Start review", href: startHref },
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
                cta: { label: "Book consultation", href: "/book" },
              },
              {
                name: "Hair Longevity Membership",
                price: "$49 / month",
                items: [
                  "Ongoing optimisation",
                  "6-month reassessments",
                  "Score tracking over time",
                  "Priority support",
                ],
                cta: { label: "Join membership", href: "/membership" },
              },
            ].map((p) => (
              <div
                key={p.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 sm:p-7"
              >
                <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                <p className="mt-2 text-[rgb(var(--gold))]">{p.price}</p>
                <ul className="mt-6 space-y-2 text-sm text-white/75">
                  {p.items.map((i) => (
                    <li key={i}>• {i}</li>
                  ))}
                </ul>
                <div className="mt-8">
                  <PrimaryButton href={p.cta.href}>{p.cta.label}</PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-[var(--section-py)] md:py-[var(--section-py-lg)]"
      >
        <Container>
          <SectionTitle
            eyebrow="FAQ"
            title="Clear expectations."
            subtitle="Structured biological interpretation and strategy, designed to support long-term decision-making."
          />
          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2">
            {[
              {
                q: "Can you prescribe medication?",
                a: "We provide interpretation and guidance. Prescriptions, where required, must be obtained via your local doctor or a partnered prescriber.",
              },
              {
                q: "Is this suitable if I'm on TRT?",
                a: "Yes. TRT-related androgen exposure and DHT risk mapping are a key focus of our analysis and strategy design.",
              },
              {
                q: "Do you support women's hair loss?",
                a: "Yes. We regularly assess diffuse loss patterns, iron/thyroid status, hormonal balance, and stress-driven shedding.",
              },
              {
                q: "How fast will I receive my report?",
                a: "Most digital diagnostic reviews are delivered within 48 hours after we receive complete data.",
              },
            ].map((f) => (
              <div
                key={f.q}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7"
              >
                <h3 className="text-base font-semibold text-white">{f.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {f.a}
                </p>
              </div>
            ))}
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
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <PrimaryButton href={startHref}>
                  Start your assessment
                </PrimaryButton>
                <SecondaryButton href="/book">
                  Book specialist consultation
                </SecondaryButton>
                {useLongevity && (
                  <SecondaryButton href="/portal">
                    Patient portal
                  </SecondaryButton>
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
