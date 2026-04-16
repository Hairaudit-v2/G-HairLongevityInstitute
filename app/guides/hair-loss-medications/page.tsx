import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  HAIR_LOSS_MEDICATIONS_IN_2026_GUIDE_PDF_DOWNLOAD_AS,
  HAIR_LOSS_MEDICATIONS_IN_2026_GUIDE_PDF_HREF,
} from "@/lib/guides/hliGuidePdfs";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, SecondaryButton } from "@/components/public/PublicCTA";
import { GuideLibraryAssessmentCTA } from "@/components/guides/GuideLibraryAssessmentCTA";
import { GuideRelatedGuides } from "@/components/guides/GuideRelatedGuides";
import { GuideSupportingReads } from "@/components/guides/GuideSupportingReads";
import EditorialFaqSection from "@/components/editorial/EditorialFaqSection";
import HomeFaqJsonLd from "@/components/editorial/HomeFaqJsonLd";

const FINASTERIDE_INSIGHT = "/insights/finasteride-vs-saw-palmetto";
const MINOXIDIL_INSIGHT = "/insights/minoxidil-mechanism-and-realistic-timelines";
const WOMENS_ORAL_INSIGHT = "/insights/oral-anti-androgens-in-women-specialist-led-context";

const READ_SECTIONS: { href: string; label: string }[] = [
  { href: `${FINASTERIDE_INSIGHT}#finasteride-mechanism`, label: "Prescription 5-alpha-reductase blockers in plain English" },
  { href: `${FINASTERIDE_INSIGHT}#saw-palmetto`, label: "Why supplements are not interchangeable with licensed medicines" },
  { href: `${MINOXIDIL_INSIGHT}#mechanism-overview`, label: "Minoxidil basics, timelines, and early-shed expectations" },
  { href: `${MINOXIDIL_INSIGHT}#combination-context`, label: "How minoxidil fits into combination treatment plans" },
  { href: `${WOMENS_ORAL_INSIGHT}#drug-classes-high-level`, label: "Specialist-led oral options in women" },
  { href: `${WOMENS_ORAL_INSIGHT}#monitoring-safety`, label: "Why monitoring and pregnancy planning matter" },
];

const TAKEAWAYS = [
  "The most useful treatment question is not \"what is strongest?\" but \"what fits my diagnosis, risks, timeframe, and tolerance for maintenance?\"",
  "Hair-loss treatment categories sit on very different evidence, safety, and expectation ladders: natural support, first-line medical therapy, off-label options, adjuncts, procedures, and trial-stage approaches are not interchangeable.",
  "Stabilization and regrowth are different goals. Many good treatment plans focus first on slowing progression before expecting visible density gains.",
  "Diagnosis still comes before treatment choice. Pattern loss, postpartum shedding, androgen-sensitive thinning, scalp disease, and diffuse shedding do not all belong on the same pathway.",
  "A medically responsible treatment conversation usually includes pattern recognition, photographs, timeline, tolerance for long-term use, and realistic outcome framing.",
];

const FAQ_ITEMS = [
  {
    question: "Does this page tell me which treatment I should start?",
    answer:
      "No. It is designed to help you compare categories and ask better questions. Treatment choice still depends on diagnosis, contraindications, sex-specific considerations, fertility planning where relevant, and your medical history.",
  },
  {
    question: "Is natural treatment automatically safer than prescription treatment?",
    answer:
      "No. Supplements and so-called natural options can still vary in dose, purity, interaction risk, and evidence quality. They should not be treated as interchangeable with regulated medicines just because they sound gentler.",
  },
  {
    question: "Is regrowth the right goal for everyone?",
    answer:
      "Not always. In many real-world plans the first goal is stabilization: slowing ongoing miniaturisation or shedding so the picture stops worsening. Regrowth, where it happens, is often slower and less dramatic than marketing implies.",
  },
  {
    question: "Do blood tests tell me which medication is best?",
    answer:
      "Only sometimes. Labs can add context in selected cases, but they do not replace diagnosis, scalp examination, medication review, or pregnancy planning discussions.",
  },
  {
    question: "Can postpartum shedding need a different plan from pattern hair loss?",
    answer:
      "Yes. Postpartum shedding, temporary telogen shedding, and androgen-sensitive pattern loss often need different framing. That is why HLI keeps returning to diagnosis-first thinking before talking about treatments.",
  },
  {
    question: "Why does this page link to multiple guides and treatment articles?",
    answer:
      "This page is meant to be the treatment-options pillar page. It gives the broad map first, then sends you to narrower reads on minoxidil, finasteride-class treatment, androgen-sensitive thinning, and diagnosis-specific pathways.",
  },
  {
    question: "Do emerging or regenerative options replace medical treatment?",
    answer:
      "Usually not automatically. Some regenerative or procedural options are framed as adjuncts, not replacements, and their role depends heavily on diagnosis, evidence quality, cost, and the rest of the plan.",
  },
];

const DIAGNOSIS_PATHWAYS = [
  "Pattern hair loss: often points toward long-term maintenance framing, where first-line medical treatment and realistic expectations matter more than quick fixes.",
  "Postpartum or temporary shedding: usually leans more toward reassurance, monitoring, recovery support, and selective testing before jumping into an aggressive medication plan.",
  "Androgen-sensitive thinning with hormonal context: may need a more detailed discussion around DHT, anti-androgen strategies, and sex-specific safety considerations.",
  "Inflammatory or scalp-led problems: often need scalp treatment and diagnosis clarification before classic hair-growth products become the main conversation.",
  "Mixed pictures: may need more careful sequencing, because treating one contributor without understanding the others can lead to confusion and disappointment.",
];

const TREATMENT_QUESTIONS = [
  "What is the likely diagnosis or dominant pattern I am treating?",
  "Is the realistic first goal stabilization, regrowth, or simply stopping the picture from worsening?",
  "How long would I need to stay consistent before judging whether something is working?",
  "What monitoring, pregnancy planning, or medication-interaction issues matter in my case?",
  "Am I choosing this because it fits the biology, or because it is heavily marketed?",
];

const SUPPORTING_READS = [
  {
    href: "/guides/hair-longevity",
    category: "Foundational Guide",
    title: "The Complete Guide to Hair Longevity",
    description: "Start here if you still need the bigger causes-diagnosis-treatment framework before choosing a treatment path.",
  },
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description: "Best next read when treatment questions are really about recession, crown thinning, and long-term male-pattern maintenance.",
  },
  {
    href: "/guides/postpartum-hair-loss",
    category: "Women's Hair Health",
    title: "The Truth About Postpartum Hair Loss",
    description: "Important if your treatment question sits inside postpartum shedding, reassurance, ferritin, thyroid, or recovery timing.",
  },
  {
    href: "/guides/androgen-index",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    description: "Use this when treatment choice depends on DHT, androgen sensitivity, TRT, or steroid-exposure context.",
  },
];

const RELATED = [
  {
    href: "/guides/hair-longevity",
    category: "Foundational Guide",
    title: "The Complete Guide to Hair Longevity",
    description: "Start broader with causes, testing, and long-term planning before narrowing into treatment categories.",
  },
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description: "Best if your medication questions sit inside temple recession, crown thinning, and pattern progression.",
  },
  {
    href: "/guides/androgen-index",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    description: "Useful when treatment choices depend on DHT, androgen exposure, or hormone-sensitive thinning.",
  },
];

const wrap = "mx-auto max-w-2xl";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/hair-loss-medications",
  title: "Hair loss treatment options guide: medications, natural support, off-label and emerging therapies",
  metaDescription:
    "A diagnosis-first guide to hair loss treatment options: natural support, first-line medications, off-label therapies, adjuncts, regenerative approaches, and emerging treatment pathways.",
  appendBrand: true,
});

export default function HairLossMedicationsGuidePage() {
  const useLongevity = isLongevityEnabled();
  const startHref = useLongevity ? "/longevity/start" : "/start";

  return (
    <main className="min-h-screen bg-page">
      <PublicHeader
        showLongevityLinks={useLongevity}
        ctaHref={startHref}
        ctaLabel="Start My Hair Analysis"
        theme="light"
      />
      <HomeFaqJsonLd items={FAQ_ITEMS} />

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="meds-guide-hero">
        <Container>
          <div className={`${wrap} text-center`}>
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Treatment Guide</p>
            <h1
              id="meds-guide-hero"
              className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]"
              style={{ lineHeight: 1.2 }}
            >
              Hair Loss Medications in 2026
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              The HLI master guide to hair-loss treatment pathways: natural support, first-line medical treatment,
              off-label options, adjunctive care, regenerative support, and emerging therapies. Use it to compare
              categories without losing the diagnosis-first logic that should come before any treatment plan.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <SecondaryButton href={HAIR_LOSS_MEDICATIONS_IN_2026_GUIDE_PDF_HREF} download={HAIR_LOSS_MEDICATIONS_IN_2026_GUIDE_PDF_DOWNLOAD_AS}>
                Download PDF
              </SecondaryButton>
              <SecondaryButton href={FINASTERIDE_INSIGHT}>Start with the web guide</SecondaryButton>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-[rgb(var(--text-muted))]">
              Use this page as the high-level map, then drop into the linked articles and diagnosis-specific guides for the
              deeper detail that matters to your treatment conversation.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="meds-decide">
        <Container>
          <div className={wrap}>
            <h2 id="meds-decide" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What this guide helps you decide
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Use it when you are trying to work out whether you need a diagnosis-first conversation, a prescriber-led
              medication discussion, a realistic expectations reset, or simply a better framework for comparing common
              options before you commit time and money.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The page is deliberately broader than any one treatment article. Instead of treating hair loss as a single
              medication problem, it helps you sort how natural support, established medical treatment, off-label
              strategies, adjunctive options, and emerging therapies fit into the wider plan.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="meds-takeaways">
        <Container>
          <div className={wrap}>
            <h2 id="meds-takeaways" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Key takeaways
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              {TAKEAWAYS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="meds-by-diagnosis">
        <Container>
          <div className={wrap}>
            <h2 id="meds-by-diagnosis" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Best treatment type by diagnosis
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The same treatment stack does not suit every diagnosis. What often helps most with classic androgen-sensitive
              pattern loss may not be the right starting point for postpartum shedding, inflammatory scalp disease, or a
              mixed picture. That is why HLI pushes diagnosis before product selection.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              {DIAGNOSIS_PATHWAYS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              If you still need the bigger diagnostic frame, go back to the{" "}
              <Link href="/guides/hair-longevity" className="font-medium text-medical underline-offset-2 hover:underline">
                hair longevity guide
              </Link>
              . If the question is clearly male-pattern progression, the sharper branch is the{" "}
              <Link href="/guides/male-pattern-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                male pattern hair loss guide
              </Link>
              . If the story is more postpartum than pattern-led, use the{" "}
              <Link href="/guides/postpartum-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                postpartum guide
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="meds-stabilization">
        <Container>
          <div className={wrap}>
            <h2 id="meds-stabilization" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              How to think about stabilization vs regrowth
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Treatment marketing tends to overemphasize regrowth, but in real practice stabilization is often the first
              meaningful win. If ongoing miniaturisation slows down, shedding eases, or the pattern stops worsening,
              that can represent a clinically useful result even before density visibly improves.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Regrowth, where it happens, is usually slower and less dramatic than online before-and-after culture
              implies. That matters because unrealistic expectations drive unnecessary treatment switching. HLI generally
              prefers to define the goal upfront: are you trying to stabilise a clear pattern, support recovery, improve
              scalp conditions, or push for additional density after a stable base has been established?
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="meds-diagnosis-first">
        <Container>
          <div className={wrap}>
            <h2 id="meds-diagnosis-first" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Why treatment choice depends on diagnosis
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Diagnosis-first matters because treatment categories answer different problems. Pattern loss, androgen
              sensitivity, postpartum shedding, inflammatory scalp conditions, and diffuse shedding are not all managed
              with the same assumptions. The more accurately the problem is framed, the less likely you are to buy into a
              mismatch between the biology and the product.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              This is also why one article on finasteride or minoxidil cannot do the whole job. Treatment decisions sit on
              top of a prior question: what exactly are you treating, and what result would count as success?
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="meds-natural">
        <Container>
          <div className={wrap}>
            <h2 id="meds-natural" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Natural / foundational support
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Foundational support usually means the lower-risk background work: improving consistency, reducing scalp
              irritation, supporting recovery, correcting genuine deficiencies where they exist, and avoiding chaotic
              treatment switching. These steps are often important, but they should not be oversold as direct replacements
              for established medical treatment when classic pattern loss is clearly present.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Natural products also deserve the same skepticism as medical products. The word “natural” does not guarantee
              safety, consistency, or meaningful efficacy. Some people still choose them as part of a lower-intervention
              strategy, but it is important to separate foundational support from high-confidence disease-modifying
              treatment claims.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="meds-first-line">
        <Container>
          <div className={wrap}>
            <h2 id="meds-first-line" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              First-line medical treatments
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              First-line medical treatments are the treatments most people mean when they ask what is “actually proven.”
              In pattern hair loss, this often brings the conversation toward topical therapy, minoxidil pathways,
              finasteride-class discussion in appropriate contexts, and consistency over time. These are usually the
              categories with the clearest long-term maintenance framing.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              That still does not mean they are universal. Suitability depends on sex, age, pregnancy planning, tolerance
              for ongoing use, baseline diagnosis, and what the patient actually wants from the plan. For the narrower
              explainer layer, use the{" "}
              <Link href={MINOXIDIL_INSIGHT} className="font-medium text-medical underline-offset-2 hover:underline">
                minoxidil article
              </Link>{" "}
              and the{" "}
              <Link href={FINASTERIDE_INSIGHT} className="font-medium text-medical underline-offset-2 hover:underline">
                finasteride vs saw palmetto guide
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="meds-off-label">
        <Container>
          <div className={wrap}>
            <h2 id="meds-off-label" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Off-label and specialist-directed options
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Off-label and specialist-directed options sit further along the decision ladder. They may be discussed when
              the diagnosis is clearer, the patient has already moved beyond basic pathway questions, or a sex-specific
              endocrine context changes what is appropriate. This is where the treatment conversation becomes more
              sensitive to monitoring, contraindications, and prescriber judgement.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              For women, this can overlap with broader androgen-sensitive questions and pregnancy planning. If that is the
              real issue, the better companion read is{" "}
              <Link href={WOMENS_ORAL_INSIGHT} className="font-medium text-medical underline-offset-2 hover:underline">
                oral anti-androgens in women
              </Link>{" "}
              plus the broader{" "}
              <Link href="/guides/androgen-index" className="font-medium text-medical underline-offset-2 hover:underline">
                androgen guide
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="meds-adjunctive">
        <Container>
          <div className={wrap}>
            <h2 id="meds-adjunctive" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Adjunctive treatments
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Adjunctive treatment means support around the edges of the main plan rather than the core disease-modifying
              anchor. This might include scalp-care optimisation, adherence-support tactics, selected supplementation in
              documented deficiency, or treatment combinations that improve tolerance or consistency rather than replacing
              the main pathway.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Adjuncts are often useful precisely because hair-loss management is slow. If they help someone stay
              consistent, reduce irritation, or better align the plan with real life, they can have practical value even
              when they are not the headline intervention.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="meds-regenerative">
        <Container>
          <div className={wrap}>
            <h2 id="meds-regenerative" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Regenerative and procedural support
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Regenerative and procedural treatments are often marketed as though they replace the rest of the plan. In
              practice they are more often discussed as support, escalation, or selected add-ons depending on diagnosis,
              budget, access, and expectations. Their role varies widely across clinics and countries, and evidence
              quality is not uniform.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              That does not make them irrelevant. It just means they need to be interpreted in context. The more a
              treatment is framed as regenerative, premium, or cutting-edge, the more important it becomes to ask what it
              is adding beyond diagnosis-first medical planning and whether the expected gain is realistic.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="meds-emerging">
        <Container>
          <div className={wrap}>
            <h2 id="meds-emerging" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Trial-stage / emerging treatments
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Emerging treatments often attract the most attention because they promise something beyond the current
              standard. But early-stage attention is not the same as mature evidence. Trial-stage or pre-mainstream
              options belong in the conversation as future pathways, not as automatic solutions for people who have not
              yet clarified the diagnosis or used simpler evidence-based routes appropriately.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              HLI’s approach here is conservative and patient-first: keep an eye on what is developing, but do not let
              emerging treatment excitement displace the basics of pattern recognition, stabilization, adherence, and
              medically appropriate first-line care.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="meds-questions">
        <Container>
          <div className={wrap}>
            <h2 id="meds-questions" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Questions to ask before starting treatment
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              {TREATMENT_QUESTIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="meds-read">
        <Container>
          <div className={wrap}>
            <h2 id="meds-read" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Read online by medication theme
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              These editorials turn the guide into a usable treatment pathway: start with the category closest to your
              question, then zoom back out before making decisions.
            </p>
            <ul className="mt-6 space-y-2">
              {READ_SECTIONS.map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="rounded-sm text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <GuideSupportingReads
        items={SUPPORTING_READS}
        headingId="meds-next-reads"
        title="Best next reads / supporting articles"
        intro="Once the broad treatment-options map is clear, move into the guide that best matches your actual diagnosis or treatment decision."
        theme="card"
      />

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-label="Frequently asked questions">
        <Container>
          <div className={wrap}>
            <EditorialFaqSection items={FAQ_ITEMS} />
          </div>
        </Container>
      </section>

      <GuideRelatedGuides items={RELATED} headingId="meds-related" />

      <GuideLibraryAssessmentCTA startHref={startHref} headingId="meds-assessment-cta" />

      <Container>
        <div className="py-10">
          <PublicFooter theme="light" />
        </div>
      </Container>
    </main>
  );
}
