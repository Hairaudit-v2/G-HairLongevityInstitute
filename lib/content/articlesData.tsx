import Link from "next/link";
import type { EditorialArticle } from "@/lib/content/types";
import { glossaryPath } from "@/lib/content/glossary";

function FerritinBody() {
  return (
    <div className="editorial-prose space-y-6 text-[rgb(var(--text-secondary))]">
      <p className="text-base leading-relaxed text-[rgb(var(--text-primary))]">
        Low iron stores are one of several reversible contributors that clinicians may consider when someone reports
        increased shedding or reduced volume. This article explains how ferritin is commonly used in that conversation —
        without replacing personalised medical interpretation.
      </p>
      <h2 id="what-ferritin-reflects" className="scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]">
        What ferritin reflects
      </h2>
      <p className="leading-relaxed">
        Ferritin is a surrogate marker of iron storage. It moves with inflammation, chronic disease, and supplementation,
        so a single number is rarely interpreted in isolation. Your clinician may pair ferritin with other blood indices
        and your history.
      </p>
      <h2 id="hair-context" className="scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]">
        Hair context
      </h2>
      <p className="leading-relaxed">
        In hair medicine, ferritin is often discussed when shedding patterns overlap with{" "}
        <Link href={glossaryPath("telogen-effluvium")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium
        </Link>{" "}
        or when symptoms coincide with fatigue, heavy menstrual loss, or restricted intake — always assessed as part of a
        broader picture.
      </p>
      <h2 id="when-bloods-help" className="scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]">
        When blood tests help
      </h2>
      <p className="leading-relaxed">
        Blood markers can clarify whether nutritional, thyroid, or other systemic factors deserve attention alongside
        pattern-based hair loss. They do not, on their own, define a cosmetic outcome.
      </p>
    </div>
  );
}

function CausesOverviewBody() {
  return (
    <div className="editorial-prose space-y-6 text-[rgb(var(--text-secondary))]">
      <p className="text-base leading-relaxed text-[rgb(var(--text-primary))]">
        Hair loss is rarely monocausal. A biology-first assessment looks at pattern, timing, scalp health, hormones,
        nutrition, medications, and history together — then prioritises what to verify or adjust.
      </p>
      <h2 id="pattern-and-timing" className="scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]">
        Pattern and timing
      </h2>
      <p className="leading-relaxed">
        Androgen-sensitive patterns, diffuse shedding, and inflammatory scalp disease can overlap. How quickly symptoms
        began and whether they fluctuate often guide the next questions your specialist will ask.
      </p>
      <h2 id="androgen-pathways" className="scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]">
        Androgen pathways
      </h2>
      <p className="leading-relaxed">
        <Link href={glossaryPath("dht")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT
        </Link>{" "}
        is one piece of androgenetic patterning, not the entire story. Context includes genetics, sensitivity, concurrent
        shedding drivers, and treatment history.
      </p>
      <h2 id="systemic-factors" className="scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]">
        Systemic factors
      </h2>
      <p className="leading-relaxed">
        Thyroid shifts, iron stores, illness recovery, and significant stress can each influence the hair cycle. Blood
        tests are used selectively when they change management or clarify risk.
      </p>
    </div>
  );
}

export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    slug: "ferritin-hair-shedding-clinical-context",
    title: "Ferritin, iron stores, and hair shedding: clinical context",
    deck: "How ferritin fits into hair biology conversations — without turning a single lab value into a diagnosis.",
    description:
      "Learn how ferritin and iron stores are discussed in hair shedding and telogen effluvium contexts, what labs cannot tell you alone, and when to review results with a clinician.",
    hub: "blood-markers",
    audience: "patients",
    contentType: "interpretation",
    ctaType: "start-assessment",
    publishedAt: "2026-03-01",
    updatedAt: "2026-03-15",
    reviewedAt: "2026-03-10",
    taxonomy: {
      markers: ["ferritin", "iron-studies"],
      symptoms: ["shedding", "reduced-volume"],
      conditions: ["telogen-effluvium"],
      tags: ["blood-tests", "nutrition"],
    },
    authors: [
      {
        name: "Hair Longevity Institute Editorial",
        role: "Clinical education",
        credentials: "Trichology-led medical writing",
      },
    ],
    reviewers: [
      {
        name: "HLI Clinical Review",
        role: "Medical accuracy review",
        credentials: "Senior trichology review per internal protocol",
      },
    ],
    toc: [
      { id: "what-ferritin-reflects", label: "What ferritin reflects" },
      { id: "hair-context", label: "Hair context" },
      { id: "when-bloods-help", label: "When blood tests help" },
    ],
    faq: [
      {
        question: "Does a low ferritin prove my hair loss is from iron?",
        answer:
          "Not by itself. Ferritin is one clue among many. Pattern, history, exam, and other labs help clinicians interpret whether iron optimisation is a priority for you.",
      },
      {
        question: "Should I start iron supplements without a clinician?",
        answer:
          "Self-supplementing can miss the underlying issue or cause side effects. Discuss results and dosing with a qualified clinician.",
      },
    ],
    relatedSlugs: ["hair-loss-causes-biology-first-overview"],
    glossarySlugs: ["ferritin", "telogen-effluvium"],
    references: [
      {
        label: "NHS — Iron deficiency anaemia (patient information)",
        url: "https://www.nhs.uk/conditions/iron-deficiency-anaemia/",
      },
    ],
    Body: FerritinBody,
  },
  {
    slug: "hair-loss-causes-biology-first-overview",
    title: "Hair loss causes: a biology-first overview",
    deck: "Why effective planning looks beyond a single label — pattern, scalp, hormones, and recovery context together.",
    description:
      "An evidence-framed overview of how hair loss causes are assessed in clinical trichology: patterns, androgens, shedding, and when further testing is appropriate.",
    hub: "hair-loss-causes",
    audience: "both",
    contentType: "guide",
    ctaType: "read-more",
    publishedAt: "2026-03-05",
    updatedAt: "2026-03-20",
    reviewedAt: "2026-03-18",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "telogen-effluvium"],
      symptoms: ["thinning", "shedding"],
      treatments: ["planning"],
      tags: ["assessment", "pathways"],
    },
    authors: [
      {
        name: "Hair Longevity Institute Editorial",
        role: "Clinical education",
        credentials: "Trichology-led medical writing",
      },
    ],
    reviewers: [
      {
        name: "HLI Clinical Review",
        role: "Medical accuracy review",
        credentials: "Senior trichology review per internal protocol",
      },
    ],
    toc: [
      { id: "pattern-and-timing", label: "Pattern and timing" },
      { id: "androgen-pathways", label: "Androgen pathways" },
      { id: "systemic-factors", label: "Systemic factors" },
    ],
    relatedSlugs: ["ferritin-hair-shedding-clinical-context"],
    glossarySlugs: ["dht", "telogen-effluvium"],
    Body: CausesOverviewBody,
  },
];
