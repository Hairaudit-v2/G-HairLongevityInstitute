// app/page.tsx
import Link from "next/link";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6">{children}</div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
      {children}
    </div>
  );
}

function SectionTitle({
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
        <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
          {eyebrow.toUpperCase()}
        </div>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl bg-[rgb(var(--gold))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))] shadow-lg shadow-black/20 transition hover:opacity-90"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

export default function Page() {
  return (
    <main>
      {/* Top bar */}
      <header className="border-b border-white/10 bg-black/10">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <img
                src="/brand/hli-logo.png"
                alt="Hair Longevity Institute"
                width={220}
                height={44}
                className="h-11 w-auto"
              />
            </div>

            <nav className="hidden items-center gap-6 text-sm text-white/75 md:flex">
              <Link className="hover:text-white" href="/about">
                About
              </Link>
              <a className="hover:text-white" href="#how-it-works">
                How it works
              </a>
              <a className="hover:text-white" href="#who-its-for">
                Who it’s for
              </a>
              <a className="hover:text-white" href="#services">
                Services
              </a>
              <a className="hover:text-white" href="#faq">
                FAQ
              </a>
              <PrimaryButton href="#start">Start</PrimaryButton>
            </nav>

            <div className="md:hidden">
              <PrimaryButton href="#start">Start</PrimaryButton>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,167,94,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(79,107,99,0.10),transparent_55%)]" />
        <Container>
          <div className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
            <div>
              <div className="flex flex-wrap gap-3">
                <Pill>30+ Years International Clinical Experience</Pill>
                <Pill>Biology-Driven Hair Strategy</Pill>
                <Pill>Powered by Follicle Intelligence™</Pill>
              </div>

              <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Biology First.
                <span className="block text-[rgb(var(--gold))]">Hair for Life.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
                Advanced hormone mapping, blood analysis, and regenerative hair strategy —
                delivered globally through our proprietary Follicle Intelligence™ framework.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {/* Replace these hrefs with real routes when you build them */}
                <PrimaryButton href="/start">Start Your Diagnostic Review</PrimaryButton>
                <SecondaryButton href="/book">Book Specialist Consultation</SecondaryButton>
              </div>

              <div className="mt-6 text-xs text-white/55">
                Note: We provide structured biological interpretation and strategy. Prescriptions, where
                required, must be obtained via your local doctor or a partnered prescriber.
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30">
                <div className="flex items-center gap-4">
                  <img
                    src="/brand/hli-mark.png"
                    alt="HLI Mark"
                    width={64}
                    height={64}
                  />
                  <div>
                    <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
                      OUTPUTS
                    </div>
                    <div className="text-xl font-semibold text-white">
                      Hair Longevity Score™
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  {[
                    "DHT Risk Index™",
                    "Follicle Stability Rating™",
                    "Regenerative Urgency Level™",
                    "Personalised Hair Longevity Roadmap",
                  ].map((x) => (
                    <div
                      key={x}
                      className="rounded-2xl border border-white/10 bg-black/10 px-5 py-4 text-white/85"
                    >
                      {x}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-black/10 p-5">
                  <div className="text-sm text-white/70">
                    Typical turnaround
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    48 hours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Problem */}
      <section className="border-t border-white/10 bg-black/10 py-16">
        <Container>
          <SectionTitle
            eyebrow="Why this exists"
            title="Hair loss is rarely caused by one factor."
            subtitle="It is influenced by androgen exposure, thyroid conversion, iron availability, cortisol load, inflammation, nutrient sufficiency, age-triggered receptor sensitivity, and medication interactions."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              "Most people are treated with a single product.",
              "Most platforms sell medication, not clarity.",
              "Your biology deserves structured interpretation.",
            ].map((t) => (
              <div
                key={t}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80"
              >
                {t}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Approach */}
      <section className="py-16">
        <Container>
          <SectionTitle
            eyebrow="Our approach"
            title="Precision trichology, built for long-term stability."
            subtitle="Using Follicle Intelligence™, we assess five biological domains and convert complexity into clear, actionable strategy."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {[
              "Androgen Exposure",
              "Thyroid & Metabolic Function",
              "Inflammatory Load",
              "Nutrient Sufficiency",
              "Follicle Integrity & Pattern Stability",
            ].map((d) => (
              <div
                key={d}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/85"
              >
                {d}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/10 bg-black/10 py-16">
        <Container>
          <SectionTitle
            eyebrow="How it works"
            title="Three steps. No guesswork."
            subtitle="Start with your blood tests and hair photos. We deliver a structured diagnostic summary and strategy plan."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
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
                className="rounded-3xl border border-white/10 bg-white/5 p-7"
              >
                <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
                  {s.step}
                </div>
                <div className="mt-3 text-xl font-semibold text-white">
                  {s.title}
                </div>
                <div className="mt-3 text-sm leading-relaxed text-white/75">
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Who it's for */}
      <section id="who-its-for" className="py-16">
        <Container>
          <SectionTitle
            eyebrow="Who it’s for"
            title="For people who want long-term control."
            subtitle="Ideal for early recession, TRT acceleration, diffuse thinning, postpartum loss, stress shedding, and post-transplant stability."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
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
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80"
              >
                {x}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Services */}
      <section id="services" className="border-t border-white/10 bg-black/10 py-16">
        <Container>
          <SectionTitle
            eyebrow="Services"
            title="Choose your level of support."
            subtitle="Start with a diagnostic review, then escalate to specialist consultation and ongoing membership if needed."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
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
                cta: { label: "Start Review", href: "/start" },
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
                price: "$49 / month",
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
                className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20"
              >
                <div className="text-xl font-semibold text-white">{p.name}</div>
                <div className="mt-2 text-[rgb(var(--gold))]">{p.price}</div>
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
      <section id="faq" className="py-16">
        <Container>
          <SectionTitle
            eyebrow="FAQ"
            title="Clear expectations."
            subtitle="This is structured biological interpretation and strategy, designed to support long-term decision-making."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "Can you prescribe medication?",
                a: "We provide interpretation and guidance. Prescriptions, where required, must be obtained via your local doctor or a partnered prescriber.",
              },
              {
                q: "Is this suitable if I’m on TRT?",
                a: "Yes. TRT-related androgen exposure and DHT risk mapping are a key focus of our analysis and strategy design.",
              },
              {
                q: "Do you support women’s hair loss?",
                a: "Yes. We regularly assess diffuse loss patterns, iron/thyroid status, hormonal balance, and stress-driven shedding.",
              },
              {
                q: "How fast will I receive my report?",
                a: "Most digital diagnostic reviews are delivered within 48 hours after we receive complete data.",
              },
            ].map((f) => (
              <div
                key={f.q}
                className="rounded-3xl border border-white/10 bg-white/5 p-7"
              >
                <div className="text-base font-semibold text-white">{f.q}</div>
                <div className="mt-3 text-sm leading-relaxed text-white/75">
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section id="start" className="border-t border-white/10 bg-black/10 py-16">
        <Container>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <div className="text-sm tracking-widest text-[rgb(var(--gold))]">
                  START TODAY
                </div>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  Understand your biology. Protect your hair long-term.
                </h3>
                <p className="mt-4 text-white/75">
                  Begin with a structured diagnostic review. Escalate to specialist consultation if you
                  want a deeper roadmap and ongoing optimisation.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <PrimaryButton href="/start">Start Your Diagnostic Review</PrimaryButton>
                <SecondaryButton href="/book">Book Specialist Consultation</SecondaryButton>
              </div>
            </div>
          </div>

          <footer className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/55 md:flex-row">
            <div className="flex items-center gap-3">
              <img
                src="/brand/hli-mark.png"
                alt="Hair Longevity Institute mark"
                width={28}
                height={28}
              />
              <div>© {new Date().getFullYear()} Hair Longevity Institute™</div>
            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link href="/disclaimer" className="hover:text-white">
                Disclaimer
              </Link>
            </div>
          </footer>
        </Container>
      </section>
    </main>
  );
}
