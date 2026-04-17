import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";
import { GuideRelatedGuides } from "@/components/guides/GuideRelatedGuides";
import { GuideSupportingReads } from "@/components/guides/GuideSupportingReads";
import { GuideInsightArticleGroups } from "@/components/guides/GuideInsightArticleGroups";
import EditorialFaqSection from "@/components/editorial/EditorialFaqSection";
import GuidePageJsonLd from "@/components/seo/GuidePageJsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  HAIR_LONGEVITY_GUIDE_PDF_DOWNLOAD_AS,
  HAIR_LONGEVITY_GUIDE_PDF_HREF,
} from "@/lib/guides/hliGuidePdfs";

const QUICK_START_PATHS = [
  {
    href: "/insights/what-blood-tests-matter-for-hair-loss",
    title: "Blood tests and hair loss",
    line: "When ferritin, thyroid, and other labs help, and why a universal panel is not the answer.",
  },
  {
    href: "/insights/dht-and-androgenetic-alopecia",
    title: "Pattern thinning and DHT",
    line: "A plain-English entry point for male- and female-pattern hair loss questions.",
  },
  {
    href: "/insights/telogen-effluvium-after-illness-or-stress",
    title: "Stress, illness, and shedding",
    line: "How delayed shedding works, what recovery often looks like, and when to get checked.",
  },
  {
    href: "/treatments",
    title: "Treatment pathways",
    line: "Keep reading by medication, topical therapy, procedures, and expectation-setting questions.",
  },
] as const;

const TAKEAWAYS = [
  "Hair loss is a clinical pattern problem first: the most useful question is usually what type of change is happening, not which product to buy.",
  "Pattern thinning, shedding, scalp inflammation, and systemic contributors can overlap, so broad advice often fails when it treats all hair loss as one thing.",
  "Testing can help in the right context, but it is guided by history and examination rather than a routine internet panel for everyone.",
  "Treatment categories only make sense after the likely diagnosis, timeline, and expectations are clear.",
  "HLI takes a biology-first, diagnosis-first view of hair longevity: clarify the pattern, look for important contributors, then choose the next step responsibly.",
];

const MAIN_CAUSES = [
  "Pattern hair loss: androgen-sensitive thinning in men and women that usually shows up as recession, crown thinning, or gradual density loss over time.",
  "Telogen shedding: increased shedding after stress, illness, hormonal transition, childbirth, surgery, or another trigger, often appearing weeks to months after the event.",
  "Scalp disease or inflammation: itch, flaking, soreness, redness, or inflammatory conditions that may worsen shedding or sit alongside pattern loss.",
  "Systemic or nutritional contributors: iron deficiency, thyroid dysfunction, medication effects, and other health issues that can change the picture when the history fits.",
];

const TESTING_POINTS = [
  "Ferritin, full blood count, and iron-related testing when low iron is plausible from symptoms, history, or recovery demands.",
  "Thyroid testing when the story includes diffuse loss, postpartum change, fatigue, menstrual disruption, or other endocrine clues.",
  "Selected hormone or metabolic testing in narrower situations rather than as a blanket screen for every patient with thinning.",
  "Photography, timeline review, and scalp pattern assessment because not all useful \"testing\" is a blood test.",
];

const TREATMENT_CATEGORIES = [
  "Observation and reassurance when the pattern is likely self-limited and there are no clear red flags.",
  "Medical therapies such as topical or prescription-led treatment when pattern hair loss is likely and the risk-benefit discussion makes sense.",
  "Scalp-directed treatment when inflammation, flaking, irritation, or another scalp condition seems central.",
  "General-health correction when iron, thyroid, nutrition, recovery load, or another systemic contributor is meaningfully involved.",
  "Procedural options in selected cases, usually after the diagnosis and long-term maintenance conversation are already clearer.",
];

const FAQ_ITEMS = [
  {
    question: "Who should start with this guide?",
    answer:
      "Anyone who wants the big-picture framework first. It is the best starting point if you are not yet sure whether your main issue is shedding, pattern thinning, hormones, scalp inflammation, or treatment planning.",
  },
  {
    question: "Does this replace the more specific guides?",
    answer:
      "No. Think of it as the overview that helps you choose the right deeper guide. Once you know whether you need postpartum, medications, male pattern loss, or androgen-specific detail, jump into the matching pillar page.",
  },
  {
    question: "What does hair loss actually mean clinically?",
    answer:
      "Clinically, hair loss is not one single diagnosis. Doctors usually begin by separating active shedding from patterned miniaturisation, scalp disease, breakage, or mixed pictures. That distinction shapes whether reassurance, testing, scalp treatment, or treatment planning is the right next step.",
  },
  {
    question: "Do blood tests help everyone with hair loss?",
    answer:
      "No. Blood tests are most useful when they match the history and examination. Some people clearly need targeted testing; others mainly need pattern recognition, scalp assessment, or a more realistic treatment conversation rather than a broad panel.",
  },
  {
    question: "Why does diagnosis-first matter so much?",
    answer:
      "Because different hair-loss patterns respond to very different next steps. Starting treatment without understanding the likely cause can delay useful care, create false reassurance, or push you toward products that do not fit the problem.",
  },
  {
    question: "Does the PDF and the web page do the same job?",
    answer:
      "They cover the same core territory, but the web page also routes you into the live HLI insight articles and hubs so you can keep reading topic by topic.",
  },
  {
    question: "Will this tell me what treatment to use?",
    answer:
      "It helps you understand the landscape and ask better questions, but it does not prescribe or diagnose. Treatment fit still depends on your pattern, timeline, medical history, and clinician review.",
  },
];

const RELATED = [
  {
    href: "/guides/hair-loss-medications",
    category: "Treatment Guide",
    title: "Hair Loss Medications in 2026",
    description: "Move from broad strategy into medication categories, risks, and evidence-based comparisons.",
  },
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description: "Best if recession, crown thinning, or DHT questions are driving your search.",
  },
  {
    href: "/guides/postpartum-hair-loss",
    category: "Women's Hair Health",
    title: "The Truth About Postpartum Hair Loss",
    description: "Go deeper if shedding after pregnancy is the clearest part of your story.",
  },
  {
    href: "/guides/androgen-index",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    description: "Use this when your broad guide questions narrow into hormones, DHT, or androgen-sensitive thinning.",
  },
];

const SUPPORTING_READS = [
  {
    href: "/insights/what-blood-tests-matter-for-hair-loss",
    category: "Testing",
    title: "Blood tests and hair loss: what may actually help",
    description: "The strongest next read if you are wondering whether ferritin, thyroid, or other labs should be part of your work-up.",
  },
  {
    href: "/guides/postpartum-hair-loss",
    category: "Women's Hair Health",
    title: "The Truth About Postpartum Hair Loss",
    description: "Best for shedding after birth, recovery timelines, and deciding when reassurance is enough versus when testing may fit.",
  },
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description: "Start here if temple recession, crown thinning, or long-term pattern progression is your main concern.",
  },
  {
    href: "/guides/androgen-index",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    description: "Use this when broad hair-loss questions become hormone, DHT, or androgen-exposure questions.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/hair-longevity",
  title: "Hair loss: causes, diagnosis, labs & treatment pathways",
  metaDescription:
    "Start-here overview: what hair loss means in practice, common patterns, diagnosis-first thinking, when tests help, and how treatment choices fit your story. Educational — not a substitute for your clinician.",
  appendBrand: true,
});

export default function HairLongevityFoundationalGuidePage() {
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
        guidePath="/guides/hair-longevity"
        lastBreadcrumbName="Hair longevity overview"
        faqItems={FAQ_ITEMS}
      />

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="foundational-guide-heading">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Foundational Guide</p>
            <h1
              id="foundational-guide-heading"
              className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]"
              style={{ lineHeight: 1.2 }}
            >
              The Complete Guide to Hair Longevity
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              Start here if you want one broad, patient-first guide to what hair loss usually means, how doctors separate
              thinning from shedding, which causes are most common, what testing may help, and how treatment pathways are
              usually framed. Download the guide as a PDF, or use the sections below as your web-based master overview.
            </p>
            <div className="mt-10 flex justify-center">
              <SecondaryButton href={HAIR_LONGEVITY_GUIDE_PDF_HREF} download={HAIR_LONGEVITY_GUIDE_PDF_DOWNLOAD_AS}>
                Download PDF
              </SecondaryButton>
            </div>
          </div>

          <ul className="mx-auto mt-14 grid max-w-5xl list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {QUICK_START_PATHS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col rounded-card border border-[rgb(var(--border-soft))] bg-subtle/50 p-5 shadow-soft transition hover:border-[rgb(var(--gold))]/25 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
                >
                  <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">{item.title}</span>
                  <span className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">{item.line}</span>
                  <span className="mt-3 text-sm font-medium text-medical">Read →</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-[rgb(var(--text-muted))]">
            For topic-specific downloads, see{" "}
            <Link href="/guides" className="font-medium text-medical underline-offset-2 hover:underline">
              all guides
            </Link>
            .
          </p>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="foundational-decide">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-decide" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What this guide helps you decide
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Broad hair-loss searches often hide a narrower real question underneath: are you dealing with a common
              pattern problem, a temporary shedding event, a scalp issue, a systemic contributor, or a mixed picture?
              This guide is designed to help you decide whether the next useful move is reassurance, targeted testing, a
              better diagnosis conversation, or a treatment-planning discussion.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              It is also meant to stop the usual internet spiral. Instead of jumping straight from hair concern to
              supplement list or medicine debate, this page helps you work out what category of problem you may be
              looking at and which HLI guide or insight article should come next.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="foundational-takeaways">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-takeaways" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="foundational-who">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-who" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Who this guide is for
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              It is written as the broad HLI “start here” page. If you have noticed more shedding, less density, part
              widening, recession, crown thinning, or a change in scalp comfort and do not yet know how those pieces fit
              together, this is the right place to begin.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              <li>People at the start of their hair-loss research who do not yet know which explanation fits best</li>
              <li>Patients trying to connect shedding, pattern change, blood tests, scalp symptoms, and treatment claims into one framework</li>
              <li>Partners, family members, or clinicians who want the HLI overview before diving into narrower topics</li>
              <li>Anyone who prefers to understand the landscape before buying tests, supplements, or procedures</li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="foundational-clinical-meaning">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-clinical-meaning" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What hair loss means clinically
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              In clinic, “hair loss” is not treated as one single entity. A doctor is usually trying to work out whether
              the main issue is increased shedding, gradual follicular miniaturisation, hair breakage, inflammation on the
              scalp, or several processes happening together. That matters because each of those patterns points toward a
              different kind of next step.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              For example, a patient with sudden shedding after illness or childbirth may need a very different
              conversation from someone with slow crown thinning over years. The first may need timeline-based
              reassurance and selective testing. The second may need a more classic pattern-loss discussion. This is why
              HLI tries to translate hair-loss concerns into clinical categories rather than leaving them at the vague
              level of “my hair is falling out.”
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="foundational-causes">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-causes" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Main causes of hair loss
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The common causes are broader than most people expect. Broadly, HLI thinks in terms of pattern loss,
              shedding, scalp disease, and systemic contributors. Those buckets are often more useful than chasing one
              trendy theory from social media.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              {MAIN_CAUSES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              This is also why one guide cannot do every job in full. If postpartum timing is central, the{" "}
              <Link href="/guides/postpartum-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                postpartum guide
              </Link>{" "}
              is the better branch. If recession or crown thinning is central, the{" "}
              <Link href="/guides/male-pattern-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                male pattern hair loss guide
              </Link>{" "}
              goes deeper. If DHT, TRT, or androgen exposure is the real question, move into the{" "}
              <Link href="/guides/androgen-index" className="font-medium text-medical underline-offset-2 hover:underline">
                androgen guide
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="foundational-diagnosis">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-diagnosis" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Why diagnosis-first matters
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Diagnosis-first does not mean every patient needs a dramatic work-up. It means the most sensible next step
              depends on understanding the likely pattern before committing to treatment. Without that, it is easy to
              over-test, under-treat, or spend months on options that do not fit the actual problem.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              This is especially important because hair loss is often emotionally urgent but biologically slow. People
              naturally want to act fast. The HLI view is that speed is useful when it serves clarity: document the
              timeline, sort likely causes, identify any red flags, and only then decide whether reassurance, blood
              tests, scalp treatment, or longer-term treatment planning is warranted.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="foundational-testing">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-testing" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What testing may help
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Testing is helpful when it answers a real question raised by the history, timeline, or examination. It is
              less helpful when it is used as a substitute for diagnosis. In practice, that usually means targeted blood
              work, photo comparison, and pattern recognition rather than a reflex “everything panel.”
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              {TESTING_POINTS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              If testing is the part you need most, the best companion read is{" "}
              <Link href="/insights/what-blood-tests-matter-for-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                blood tests and hair loss: what may actually help
              </Link>
              . It explains why ferritin, thyroid, and other labs matter in some stories and not others.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="foundational-treatment-categories">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-treatment-categories" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Treatment categories overview
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Once the likely diagnosis is clearer, treatment discussions become much easier to frame. HLI usually thinks
              in broad categories first, then narrows to what may fit the individual situation.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              {TREATMENT_CATEGORIES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The point is not to force every patient into treatment. Sometimes the most responsible plan is to watch,
              support recovery, and avoid over-medicalising a self-limited phase. Other times, especially in clearer
              pattern loss, the focus shifts toward long-term maintenance and realistic expectations. If you are already
              narrowing into medicines and evidence tiers, continue with the{" "}
              <Link href="/guides/hair-loss-medications" className="font-medium text-medical underline-offset-2 hover:underline">
                hair loss medications guide
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="foundational-hli-view">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-hli-view" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              How HLI thinks about hair longevity
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Hair longevity is not just about stopping hair loss. It is about understanding the long-term biology around
              your follicles, your scalp, your hormone and recovery context, and the decisions that shape what happens
              over years rather than days. That is why HLI is deliberately biology-first and patient-first.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              In practical terms, that means building from history, pattern, timeline, and selective data rather than
              hype. It also means staying medically responsible: educational guidance is useful, but it does not replace
              your own GP, dermatologist, endocrinologist, or prescriber. The aim is clearer thinking, better questions,
              and more coherent next steps.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="foundational-help-sooner">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 id="foundational-help-sooner" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              When to seek help sooner
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Some hair-loss stories are reasonable to watch for a while. Others deserve faster review. Seek help sooner
              if the shedding is extreme, the loss is rapid and patchy, the scalp is painful or inflamed, you notice
              systemic symptoms, or the change clearly does not fit a reassuring timeline.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Earlier review can also make sense when hair change is affecting mood or confidence heavily, when the cause
              seems mixed, or when you are about to start treatments and want a stronger diagnosis-first foundation
              before committing.
            </p>
          </div>
        </Container>
      </section>

      <GuideInsightArticleGroups pillar="hair-longevity" headingId="foundational-insight-clusters" />

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-label="Frequently asked questions">
        <Container>
          <div className="mx-auto max-w-2xl">
            <EditorialFaqSection items={FAQ_ITEMS} />
          </div>
        </Container>
      </section>

      <GuideSupportingReads
        items={SUPPORTING_READS}
        headingId="foundational-next-reads"
        intro="Once the broad picture is clearer, move into the supporting article or guide that best matches your real question."
      />

      <GuideRelatedGuides items={RELATED} headingId="foundational-related" />

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="foundational-next-heading">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 id="foundational-next-heading" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Ready for a personalised plan?
            </h2>
            <p className="mt-3 text-sm text-[rgb(var(--text-secondary))] leading-relaxed sm:text-base">
              Structured intake, optional photos and labs, and specialist interpretation. Most cases are reviewed within 12–24 hours after complete submission.
            </p>
            <div className="mt-8">
              <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="py-10">
          <PublicFooter theme="light" />
        </div>
      </Container>
    </main>
  );
}
