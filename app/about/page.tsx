// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import AnimatedFollicleSystemMap from "@/components/AnimatedFollicleSystemMap";
import SurgicalReadinessMatrixInteractive from "@/components/SurgicalReadinessMatrixInteractive";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, SectionTitle, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";

export const metadata: Metadata = {
  title: "About | Hair Longevity Institute™",
  description:
    "30+ years clinical experience. Biology-first strategy. International trichologist, surgical hair restoration, hormone mapping, and regenerative integration.",
};

export default function AboutPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen">
      <PublicHeader showLongevityLinks={useLongevity} ctaHref={startHref} ctaLabel="Start assessment" />

      {/* Hero */}
      <section className="relative overflow-hidden py-14 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,167,94,0.12),transparent_60%)]" />
        <Container>
          <div className="relative">
            <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">
              HAIR LONGEVITY INSTITUTE™
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              International Hair Longevity Specialist
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              Three decades of clinical experience.
              <br />
              Biology-first strategy.
              <br />
              No shortcuts. No gimmicks.
            </p>
          </div>
        </Container>
      </section>

      {/* Who I Am */}
      <section className="border-t border-white/10 bg-black/10 py-16">
        <Container>
          <SectionTitle
            eyebrow="Who I Am"
            title="Three decades at the intersection of trichology, surgery, and regenerative medicine."
            subtitle="For more than 30 years, I have worked at the intersection of trichology, surgical hair restoration, regenerative medicine, and hormone-related hair loss."
          />
          <div className="mt-8">
            <div className="text-sm font-medium text-white/90">My career has included:</div>
            <ul className="mt-4 space-y-2 text-white/80">
              <li>• International clinical practice</li>
              <li>• Surgical and non-surgical hair restoration</li>
              <li>• Advanced FUE techniques</li>
              <li>• Donor regeneration strategy</li>
              <li>• PRP and exosome integration</li>
              <li>• Hormone and DHT risk mapping</li>
              <li>• Post-transplant outcome auditing</li>
              <li>• Global training and medical standardisation</li>
            </ul>
            <p className="mt-8 text-base leading-relaxed text-white/80">
              I have worked with thousands of patients across multiple countries and have trained doctors
              internationally in advanced hair restoration protocols.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Hair Longevity Institute™ is the digital extension of that experience — designed to give
              structured biological clarity to patients anywhere in the world.
            </p>
          </div>
        </Container>
      </section>

      {/* Why This Platform Exists */}
      <section className="py-16">
        <Container>
          <SectionTitle
            eyebrow="Why This Platform Exists"
            title="Most people are sold a product."
            subtitle="Few people are given a structured interpretation of their biology."
          />
          <p className="mt-6 text-base leading-relaxed text-white/80">
            Hair loss is influenced by:
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "DHT sensitivity",
              "Age-triggered androgen receptor activation",
              "Thyroid conversion",
              "Iron sufficiency",
              "Cortisol load",
              "Inflammatory markers",
              "Nutrient optimisation",
              "Medication interactions",
              "Genetic predisposition",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/85"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-8 text-base leading-relaxed text-white/80">
            Without mapping these variables, treatment becomes guesswork.
          </p>
          <p className="mt-2 text-lg font-medium text-white">
            This platform removes guesswork.
          </p>
        </Container>
      </section>

      {/* The System Map */}
      <section className="border-t border-white/10 py-[var(--section-py)] md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">
            THE SYSTEM
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-white">
            The Hair Longevity System Map™
          </h2>

          <p className="mt-4 text-white/70 max-w-3xl">
            Hair loss is rarely caused by one variable.
            Follicle Intelligence™ maps five biological domains that determine long-term follicle survival.
          </p>

          <div className="mt-16">
            <AnimatedFollicleSystemMap />
          </div>
        </div>
      </section>

      {/* Surgical Readiness Matrix */}
      <section className="border-t border-white/10 py-[var(--section-py)] md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium tracking-[0.2em] text-[rgb(var(--gold))]">
            SURGICAL DECISIONING
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-white">
            Surgical Readiness Matrix™
          </h2>

          <p className="mt-4 max-w-3xl text-white/70">
            A visual framework used to determine whether surgery is appropriate now, later, or not at all —
            based on biological stability and progression rate.
          </p>

          <div className="mt-12">
            <SurgicalReadinessMatrixInteractive />
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="border-t border-white/10 bg-black/10 py-16">
        <Container>
          <SectionTitle
            eyebrow="What Makes This Different"
            title="Biology first. Hormone literacy. Surgical understanding."
          />

          <div className="mt-10 space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm tracking-widest text-[rgb(var(--gold))]">1</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Biology First</h3>
              <p className="mt-3 text-white/80">
                We analyse blood markers before recommending interventions.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm tracking-widest text-[rgb(var(--gold))]">2</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Hormone & DHT Literacy</h3>
              <p className="mt-3 text-white/80">
                Few practitioners truly understand androgen receptor behaviour, TRT acceleration risk, and
                follicle sensitivity thresholds. This is a core focus.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm tracking-widest text-[rgb(var(--gold))]">3</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Surgical Understanding</h3>
              <p className="mt-3 text-white/80">
                Because I have extensive surgical experience, I understand:
              </p>
              <ul className="mt-3 space-y-2 text-white/80">
                <li>• When to delay surgery</li>
                <li>• When to stabilise first</li>
                <li>• When density correction is appropriate</li>
                <li>• When donor protection is critical</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm tracking-widest text-[rgb(var(--gold))]">4</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Regenerative Strategy</h3>
              <p className="mt-3 text-white/80">
                PRP, exosomes, and regenerative therapies are not magic. They are tools — used correctly,
                at the correct time, for the correct biological environment.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm tracking-widest text-[rgb(var(--gold))]">5</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Independence</h3>
              <p className="mt-3 text-white/80">
                This platform does not exist to sell you medication. It exists to interpret your data.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Clinical Philosophy */}
      <section className="py-16">
        <Container>
          <SectionTitle
            eyebrow="My Clinical Philosophy"
            title="Hair loss is rarely caused by a single factor."
            subtitle="It is a biological equation."
          />
          <p className="mt-6 text-base leading-relaxed text-white/80">
            If you stabilise:
          </p>
          <ul className="mt-4 space-y-2 text-white/80">
            <li>• Androgen exposure</li>
            <li>• Inflammatory load</li>
            <li>• Nutrient sufficiency</li>
            <li>• Thyroid balance</li>
            <li>• Stress physiology</li>
          </ul>
          <p className="mt-6 text-lg font-medium text-white">
            You dramatically improve follicle survival and long-term outcomes.
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Hair longevity is about stability, not short-term regrowth.
          </p>
        </Container>
      </section>

      {/* Credentials */}
      <section className="border-t border-white/10 bg-black/10 py-16">
        <Container>
          <SectionTitle
            eyebrow="Credentials & Experience"
            title="30+ years in clinical hair restoration."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "International Trichologist",
              "Surgical Hair Transplant Experience",
              "Advanced FUE & Donor Preservation",
              "Regenerative Integration (PRP / Exosomes)",
              "Hormone Mapping & DHT Risk Profiling",
              "Global Medical Training & Standardisation",
              "Post-Transplant Audit Specialist",
            ].map((cred) => (
              <div
                key={cred}
                className="rounded-full border border-[rgba(198,167,94,0.25)] bg-[rgba(198,167,94,0.08)] px-4 py-2 text-sm text-white/90"
              >
                {cred}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Transparency & Ethics */}
      <section className="py-16">
        <Container>
          <SectionTitle
            eyebrow="Transparency & Ethics"
            title="What we provide — and what we don&apos;t."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-medium text-[rgb(var(--gold))]">We provide:</div>
              <ul className="mt-3 space-y-2 text-white/80">
                <li>• Structured biological interpretation</li>
                <li>• Risk mapping</li>
                <li>• Personalised strategy recommendations</li>
                <li>• Clear next-step guidance</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-medium text-white/90">We do not:</div>
              <ul className="mt-3 space-y-2 text-white/80">
                <li>• Guarantee regrowth</li>
                <li>• Replace your GP</li>
                <li>• Replace endocrinology advice</li>
                <li>• Replace dermatology diagnosis</li>
              </ul>
            </div>
          </div>
          <p className="mt-8 text-base leading-relaxed text-white/80">
            Where prescriptions are required, you must consult a licensed local medical practitioner.
          </p>
          <p className="mt-2 text-sm font-medium text-white/90">
            This is clinical strategy — not telemedicine prescribing.
          </p>
        </Container>
      </section>

      {/* Why You Can Trust */}
      <section className="border-t border-white/10 bg-black/10 py-16">
        <Container>
          <SectionTitle
            eyebrow="Why You Can Trust This Platform"
            title="30+ years clinical experience. No dependence on selling medication."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "Evidence-based biological reasoning",
              "Clear limitations & transparent scope",
              "Designed for long-term stability",
            ].map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-8 text-base leading-relaxed text-white/80">
            Trust is built through:
          </p>
          <ul className="mt-3 space-y-2 text-white/80">
            <li>• Experience</li>
            <li>• Clarity</li>
            <li>• Transparency</li>
            <li>• Structured thinking</li>
          </ul>
          <p className="mt-8 text-base leading-relaxed text-white/80">
            Hair Longevity Institute™ exists because too many patients are confused, over-medicated, or
            under-informed.
          </p>
        </Container>
      </section>

      {/* Closing */}
      <section className="py-16">
        <Container>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Biology First. Hair for Life.
            </h2>
            <p className="mt-4 text-lg text-white/80">
              If you want clarity — not marketing — you are in the right place.
            </p>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-black/10 py-[var(--section-py)]">
        <Container>
          <div className="text-center">
            <p className="text-sm font-semibold tracking-[0.2em] text-[rgb(var(--gold))]">
              READY TO UNDERSTAND YOUR BIOLOGY?
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Take the next step
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton href={startHref}>Start your assessment</PrimaryButton>
              <SecondaryButton href="/book">Book specialist consultation</SecondaryButton>
            </div>
          </div>
        </Container>
      </section>

      <PublicFooter />
    </main>
  );
}
