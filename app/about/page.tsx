// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import AnimatedFollicleSystemMap from "@/components/AnimatedFollicleSystemMap";
import SurgicalReadinessMatrixInteractive from "@/components/SurgicalReadinessMatrixInteractive";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, SectionTitle, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/about",
  title: "About our trichology-led, biology-first hair institute",
  metaDescription:
    "30+ years clinical experience in trichology and hair restoration. Biology-first hormone mapping, blood interpretation, and regenerative strategy — global standards.",
  appendBrand: true,
});

const HERO_REASSURANCE = [
  { label: "30+ years", value: "Clinical hair restoration experience across trichology, surgery, and regenerative strategy." },
  { label: "Biology-first", value: "Blood markers, hormones, history, symptoms, and progression are interpreted together." },
  { label: "Independent", value: "HLI exists to clarify your case, not to push a single medication or procedure." },
] as const;

const CREDIBILITY_POINTS = [
  "International clinical practice",
  "Surgical and non-surgical hair restoration",
  "Advanced FUE techniques",
  "Donor regeneration strategy",
  "PRP and exosome integration",
  "Hormone and DHT risk mapping",
  "Post-transplant outcome auditing",
  "Global training and medical standardisation",
] as const;

const WHY_HLI_EXISTS = [
  "DHT sensitivity and androgen receptor behaviour",
  "Age-triggered hormonal shifts",
  "Thyroid conversion and thyroid-related shedding",
  "Iron sufficiency and nutrient status",
  "Inflammatory markers and scalp environment",
  "Cortisol load, stress physiology, and medication interactions",
  "Genetic predisposition and progression risk",
] as const;

const DIFFERENTIATORS = [
  {
    title: "Biology before intervention",
    body: "We look at blood markers, symptoms, history, and progression before talking about treatment pathways. That helps reduce guesswork and makes recommendations more coherent.",
  },
  {
    title: "Hormone and DHT literacy",
    body: "Androgen sensitivity, TRT acceleration risk, hormone balance, and follicle behaviour are central to long-term planning rather than side notes.",
  },
  {
    title: "Real surgical understanding",
    body: "Because HLI is informed by extensive transplant experience, we can speak clearly about when to delay surgery, when to stabilise first, and when donor protection matters most.",
  },
  {
    title: "Regenerative therapies in context",
    body: "PRP, exosomes, and related therapies are treated as tools, not magic. Timing, case selection, and biological context matter.",
  },
] as const;

const LOOKS_AT = [
  {
    title: "Hormones and DHT pathways",
    body: "We interpret androgen exposure, receptor sensitivity, and hormone patterns in the context of your history, symptoms, and hair changes.",
  },
  {
    title: "Blood markers and nutrient sufficiency",
    body: "Iron, thyroid-related markers, inflammatory markers, vitamins, and other labs can help explain shedding, diffuse thinning, or poor recovery.",
  },
  {
    title: "Scalp, symptoms, and pattern",
    body: "Your hairline, density changes, scalp environment, and symptom pattern often tell a more useful story when combined with biology.",
  },
  {
    title: "Progression, timing, and risk",
    body: "The goal is not short-term noise. It is understanding whether your follicles are likely to stabilise, deteriorate, or need a different next step.",
  },
] as const;

const HOW_PEOPLE_USE_HLI = [
  {
    title: "Education first",
    body: "Some people begin by reading our patient guides and insights to understand shedding, thinning, blood markers, and treatment questions in plain language.",
    href: "/insights",
    cta: "Browse insights",
  },
  {
    title: "Structured analysis",
    body: "Most people start with the guided hair analysis so HLI can interpret their history, symptoms, blood work, and photos in a more organised way.",
    href: "/how-it-works",
    cta: "See how it works",
  },
  {
    title: "Blood interpretation support",
    body: "When people already have blood results, HLI helps place those results in hair context and identify what may still need to be discussed with a GP or prescriber.",
    href: "/science",
    cta: "Explore the science",
  },
  {
    title: "Optional appointments",
    body: "If deeper discussion is helpful, a one-on-one trichologist appointment can be added later. It is optional, not a gatekeeper for getting started.",
    href: "/book",
    cta: "Book consultation",
  },
] as const;

const TRUST_STANDARDS = [
  "Evidence-aware biological reasoning",
  "Clear limitations and transparent scope",
  "No guarantee language or false certainty",
  "Designed for long-term follicle stability",
] as const;

const WHAT_WE_PROVIDE = [
  "Structured biological interpretation",
  "Risk mapping and pattern clarification",
  "Personalised strategy recommendations",
  "Clear next-step guidance to take forward",
] as const;

const WHAT_WE_DO_NOT = [
  "Guarantee regrowth",
  "Replace your GP",
  "Replace endocrinology advice",
  "Replace dermatology diagnosis",
] as const;

function BulletList({ items, tone = "default" }: { items: readonly string[]; tone?: "default" | "soft" }) {
  const dotClass = tone === "soft" ? "bg-[rgb(var(--gold))]/45" : "bg-[rgb(var(--gold))]/70";
  return (
    <ul className="space-y-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader showLongevityLinks={useLongevity} ctaHref={startHref} ctaLabel="Start My Hair Analysis" theme="light" />

      <section className="py-14 md:py-16">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(245,240,235,0.94)_100%)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.08)] md:p-9">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.12),transparent_72%)]"
              aria-hidden
            />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start">
              <div className="max-w-3xl">
                <p className="text-sm font-medium tracking-[0.18em] text-[rgb(var(--gold))]">ABOUT HLI</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-5xl">
                  A calmer, biology-first way to understand hair loss.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-[rgb(var(--text-secondary))] md:text-lg">
                  Hair Longevity Institute™ is a medically serious, trichology-led platform built to give people clearer
                  biological guidance when they feel anxious, confused, or overwhelmed by thinning, shedding, hormones,
                  blood tests, and treatment decisions.
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                  For more than 30 years, I have worked across trichology, surgical hair restoration, regenerative
                  medicine, and hormone-related hair loss. HLI is the digital extension of that experience: a place for
                  structured interpretation, patient guidance, and more thoughtful next steps.
                </p>

                <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
                  <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
                  <SecondaryButton href="/how-it-works">See how it works</SecondaryButton>
                  <Link
                    href="/insights"
                    className="inline-flex min-h-[44px] items-center font-medium text-medical underline-offset-2 transition hover:text-[rgb(var(--text-primary))] hover:underline"
                  >
                    Read patient insights
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[rgb(var(--gold))]/24 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,244,239,0.96)_100%)] p-6 shadow-[0_20px_52px_rgba(0,0,0,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">
                  Why patients trust HLI
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">
                  Clarity before pressure
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
                  HLI exists because too many people are left confused, over-marketed to, or pushed toward treatment
                  without a clear understanding of what may actually be driving their hair changes.
                </p>
                <div className="mt-6 space-y-3">
                  {HERO_REASSURANCE.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.15rem] border border-[rgb(var(--border-soft))] bg-white/90 px-4 py-4 shadow-soft"
                    >
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-[rgb(var(--border-soft))] bg-white/90 px-4 py-4 shadow-soft">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">Who HLI is for</p>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                People who want medically grounded interpretation before guessing, self-prescribing, or rushing into a procedure.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[rgb(var(--border-soft))] bg-white/90 px-4 py-4 shadow-soft">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">What makes it different</p>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                Trichology, blood interpretation support, hormone literacy, and surgical understanding are brought together in one calm pathway.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[rgb(var(--border-soft))] bg-white/90 px-4 py-4 shadow-soft">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">What you can expect</p>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                Straight answers, transparent limits, and next-step guidance designed around long-term follicle stability, not hype.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
            <div>
              <SectionTitle
                eyebrow="Why HLI exists"
                title="Most people are sold a product before their biology is properly understood."
                subtitle="Hair loss is rarely one-variable. The point of HLI is to replace guesswork with a more structured interpretation of what may be influencing follicle survival, shedding, or progression."
              />
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                Without a framework, people often move between supplements, prescriptions, procedures, and online opinions
                without ever being told how their case fits together. HLI was built to offer that missing structure.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-[rgb(var(--border-soft))] bg-white/92 p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
                Common biological variables
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {WHY_HLI_EXISTS.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(249,246,242,0.94)_100%)] px-4 py-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm font-medium text-[rgb(var(--text-primary))]">
                When these variables are not mapped, treatment decisions can become expensive guesswork.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <SectionTitle
            eyebrow="What makes the approach different"
            title="Premium guidance, but clinically grounded."
            subtitle="The aim is not to sound dramatic or sell certainty. It is to help patients understand their case with more intelligence, more transparency, and less noise."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {DIFFERENTIATORS.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[1.6rem] border border-[rgb(var(--border-soft))] bg-white/92 p-6 shadow-soft"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">
                  0{index + 1}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
            <div>
              <SectionTitle
                eyebrow="Who HLI is"
                title="Three decades at the intersection of trichology, surgery, and regenerative medicine."
                subtitle="My work has included thousands of patients across multiple countries, alongside training doctors internationally in advanced hair restoration protocols."
              />
              <div className="mt-8 rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-white/92 p-6 shadow-soft">
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Career experience has included:</p>
                <div className="mt-5">
                  <BulletList items={CREDIBILITY_POINTS} />
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                Hair Longevity Institute™ is the patient-facing extension of that experience: an intelligent, medically
                serious environment designed to help people make sense of biology, blood work, symptoms, and treatment
                decisions before they move further.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(249,246,242,0.96)_100%)] p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold-dark))]">
                Clinical philosophy
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">
                Hair loss is a biological equation.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                If you stabilise androgen exposure, inflammatory load, nutrient sufficiency, thyroid balance, and stress
                physiology, you improve the conditions that support long-term follicle survival.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                Hair longevity is about stability, not short-term regrowth claims. That is why HLI prioritises pattern,
                timing, context, and realistic next steps.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <SectionTitle
            eyebrow="What HLI looks at"
            title="A case is interpreted across multiple domains, not reduced to one headline answer."
            subtitle="Follicle Intelligence™ is the biological and analytical engine we use for structured case interpretation and patient roadmaps. It also supports HairAudit when transplant procedures need independent evaluation."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {LOOKS_AT.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-white/92 p-6 shadow-soft"
              >
                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,240,235,0.86)_100%)] p-6 shadow-[0_18px_52px_rgba(0,0,0,0.06)] md:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">The system</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-3xl">
                The Hair Longevity System Map™
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                Hair loss is rarely caused by one variable. This map shows the five biological domains that influence
                long-term follicle survival and gives patients a more coherent way to understand what may need attention.
              </p>
            </div>
            <div className="mt-10">
              <AnimatedFollicleSystemMap />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-16">
        <Container>
          <SectionTitle
            eyebrow="How people use HLI"
            title="Education, analysis, blood interpretation support, then optional appointments if needed."
            subtitle="The experience is designed to be flexible. You can read first, start with the guided analysis, bring existing blood results into context, or add a specialist conversation later."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {HOW_PEOPLE_USE_HLI.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.6rem] border border-[rgb(var(--border-soft))] bg-white/92 p-6 shadow-soft"
              >
                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">{item.body}</p>
                <div className="mt-5">
                  <Link href={item.href} className="font-medium text-medical underline-offset-2 hover:underline">
                    {item.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-[rgb(var(--medical))]/12 bg-[rgb(var(--medical))]/[0.05] px-5 py-5">
            <p className="text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
              HLI can help interpret blood results you already have, suggest what to discuss with your GP, and explain
              where a specialist appointment may or may not add value. It is designed to guide, not overwhelm.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] lg:items-start">
            <div>
              <SectionTitle
                eyebrow="Trust, standards, and expert oversight"
                title="Transparent scope matters as much as expertise."
                subtitle="Trust is built through experience, clarity, and honest limits. HLI is designed for clinical strategy and biological interpretation, not telemedicine prescribing."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                {TRUST_STANDARDS.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-[rgb(var(--border-soft))] bg-white/92 px-4 py-2 text-sm text-[rgb(var(--text-secondary))] shadow-soft"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-white/92 p-6 shadow-soft">
                  <p className="text-sm font-medium text-[rgb(var(--gold-dark))]">We provide</p>
                  <div className="mt-4">
                    <BulletList items={WHAT_WE_PROVIDE} tone="soft" />
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[rgb(var(--border-soft))] bg-white/92 p-6 shadow-soft">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">We do not</p>
                  <div className="mt-4">
                    <BulletList items={WHAT_WE_DO_NOT} tone="soft" />
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                Where prescriptions are required, you must consult a licensed local medical practitioner. This is
                clinical strategy and patient guidance, not a replacement for your GP, endocrinologist, dermatologist, or prescriber.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,240,235,0.92)_100%)] p-6 shadow-[0_18px_52px_rgba(0,0,0,0.06)] md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold-dark))]">
                Surgical decisioning
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">
                Surgical Readiness Matrix™
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] md:text-base">
                This framework helps determine whether surgery is appropriate now, later, or not at all based on
                biological stability, progression rate, and the need to protect long-term donor and scalp outcomes.
              </p>
              <div className="mt-8">
                <SurgicalReadinessMatrixInteractive />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[rgb(var(--border-soft))] bg-subtle py-14 sm:py-16">
        <Container>
          <div className="rounded-[2rem] border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,240,235,0.92)_100%)] p-8 text-center shadow-[0_18px_52px_rgba(0,0,0,0.06)] md:p-10">
            <p className="text-sm font-semibold tracking-[0.18em] text-[rgb(var(--gold))]">WHERE TO START</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-4xl">
              Biology first. Clarity first. Then the right next step.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[rgb(var(--text-secondary))] md:text-lg">
              If you want a clearer understanding of what may be driving your hair concerns, HLI is designed to help you
              start in a more grounded way.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
              <SecondaryButton href="/book">Book specialist consultation</SecondaryButton>
              <Link href="/guides" className="inline-flex min-h-[44px] items-center font-medium text-medical underline-offset-2 hover:underline">
                Browse guides first
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <PublicFooter theme="light" />
    </main>
  );
}
