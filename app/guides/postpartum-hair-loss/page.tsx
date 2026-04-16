import type { Metadata } from "next";
import Link from "next/link";
import { isLongevityEnabled } from "@/lib/features";
import { GuideLibraryAssessmentCTA } from "@/components/guides/GuideLibraryAssessmentCTA";
import { GuideRelatedGuides } from "@/components/guides/GuideRelatedGuides";
import { GuideSupportingReads } from "@/components/guides/GuideSupportingReads";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { Container, SecondaryButton } from "@/components/public/PublicCTA";
import { buildPageMetadata } from "@/lib/seo/metadata";
import EditorialFaqSection from "@/components/editorial/EditorialFaqSection";
import HomeFaqJsonLd from "@/components/editorial/HomeFaqJsonLd";
import {
  POSTPARTUM_GUIDE_PDF_DOWNLOAD_AS,
  POSTPARTUM_GUIDE_PDF_HREF,
} from "@/lib/guides/postpartumGuidePdf";

const MAIN_INSIGHT = "/insights/postpartum-shedding-when-to-reassure-vs-when-to-test";

const READ_SECTIONS: { href: string; label: string }[] = [
  { href: `${MAIN_INSIGHT}#normal-postpartum-shedding`, label: "Why postpartum shedding happens" },
  { href: `${MAIN_INSIGHT}#when-reassurance-fits`, label: "What is usually normal vs when to watch closely" },
  { href: `${MAIN_INSIGHT}#red-flags-testing`, label: "When deeper investigation may be appropriate" },
  { href: `${MAIN_INSIGHT}#overlap-thyroid-iron`, label: "Thyroid, ferritin, recovery strain, and overlap factors" },
  { href: `${MAIN_INSIGHT}#hair-cycle-timelines`, label: "How recovery timelines often unfold" },
  { href: `${MAIN_INSIGHT}#partner-with-clinician`, label: "Practical next steps and when to seek help" },
];

const TAKEAWAYS = [
  "Postpartum shedding is common, often delayed, and usually improves over time, but it still deserves calm clinical interpretation rather than blanket reassurance.",
  "The most useful question is often not \"is this postpartum hair loss?\" but \"does this still fit a normal postpartum pattern, or is something else worth considering?\"",
  "Timing, severity, scalp symptoms, overall health, ferritin, thyroid context, and family history can all affect whether monitoring is enough or whether testing may help.",
  "Postpartum shedding can overlap with female pattern thinning, low iron, thyroid change, or recovery strain, so prolonged or unusual loss deserves a fuller look.",
  "A patient-first approach balances reassurance where it is appropriate with targeted review where the story no longer fits a typical recovery path.",
];

const FAQ_ITEMS = [
  {
    question: "Is postpartum shedding always normal?",
    answer:
      "Often it is part of a normal postpartum hair-cycle shift, but not every case should be dismissed automatically. Timing, duration, severity, associated symptoms, and whether the loss is improving all help decide whether reassurance still fits.",
  },
  {
    question: "When should I monitor and when should I get checked?",
    answer:
      "Monitoring is often reasonable when shedding follows a typical postpartum timeline and gradually settles. Review becomes more sensible when the pattern is severe, prolonged, clearly worsening, unusually patchy, or accompanied by fatigue, scalp symptoms, menstrual concerns, or other health changes.",
  },
  {
    question: "Can low iron or ferritin matter after pregnancy?",
    answer:
      "Yes, in some cases. Iron depletion, blood loss, nutritional strain, and recovery demands can all make ferritin worth discussing with your clinician, especially if the wider history supports it.",
  },
  {
    question: "Can postpartum shedding reveal pattern hair loss?",
    answer:
      "Yes. Postpartum shedding may sit on top of an underlying tendency toward female pattern thinning, which is one reason persistent loss, wider parting, or a change that does not recover as expected deserves a more structured review.",
  },
  {
    question: "Do blood tests help everyone with postpartum hair loss?",
    answer:
      "No. Tests help most when they answer a real question raised by symptoms, timing, medical history, recovery demands, or examination. They are less useful as a routine panel for everyone.",
  },
  {
    question: "What can actually help while I wait for recovery?",
    answer:
      "Supportive care often matters most: gentle hair handling, realistic expectations, recovery support, and avoiding impulsive treatment choices before the likely cause is clearer. Some people also benefit from targeted review if the story no longer looks typical.",
  },
  {
    question: "Why does this page also link to other guides and insight articles?",
    answer:
      "This page is the postpartum pillar page. It gives the broad framework first, then routes you into deeper reads on ferritin, blood tests, and overlapping thinning patterns when those questions become the real priority.",
  },
];

const SUPPORTING_READS = [
  {
    href: MAIN_INSIGHT,
    category: "Postpartum insight",
    title: "Hair shedding after pregnancy: what’s normal and when to get checked",
    description: "The closest companion article for section-by-section detail on reassurance versus testing decisions.",
  },
  {
    href: "/insights/ferritin-and-hair-loss",
    category: "Iron & ferritin",
    title: "Ferritin and hair loss: what your result can and can’t tell you",
    description: "Best next read if postpartum recovery, low iron, or blood loss is making ferritin part of the conversation.",
  },
  {
    href: "/insights/what-blood-tests-matter-for-hair-loss",
    category: "Testing",
    title: "Blood tests and hair loss: what may actually help",
    description: "Useful when you want a calm overview of which blood tests may matter and why not everyone needs the same panel.",
  },
  {
    href: "/insights/thyroid-hair-loss-explained",
    category: "Thyroid",
    title: "Thyroid and hair loss: what patients should know",
    description: "A good follow-on read when postpartum symptoms or timing make thyroid questions part of the picture.",
  },
];

const RELATED = [
  {
    href: "/guides/hair-longevity",
    category: "Foundational Guide",
    title: "The Complete Guide to Hair Longevity",
    description: "Broad biology-first context before narrowing into postpartum shedding and recovery.",
  },
  {
    href: "/guides/male-pattern-hair-loss",
    category: "Men's Hair Health",
    title: "Male Pattern Hair Loss: Causes, Stages, and What Actually Helps",
    description: "A parallel guide for pattern-driven thinning, progression, and evidence-based treatment framing.",
  },
  {
    href: "/guides/androgen-index",
    category: "Hormones & Hair",
    title: "Testosterone, DHT, TRT, Steroids, and Hair Loss Risk in Men and Women",
    description: "How hormones, follicular sensitivity, and androgen biology fit into broader hair-loss assessment.",
  },
];

const wrap = "mx-auto max-w-2xl";

export const metadata: Metadata = buildPageMetadata({
  path: "/guides/postpartum-hair-loss",
  title: "Postpartum hair loss and shedding guide: what is normal, when to test, when to monitor",
  metaDescription:
    "A calm, clinically grounded guide to postpartum hair loss and postpartum shedding: what is normal, typical timing, when to monitor, when blood tests may help, and when professional review is worth considering.",
  appendBrand: true,
});

export default function PostpartumHairLossGuidePage() {
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-14 sm:py-20" aria-labelledby="pp-guide-hero">
        <Container>
          <div className={`${wrap} text-center`}>
            <p className="text-sm font-medium tracking-[0.15em] text-[rgb(var(--gold))]">Women&apos;s Hair Health</p>
            <h1
              id="pp-guide-hero"
              className="mt-4 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-4xl md:text-[2.25rem]"
              style={{ lineHeight: 1.2 }}
            >
              The Truth About Postpartum Hair Loss
            </h1>
            <p className="mt-5 text-base text-[rgb(var(--text-secondary))] sm:text-lg" style={{ lineHeight: "var(--line-height-relaxed)" }}>
              The broad HLI guide to postpartum shedding: what usually happens after birth, what still fits a normal
              recovery window, when it makes sense to monitor, when blood tests may help, and when postpartum shedding may
              not be the full story.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <SecondaryButton href={MAIN_INSIGHT}>Continue reading</SecondaryButton>
              <SecondaryButton href={POSTPARTUM_GUIDE_PDF_HREF} download={POSTPARTUM_GUIDE_PDF_DOWNLOAD_AS}>
                Download PDF
              </SecondaryButton>
            </div>
            <p className="mt-6 text-sm text-[rgb(var(--text-muted))] leading-relaxed">
              Read online from the top or keep the PDF for offline reference during recovery.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="pp-why">
        <Container>
          <div className={wrap}>
            <h2 id="pp-why" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Why this guide matters
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Postpartum shedding is common, but it can still feel unsettling when it happens in clumps, lasts longer
              than expected, or arrives at the same time as exhaustion and the rest of postnatal recovery. This page is
              designed to be the broad “start here” resource for HLI: calm, clinically grounded, and clear about the
              difference between cases that are usually reassuring and cases that are worth investigating more closely.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The aim is not to alarm you and not to dismiss you. Many postpartum hair changes improve with time. But not
              every postpartum story should be waved away automatically. Timing, severity, ferritin status, thyroid
              context, scalp symptoms, and the possibility of overlap with pattern thinning all matter when deciding what
              to do next.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-decide">
        <Container>
          <div className={wrap}>
            <h2 id="pp-decide" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What this guide helps you decide
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Use this page to answer the real postpartum questions that tend to sit behind a generic search for “hair
              loss after pregnancy.” Does the timing still fit a usual postpartum pattern? Is watchful waiting still
              reasonable? Do iron or thyroid questions now make more sense? Does the change look more persistent or more
              patterned than simple shedding alone?
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              It also helps you decide what kind of next step is most sensible. For some women, the answer is gentle
              monitoring, recovery support, and time. For others, especially when the story no longer looks typical, a
              targeted medical review is more helpful than either panic or blanket reassurance.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-what-is">
        <Container>
          <div className={wrap}>
            <h2 id="pp-what-is" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What postpartum shedding is
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Postpartum shedding is usually a hair-cycle shift rather than sudden permanent loss of all the hair you see
              coming out. During pregnancy, many hairs stay in a prolonged growth phase for longer than usual. After
              birth, those hairs gradually move back into the normal cycle. The result can be a noticeable increase in
              shedding a few months later, often when you are finally trying to settle into recovery.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              That delayed timing is one reason the experience can feel confusing. The shedding often starts after the
              birth itself, not during the immediate postnatal period, and it can feel disproportionate when you see hair
              on the brush, shower floor, or pillow. In many cases, that still sits within a normal postpartum recovery
              pattern. The key question is whether the wider story continues to fit.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="pp-timing">
        <Container>
          <div className={wrap}>
            <h2 id="pp-timing" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Typical postpartum timing
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Typical postpartum shedding often becomes more noticeable several weeks to a few months after birth rather
              than immediately. It may then continue for a period before gradually settling. Recovery is not identical for
              everyone, and the pace can be affected by sleep deprivation, nutrition, breastfeeding demands, blood loss,
              and the general strain of postnatal recovery.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              What matters most is the trend. A course that begins in a plausible postpartum window and then slowly
              improves is usually less concerning than one that seems to keep escalating, stays heavy well beyond the
              expected window, or never quite looks like simple shedding in the first place.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-takeaways">
        <Container>
          <div className={wrap}>
            <h2 id="pp-takeaways" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
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

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="pp-normal-vs-not">
        <Container>
          <div className={wrap}>
            <h2 id="pp-normal-vs-not" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What is normal vs what is not
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Usually reassuring cases tend to follow a believable postpartum timeline, involve diffuse shedding rather
              than sharply localised loss, and show signs of settling with time. The experience may still be upsetting,
              but it broadly behaves the way postpartum shedding is expected to behave.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Less typical cases are not automatically serious, but they are worth treating with more curiosity. That may
              include very prolonged loss, clear worsening rather than recovery, strong scalp symptoms, patchiness,
              significant fatigue or broader health changes, or a new pattern that looks more like part widening or crown
              thinning than simple postpartum shedding.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-normal">
        <Container>
          <div className={wrap}>
            <h2 id="pp-normal" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What is usually normal
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              What is usually normal after pregnancy is not “no shedding at all.” It is some degree of increased
              shedding, often delayed, often diffuse, and often gradually improving as the months move on. It may feel
              dramatic day to day and still fall within a normal postpartum course.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Normal does not mean insignificant. Even a typical postpartum shedding course can affect confidence and feel
              emotionally heavy, especially when you are already coping with a major transition. Calm reassurance is most
              helpful when it still leaves room for observation, questions, and a plan for what to do if recovery stops
              looking typical.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="pp-not-full-story">
        <Container>
          <div className={wrap}>
            <h2 id="pp-not-full-story" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              When postpartum shedding may not be the full story
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Postpartum shedding may overlap with other contributors rather than explaining everything on its own. Low
              ferritin, thyroid change, nutritional strain, inflammatory scalp issues, and an underlying tendency toward
              female pattern thinning can all sit in the background and become more visible during the postnatal period.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              This is one of the reasons a postpartum label should not end the conversation too early. If your hair is not
              recovering the way you expected, if your part looks wider, if density seems to keep dropping, or if the
              picture no longer feels like simple diffuse shedding, a more structured review is often more useful than
              continuing to wait indefinitely.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-test-vs-monitor">
        <Container>
          <div className={wrap}>
            <h2 id="pp-test-vs-monitor" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              When to test vs when to monitor
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Monitoring is often reasonable when the story looks typical: the timing fits, the shedding is diffuse, you
              are otherwise well, and the trend seems broadly stable or slowly improving. In that setting, gentle support,
              realistic expectations, and a plan to reassess if the picture changes may be enough.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Testing becomes more attractive when there are clues that postpartum shedding alone may not explain the full
              picture. That might include prolonged loss, stronger fatigue, menstrual or endocrine concerns, significant
              blood loss history, restricted intake, symptoms suggestive of thyroid dysfunction, or a pattern that looks
              less like diffuse postpartum shedding and more like something persistent.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="pp-blood-tests">
        <Container>
          <div className={wrap}>
            <h2 id="pp-blood-tests" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              When blood tests may help
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Blood tests may help when they answer a real postpartum question rather than simply filling space on a form.
              Iron-related testing may matter when blood loss, low intake, fatigue, or recovery strain make low ferritin
              plausible. Thyroid testing may matter when the timing or wider symptoms make an endocrine contributor worth
              discussing. The best way to think about labs is not “everyone needs them,” but “which question are we trying
              to answer?”
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              If ferritin is the part you want to understand more clearly, continue with{" "}
              <Link href="/insights/ferritin-and-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                our ferritin and hair loss guide
              </Link>
              . If you want the broader testing framework, read{" "}
              <Link href="/insights/what-blood-tests-matter-for-hair-loss" className="font-medium text-medical underline-offset-2 hover:underline">
                blood tests and hair loss: what may actually help
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-what-helps">
        <Container>
          <div className={wrap}>
            <h2 id="pp-what-helps" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              What can help
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              What helps depends on which lane you are in. When the course looks typical, what often helps most is
              reassurance with structure: gentle hair care, avoiding panic-buying, supporting overall recovery, and
              giving the hair cycle time to settle. What helps less is assuming that every postpartum shedding episode
              needs an aggressive treatment plan immediately.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              When the story is less typical, help may mean something different: targeted testing, scalp review, clearer
              diagnosis, or discussion of whether a second process is overlapping with postpartum shedding. The main goal
              is not to do more for the sake of it, but to match the next step to the actual story in front of you.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-labelledby="pp-professional-review">
        <Container>
          <div className={wrap}>
            <h2 id="pp-professional-review" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              When to seek professional review
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Professional review becomes more worthwhile when the story feels less reassuring: the timing is unusual, the
              shedding is very heavy or prolonged, the scalp is itchy or sore, the pattern looks focal or widening rather
              than diffuse, or broader symptoms suggest that ferritin, thyroid function, or another health factor may be
              involved.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              Review can also be helpful simply because uncertainty is costly. If you are stuck between being told “it is
              normal” and feeling that something does not add up, a calmer diagnosis-first conversation is often more
              useful than either waiting in doubt or starting random treatments without clarity.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-[rgb(var(--border-soft))] bg-card py-12 sm:py-16" aria-labelledby="pp-read">
        <Container>
          <div className={wrap}>
            <h2 id="pp-read" className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] sm:text-2xl">
              Read online — guided entry points
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
              The companion postpartum insight article can be read from the top or used section by section depending on
              whether you want a quick check-in, a timing refresher, or a deeper read on reassurance versus testing.
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
              <li>
                <Link
                  href={MAIN_INSIGHT}
                  className="rounded-sm text-sm font-medium text-medical underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--medical))]/40 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
                >
                  Open the full article from the top →
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <GuideSupportingReads
        items={SUPPORTING_READS}
        headingId="pp-next-reads"
        intro="Once the broad postpartum picture is clear, move into the supporting read that best matches the question you still need answered."
      />

      <section className="border-b border-[rgb(var(--border-soft))] bg-subtle py-12 sm:py-16" aria-label="Frequently asked questions">
        <Container>
          <div className={wrap}>
            <EditorialFaqSection items={FAQ_ITEMS} />
          </div>
        </Container>
      </section>

      <GuideRelatedGuides items={RELATED} headingId="pp-related" />

      <GuideLibraryAssessmentCTA startHref={startHref} headingId="pp-assessment-cta" />

      <Container>
        <div className="py-10">
          <PublicFooter theme="light" />
        </div>
      </Container>
    </main>
  );
}
