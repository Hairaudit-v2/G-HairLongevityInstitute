import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, SecondaryButton } from "@/components/public/PublicCTA";
import { GuideLibraryAssessmentCTA } from "@/components/guides/GuideLibraryAssessmentCTA";
import { GuideRelatedGuides } from "@/components/guides/GuideRelatedGuides";
import { GuideSupportingReads } from "@/components/guides/GuideSupportingReads";
import { GuideInsightArticleGroups } from "@/components/guides/GuideInsightArticleGroups";
import EditorialFaqSection from "@/components/editorial/EditorialFaqSection";
import GuidePageJsonLd from "@/components/seo/GuidePageJsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  ANDROGEN_GUIDE_PDF_DOWNLOAD_AS,
  ANDROGEN_GUIDE_PDF_HREF,
} from "@/lib/guides/hliGuidePdfs";

const DHT_INSIGHT = "/insights/dht-and-androgenetic-alopecia";
const FIN_INSIGHT = "/insights/finasteride-vs-saw-palmetto";
const ORAL_WOMEN_INSIGHT = "/insights/oral-anti-androgens-in-women-specialist-led-context";

const READ_SECTIONS: { href: string; label: string }[] = [
  { href: `${DHT_INSIGHT}#dht-role`, label: "Testosterone vs DHT — how DHT ties into pattern thinning" },
  { href: `${DHT_INSIGHT}#pattern-recognition`, label: "What clinicians look for (follicular sensitivity context)" },
  { href: `${DHT_INSIGHT}#labs`, label: "What blood tests can and cannot tell you" },
  { href: `${FIN_INSIGHT}#finasteride-mechanism`, label: "Finasteride: what it does at a high level" },
  { href: `${FIN_INSIGHT}#dht-context`, label: "DHT refresher in a treatment context" },
  { href: `${ORAL_WOMEN_INSIGHT}#relation-pattern-hair-loss`, label: "Women: anti-androgen prescribing and pattern loss" },
];

const TAKEAWAYS = [
  "Androgen-related hair loss is usually about follicular sensitivity and visible pattern, not just whether a testosterone number looks high or low.",
  "DHT, testosterone, TRT, and anabolic steroid exposure sit in the same broad conversation, but they do not all affect hair risk in the same way.",
  "People can lose hair with normal hormone levels because androgen-sensitive follicles may still miniaturise over time.",
  "Women can have androgen-related thinning without dramatic lab abnormalities, which is why clinical pattern and timeline matter as much as blood work.",
  "The most useful next step is usually to clarify whether your question is about diagnosis, exposure risk, testing context, or treatment planning.",
];

const FAQ_ITEMS = [
  {
    question: "Can normal testosterone still go with androgen-related hair loss?",
    answer:
      "Yes. Many people with androgen-sensitive pattern loss have hormone levels within broad reference ranges. Hair risk may reflect follicular sensitivity and inherited pattern biology more than a dramatic serum abnormality.",
  },
  {
    question: "Is DHT the same thing as testosterone?",
    answer:
      "No. Testosterone and DHT are related but not identical. DHT is formed from testosterone in some tissues and can have stronger follicle-level effects in androgen-sensitive pattern loss.",
  },
  {
    question: "Does TRT always accelerate hair loss?",
    answer:
      "No, but it can raise concern in people who are already susceptible to androgen-sensitive thinning. Baseline pattern tendency, family history, DHT conversion, and what the scalp looks like over time all matter.",
  },
  {
    question: "Are anabolic steroids different from standard TRT in hair terms?",
    answer:
      "Often yes. Supraphysiologic androgen exposure can create stronger pressure on susceptible follicles than replacement-level therapy, which is why steroid cycles are usually discussed separately from medically supervised TRT.",
  },
  {
    question: "Do blood tests diagnose androgen-sensitive hair loss?",
    answer:
      "Not on their own. Labs may add context in selected endocrine or female-pattern scenarios, but diagnosis still depends heavily on pattern recognition, history, timeline, and examination.",
  },
  {
    question: "Can women have androgen-related thinning with normal labs?",
    answer:
      "Yes. Women may show a clinical pattern of androgen-sensitive thinning without dramatic hormone abnormalities, which is why the whole story matters more than one panel alone.",
  },
  {
    question: "What may help if androgens are part of the story?",
    answer:
      "What helps depends on diagnosis, sex-specific considerations, fertility planning where relevant, exposure history, and prescriber oversight. The goal is not to self-treat but to frame the right next clinical conversation.",
  },
];

/** Best next reads: no DHT explainer card here — it is primary to the male-pattern pillar. Oral anti-androgens stays the single featured insight in the cluster block above. */
const SUPPORTING_READS = [
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description:
      "The pillar home for the plain-English DHT article, staging, and pattern progression — featured owner of that explainer.",
  },
  {
    href: FIN_INSIGHT,
    category: "DHT pathway (treatment)",
    title: "Finasteride vs saw palmetto for hair loss: evidence and important differences",
    description:
      "Prescription 5-alpha-reductase effects versus supplement claims — androgen pathway context without double-featuring the DHT overview article.",
  },
  {
    href: "/guides/hair-loss-medications",
    category: "Treatment Guide",
    title: "Hair Loss Medications in 2026",
    description: "Broader treatment-options map when your question spans medicines, off-label paths, and realistic comparisons.",
  },
  {
    href: "/insights/what-blood-tests-matter-for-hair-loss",
    category: "Testing",
    title: "Blood tests and hair loss: what may actually help",
    description: "When labs add context for androgen-related questions — and when pattern matters more than a hormone panel.",
  },
];

const RELATED = [
  {
    href: "/guides/hair-longevity",
    category: "Foundational Guide",
    title: "The Complete Guide to Hair Longevity",
    description: "Broad biology-first context before narrowing on hormones.",
  },
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description: "Pattern progression, staging, and treatment framing for men.",
  },
  {
    href: "/guides/postpartum-hair-loss",
    category: "Women's Hair Health",
    title: "The Truth About Postpartum Hair Loss",
    description: "Hormonal transition and shedding — how it sits apart from androgen-driven pattern loss.",
  },
];

const wrap = "mx-auto max-w-2xl";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/androgen-index",
  title: "Testosterone, TRT & steroids: androgen sensitivity and hair loss risk",
  metaDescription:
    "Hormones and hair: testosterone and DHT in context, follicular sensitivity, TRT and anabolic steroids, women’s androgen-related thinning, and what blood tests can and cannot prove.",
  appendBrand: true,
});

export default function AndrogenIndexGuidePage() {
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
      <GuidePageJsonLd
        guidePath="/guides/androgen-index"
        lastBreadcrumbName="Androgens & hair"
        faqItems={FAQ_ITEMS}
      />

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="ag-guide-hero">
        <Container>
          <div className={`${wrap} text-center`}>
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Hormones & Hair</p>
            <h1
              id="ag-guide-hero"
              className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]"
              style={{ lineHeight: 1.2 }}
            >
              Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              The broad HLI guide to testosterone, DHT, androgen sensitivity, TRT, anabolic steroid exposure, and
              hair-loss risk. Use it to understand what androgens are, why some people lose hair with normal hormone
              levels, how exposure risk is assessed, and which questions belong in a medically responsible review.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <SecondaryButton href={DHT_INSIGHT}>Continue reading</SecondaryButton>
              <SecondaryButton href={ANDROGEN_GUIDE_PDF_HREF} download={ANDROGEN_GUIDE_PDF_DOWNLOAD_AS}>
                Download PDF
              </SecondaryButton>
            </div>
            <p className="mt-6 text-sm text-[rgb(var(--text-muted))] leading-relaxed">
              Start with the DHT overview, then use the section links below; download the PDF for offline reading.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="ag-why">
        <Container>
          <div className={wrap}>
            <h2 id="ag-why" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Why this guide matters
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Androgens are easy to misunderstand. Total testosterone alone rarely tells the whole hair story. This
              resource offers a calm, clinically grounded tour of DHT, follicular sensitivity, TRT and steroid-related
              risk, sex-specific differences, and what labs can and cannot clarify — so you can ask better questions and
              avoid both panic and false reassurance.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The purpose of this page is to be broader than any single explainer. It is not just a DHT article, not just
              a TRT article, and not just a hormone-lab article. It is the place where those conversations are brought
              together so you can separate serum levels, receptor sensitivity, exposure history, and visible clinical
              pattern.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="ag-decide">
        <Container>
          <div className={wrap}>
            <h2 id="ag-decide" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What the androgen index means in practice
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              In practice, an androgen-index question usually means one of several different things. You may be trying to
              work out whether testosterone is relevant to your thinning, whether DHT is the more important signal,
              whether TRT or anabolic exposure changes your risk, or whether your scalp pattern looks androgen-sensitive
              even though your blood work is not dramatic.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              HLI uses the phrase as a framework, not as a single formula. The useful work is usually separating serum
              levels, receptor sensitivity, and visible pattern. That is why a normal panel does not automatically mean
              “androgens are irrelevant,” and a higher result does not automatically prove that every hair change is
              hormonal.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="ag-what-androgens-are">
        <Container>
          <div className={wrap}>
            <h2 id="ag-what-androgens-are" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What androgens are
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Androgens are hormones that influence a range of tissues, including skin, sebaceous activity, body hair,
              reproductive biology, and in some people the scalp follicle. Testosterone is the best-known androgen, but
              it is not the only actor in the hair story. DHT is a downstream androgen formed from testosterone in some
              tissues, and it is often the most discussed hormone in androgen-sensitive pattern hair loss.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The reason androgens matter for hair is not that they are inherently harmful. It is that some follicles are
              more genetically sensitive to androgen signalling than others. Over time, that sensitivity can contribute
              to the miniaturisation pattern seen in classic androgenetic loss in both men and women.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="ag-takeaways">
        <Container>
          <div className={wrap}>
            <h2 id="ag-takeaways" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="ag-normal-levels">
        <Container>
          <div className={wrap}>
            <h2 id="ag-normal-levels" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Why some people lose hair with normal hormone levels
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              This is one of the most important distinctions on the page. Serum hormone levels and follicular response
              are not the same thing. Many patients with androgen-sensitive pattern loss have results that sit within
              reference ranges. The follicle may still respond to androgen signalling in a way that drives progressive
              thinning over time.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              That is why clinicians still care so much about pattern recognition: recession, crown thinning, widening
              part, miniaturisation, family history, and timeline. If you want the mechanism-level companion read, start
              with{" "}
              <Link href={DHT_INSIGHT} className="font-medium text-medical underline-offset-2 hover:underline">
                the DHT and androgenetic alopecia overview
              </Link>
              . If you want the broader pattern page for men, continue with the{" "}
              <Link href="/guides/male-pattern-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                male pattern hair loss guide
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="ag-trt-risk">
        <Container>
          <div className={wrap}>
            <h2 id="ag-trt-risk" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              TRT and hair risk
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              TRT is often framed too simplistically. It is not true that it always devastates hair, and it is not true
              that it is automatically irrelevant. Replacement therapy can matter most in people who are already
              susceptible to androgen-sensitive thinning, particularly where the scalp pattern and family history already
              point in that direction.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The key clinical question is not “is TRT always the cause?” but “what risk does TRT add in this person,
              with this pattern, at this stage?” That is a monitoring and pattern-recognition question as much as it is a
              hormone question.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="ag-steroids">
        <Container>
          <div className={wrap}>
            <h2 id="ag-steroids" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Anabolic steroids and accelerated hair loss
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Anabolic steroid exposure is often discussed separately from standard TRT because the androgen load can be
              much higher and the hair risk can be more aggressive in susceptible people. In practice, that may mean
              faster progression of an existing pattern tendency rather than a completely separate hair-loss category.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              This is still not a one-size-fits-all story. Baseline genetics, duration of exposure, what compounds were
              used, and what the scalp pattern looked like before all matter. But steroid history belongs in the risk
              conversation because it can intensify androgen pressure on vulnerable follicles.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="ag-women">
        <Container>
          <div className={wrap}>
            <h2 id="ag-women" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Androgens in women
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              In women, androgen-related thinning is often misunderstood because people expect a dramatic high-hormone
              story every time. In reality, women may show androgen-sensitive pattern change without striking serum
              abnormalities. That is one reason clinical pattern, part width, crown density, timeline, and the wider
              history remain central.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The differential can also be broader in women. Postpartum recovery, ferritin, thyroid context, and diffuse
              shedding can overlap with pattern tendencies. If hormonal transition after birth is more relevant than
              classic androgen risk, the better branch is the{" "}
              <Link href="/guides/postpartum-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                postpartum hair loss guide
              </Link>
              . If pattern-driven thinning is central, the specialist-led companion read is{" "}
              <Link href={ORAL_WOMEN_INSIGHT} className="font-medium text-medical underline-offset-2 hover:underline">
                oral anti-androgens in women
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="ag-assess-risk">
        <Container>
          <div className={wrap}>
            <h2 id="ag-assess-risk" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              How to assess androgen-related risk
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Risk assessment usually works best when it combines three lenses: exposure, susceptibility, and pattern.
              Exposure includes TRT, anabolic use, endocrine context, and medication history. Susceptibility includes
              family history and the likelihood that the follicle is androgen-sensitive. Pattern includes what the scalp
              actually looks like over time, which is often more informative than a single panel.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Labs may help in selected scenarios, but they do not replace clinical sorting. If testing is the part you
              want to understand more clearly, continue with{" "}
              <Link href="/insights/what-blood-tests-matter-for-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                blood tests and hair loss: what may actually help
              </Link>
              . The same logic also helps explain why some postpartum or diffuse cases are not primarily androgen stories
              at all.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="ag-what-helps">
        <Container>
          <div className={wrap}>
            <h2 id="ag-what-helps" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What may help
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              What may help depends on what the androgen story actually is. Some people mainly need clearer diagnosis and
              better expectation-setting. Some need a prescriber-led discussion around evidence-based therapy. Others need
              coordination between hair concerns and endocrine goals, especially where TRT or another exposure is already
              part of the picture.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The important point is not to collapse every androgen-related question into one intervention. A page like
              this should help you frame the right treatment conversation, not shortcut it. If your question is now
              moving into medication comparison, the best next page is{" "}
              <Link href="/guides/hair-loss-medications" className="font-medium text-medical underline-offset-2 hover:underline">
                Hair Loss Medications in 2026
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="ag-read">
        <Container>
          <div className={wrap}>
            <h2 id="ag-read" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Read online — guided entry points
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              These links jump into vetted HLI editorials that map to this guide&apos;s themes. Read in any order; each
              article stands on its own.
            </p>
            <ul className="mt-6 space-y-2">
              {READ_SECTIONS.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={DHT_INSIGHT}
                  className="text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))] rounded-sm"
                >
                  Open the main DHT & pattern overview from the top →
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <GuideSupportingReads
        items={SUPPORTING_READS}
        headingId="ag-next-reads"
        title="Best next reads / supporting articles"
        intro="Once the broad hormone-and-hair picture is clear, move into the supporting read that best matches your actual next question."
        theme="card"
      />

      <GuideInsightArticleGroups pillar="androgen-index" headingId="ag-insight-clusters" />

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-label="Frequently asked questions">
        <Container>
          <div className={wrap}>
            <EditorialFaqSection items={FAQ_ITEMS} />
          </div>
        </Container>
      </section>

      <GuideRelatedGuides items={RELATED} headingId="ag-related" />

      <GuideLibraryAssessmentCTA startHref={startHref} headingId="ag-assessment-cta" />

      <Container>
        <div className="py-10">
          <PublicFooter theme="light" />
        </div>
      </Container>
    </main>
  );
}
