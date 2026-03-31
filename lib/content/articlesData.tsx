import type { EditorialArticle, EditorialFaqItem, EditorialPerson, EditorialReference } from "@/lib/content/types";
import {
  BodyDiffuseThinningWomen,
  BodyDhtAndAga,
  BodyFerritinAndHairLoss,
  BodyFinasterideVsSawPalmetto,
  BodyHliVsHairaudit,
  BodyPrpVsExosomes,
  BodyThyroidHairLoss,
  BodyWhatBloodTestsMatter,
} from "@/lib/content/seed/bodies";

const author: EditorialPerson = {
  name: "Hair Longevity Institute Editorial",
  role: "Clinical education",
  credentials: "Trichology-led medical writing",
};

const reviewer: EditorialPerson = {
  name: "HLI Clinical Review",
  role: "Medical accuracy review",
  credentials: "Senior trichology review per internal protocol",
};

function refPending(topic: string): EditorialReference {
  return { label: `[Reference pending — to be replaced with peer-reviewed or authoritative source] ${topic}` };
}

function faqBlock(items: EditorialFaqItem[]): EditorialFaqItem[] {
  return items;
}

export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    slug: "what-blood-tests-matter-for-hair-loss",
    title: "What blood tests matter for hair loss?",
    deck: "A selective, clinician-aligned overview — not a universal lab shopping list.",
    description:
      "Understand which blood tests are commonly discussed for hair shedding and thinning, why panels are tailored to the person, and how results fit with examination and history.",
    excerpt:
      "Labs support hair assessment when chosen for the right reasons. Learn which themes matter, why ferritin and thyroid are often discussed, and what still requires an in-person review.",
    hub: "blood-markers",
    audience: "both",
    contentType: "guide",
    ctaType: "start-assessment",
    publishedAt: "2026-01-08",
    updatedAt: "2026-03-20",
    reviewedAt: "2026-03-18",
    taxonomy: {
      conditions: ["telogen-effluvium", "diffuse-thinning"],
      markers: ["ferritin", "tsh", "t4", "full-blood-count"],
      symptoms: ["diffuse-loss", "sudden-shedding"],
      treatments: ["laboratory-workup", "clinical-assessment"],
      tags: ["blood-tests", "interpretation", "primary-care"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "why-selective", label: "Why testing is selective" },
      { id: "iron-and-blood-count", label: "Full blood count and iron indices" },
      { id: "thyroid", label: "Thyroid function" },
      { id: "inflammation-nutrition", label: "Inflammation and nutrition" },
      { id: "fitting-together", label: "How labs fit with pattern and exam" },
      { id: "not-medical-advice", label: "What this is not" },
      { id: "when-specialist", label: "When a hair-focused review helps" },
    ],
    faq: faqBlock([
      {
        question: "Should everyone with hair loss get a full blood panel?",
        answer:
          "No. Testing should match your symptoms, examination, and history. Broad panels can create false reassurance or unnecessary follow-up without changing management.",
      },
      {
        question: "Can normal blood tests rule out all causes of shedding?",
        answer:
          "Not always. Pattern hair loss, early scalp disease, medication effects, and stress-related shedding may occur with normal routine labs. Assessment is broader than a printout.",
      },
      {
        question: "Is ferritin the most important test for hair?",
        answer:
          "It is important in some contexts, especially when iron deficiency is plausible — but it is never interpreted alone. See our ferritin article for nuance.",
      },
      {
        question: "Who should interpret my results?",
        answer:
          "Your GP, dermatologist, or trichology-aligned clinician. Educational services can help organise questions and context but do not replace prescribing or diagnosis.",
      },
    ]),
    relatedSlugs: [
      "ferritin-and-hair-loss",
      "thyroid-hair-loss-explained",
      "diffuse-thinning-in-women",
      "dht-and-androgenetic-alopecia",
    ],
    glossarySlugs: ["ferritin", "telogen-effluvium"],
    references: [
      refPending("Iron deficiency and hair shedding — clinical review"),
      refPending("Thyroid disease and hair cycle — guideline summary"),
      refPending("Approach to diffuse hair loss in adults"),
    ],
    Body: BodyWhatBloodTestsMatter,
  },
  {
    slug: "ferritin-and-hair-loss",
    title: "Ferritin and hair loss: what the number can and cannot tell you",
    deck: "Context for iron stores, shedding, and sensible next questions for your clinician.",
    description:
      "Ferritin reflects iron storage but moves with inflammation and other factors. Learn how clinicians use it in hair shedding conversations without over-interpreting a single value.",
    excerpt:
      "Ferritin often comes up when hair sheds — but it is not a solo diagnosis. Here is how storage iron is read in context, and why supplements need medical oversight.",
    hub: "blood-markers",
    audience: "patients",
    contentType: "interpretation",
    ctaType: "start-assessment",
    publishedAt: "2026-01-15",
    updatedAt: "2026-03-22",
    reviewedAt: "2026-03-19",
    taxonomy: {
      conditions: ["telogen-effluvium", "diffuse-thinning"],
      markers: ["ferritin", "iron-studies", "full-blood-count"],
      symptoms: ["sudden-shedding", "diffuse-loss"],
      treatments: ["iron-repletion", "dietary-review"],
      tags: ["nutrition", "shedding", "laboratory-interpretation"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "what-ferritin-is", label: "What ferritin represents" },
      { id: "shedding-context", label: "Shedding and telogen effluvium" },
      { id: "targets-and-ranges", label: "Targets and reference ranges" },
      { id: "with-thyroid", label: "Iron alongside thyroid tests" },
      { id: "supplements", label: "Supplements and monitoring" },
      { id: "summary", label: "Summary" },
    ],
    faq: faqBlock([
      {
        question: "Does low ferritin always mean I need iron tablets?",
        answer:
          "Not necessarily. Your clinician considers haemoglobin, symptoms, menstrual losses, diet, and whether another cause explains the result before recommending treatment.",
      },
      {
        question: "Can ferritin be normal and iron still be an issue?",
        answer:
          "Interpretation can be nuanced with inflammation or chronic disease. This is why labs are read as a set, not as single numbers in isolation.",
      },
      {
        question: "Will fixing ferritin restore my hair density immediately?",
        answer:
          "Hair cycles are slow. Any reversible contributor may take months to show in volume. Pattern thinning may still need separate discussion.",
      },
      {
        question: "Should I test ferritin repeatedly at home via kits?",
        answer:
          "Use clinician-directed testing so results tie to a management plan. Ad hoc testing can confuse more than it helps.",
      },
    ]),
    relatedSlugs: [
      "what-blood-tests-matter-for-hair-loss",
      "thyroid-hair-loss-explained",
      "diffuse-thinning-in-women",
      "dht-and-androgenetic-alopecia",
    ],
    glossarySlugs: ["ferritin", "telogen-effluvium"],
    references: [
      refPending("Ferritin as acute phase reactant — mechanisms"),
      refPending("Iron deficiency and telogen effluvium — review"),
      refPending("Patient information: iron studies interpretation"),
    ],
    Body: BodyFerritinAndHairLoss,
  },
  {
    slug: "thyroid-hair-loss-explained",
    title: "Thyroid and hair loss explained",
    deck: "TSH, thyroid hormones, and why normal tests do not always end the story.",
    description:
      "How thyroid function relates to the hair cycle, what tests commonly appear on a work-up, and why diffuse shedding needs a wider lens than one lab line.",
    excerpt:
      "Thyroid disease can affect hair, but so can many other factors. This explainer covers typical tests, borderline results, and when to keep investigating shedding.",
    hub: "blood-markers",
    audience: "both",
    contentType: "explainer",
    ctaType: "book-consult",
    publishedAt: "2026-01-22",
    updatedAt: "2026-03-22",
    reviewedAt: "2026-03-19",
    taxonomy: {
      conditions: ["telogen-effluvium", "diffuse-thinning"],
      markers: ["tsh", "t4", "t3"],
      symptoms: ["diffuse-loss", "sudden-shedding"],
      treatments: ["thyroid-management", "clinical-assessment"],
      tags: ["endocrine", "shedding", "laboratory-interpretation"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "how-thyroid-affects-hair", label: "Thyroid and the hair cycle" },
      { id: "common-tests", label: "Tests commonly used" },
      { id: "subclinical", label: "Borderline results" },
      { id: "normal-tests-still-shedding", label: "Normal tests, ongoing shedding" },
      { id: "iron-and-thyroid", label: "Iron and thyroid together" },
      { id: "next-steps", label: "Constructive next steps" },
    ],
    faq: faqBlock([
      {
        question: "Will levothyroxine fix my hair if I have hypothyroidism?",
        answer:
          "Restoring euthyroid status can help when thyroid disease contributed to shedding. Hair still needs months to reflect improvement, and other causes may coexist.",
      },
      {
        question: "Can hyperthyroidism cause hair changes too?",
        answer:
          "Yes. Both under- and overactive thyroid states can associate with diffuse hair symptoms in some patients. Management targets the thyroid disorder itself.",
      },
      {
        question: "Do I need private “full thyroid panels” for hair loss?",
        answer:
          "Not routinely. Which tests add value depends on clinical context and local guidelines — discuss with your clinician rather than self-ordering broad panels.",
      },
      {
        question: "If TSH is normal, is thyroid definitely excluded?",
        answer:
          "For many people, yes — in the right clinical setting. Persistent symptoms warrant continued assessment for other causes, not repeated indiscriminate testing.",
      },
    ]),
    relatedSlugs: [
      "what-blood-tests-matter-for-hair-loss",
      "ferritin-and-hair-loss",
      "diffuse-thinning-in-women",
      "dht-and-androgenetic-alopecia",
    ],
    glossarySlugs: ["telogen-effluvium"],
    references: [
      refPending("Thyroid disorders and alopecia — clinical review"),
      refPending("TSH interpretation in primary care"),
      refPending("Diffuse hair loss — diagnostic approach"),
    ],
    Body: BodyThyroidHairLoss,
  },
  {
    slug: "dht-and-androgenetic-alopecia",
    title: "DHT and androgenetic alopecia: a clear, cautious overview",
    deck: "Androgen signalling in pattern hair loss — without reducing you to a single hormone.",
    description:
      "What DHT does in susceptible follicles, how pattern recognition works on examination, and where blood tests fit. Educational only; not treatment advice.",
    excerpt:
      "DHT matters in many cases of pattern thinning, but hair loss in real life is rarely one-dimensional. Here is a balanced overview for informed conversations.",
    hub: "hair-loss-causes",
    audience: "both",
    contentType: "explainer",
    ctaType: "compare-treatments",
    publishedAt: "2026-02-01",
    updatedAt: "2026-03-25",
    reviewedAt: "2026-03-21",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "diffuse-thinning"],
      markers: ["testosterone", "shbg"],
      symptoms: ["crown-thinning", "temple-recession", "miniaturisation"],
      treatments: ["antiandrogen-therapy", "topical-therapy"],
      tags: ["androgens", "pattern-hair-loss", "pathophysiology"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "pattern-recognition", label: "Pattern recognition" },
      { id: "dht-role", label: "DHT’s role" },
      { id: "not-only-men", label: "Women and patterning" },
      { id: "labs", label: "When blood tests are considered" },
      { id: "treatment-context", label: "Treatment themes" },
      { id: "expectations", label: "Realistic expectations" },
    ],
    faq: faqBlock([
      {
        question: "Should I test DHT blood levels to diagnose pattern hair loss?",
        answer:
          "Diagnosis is usually clinical. Blood tests may be used in selected scenarios — for example atypical features — not as a routine screen for every case.",
      },
      {
        question: "If I block DHT, will all my hair come back?",
        answer:
          "Medical therapies can slow miniaturisation and support regrowth in responders, but results vary. Existing miniaturisation and duration of loss influence outcome.",
      },
      {
        question: "Is DHT “bad” for the whole body?",
        answer:
          "DHT has normal physiological roles. Medications that affect DHT are prescribed when potential benefits outweigh risks — a conversation for your clinician.",
      },
      {
        question: "Can women have androgenetic thinning without high androgens?",
        answer:
          "Yes. Female-pattern presentations do not always mirror male lab patterns. Assessment stays clinical first.",
      },
    ]),
    relatedSlugs: [
      "diffuse-thinning-in-women",
      "finasteride-vs-saw-palmetto",
      "thyroid-hair-loss-explained",
      "what-blood-tests-matter-for-hair-loss",
    ],
    glossarySlugs: ["dht"],
    references: [
      refPending("Androgenetic alopecia pathogenesis — review"),
      refPending("DHT and miniaturisation — mechanistic overview"),
      refPending("Female pattern hair loss — clinical assessment"),
    ],
    Body: BodyDhtAndAga,
  },
  {
    slug: "diffuse-thinning-in-women",
    title: "Diffuse thinning in women: causes worth discussing calmly",
    deck: "Separating shedding, pattern thinning, scalp disease, and reversible contributors.",
    description:
      "A structured look at why women develop diffuse thinning, how patterns differ, when labs help, and how to avoid premature self-diagnosis online.",
    excerpt:
      "Diffuse thinning is common and often mixed-type. This guide outlines how clinicians sort shedding, pattern loss, and scalp factors — without alarm or false certainty.",
    hub: "conditions",
    audience: "patients",
    contentType: "guide",
    ctaType: "book-consult",
    publishedAt: "2026-02-08",
    updatedAt: "2026-03-25",
    reviewedAt: "2026-03-21",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "telogen-effluvium", "diffuse-thinning"],
      markers: ["ferritin", "tsh"],
      symptoms: ["diffuse-loss", "crown-thinning", "sudden-shedding"],
      treatments: ["clinical-assessment", "medical-therapy", "procedural-options"],
      tags: ["women", "pattern-loss", "shedding"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "patterns", label: "Patterns and mechanisms" },
      { id: "overlap", label: "Overlapping causes" },
      { id: "labs-selective", label: "Selective laboratory review" },
      { id: "androgenetic", label: "Androgenetic patterning" },
      { id: "procedural", label: "Procedural options and timing" },
      { id: "support", label: "Support without overclaiming" },
    ],
    faq: faqBlock([
      {
        question: "Is diffuse thinning always female-pattern hair loss?",
        answer:
          "No. Telogen effluvium, nutritional or thyroid contributors, and scalp disorders can mimic or overlap. Examination and history steer the diagnosis.",
      },
      {
        question: "How long should I wait before seeking help?",
        answer:
          "If thinning is progressive over months, or shedding is sudden and heavy, booking a review is reasonable. Pain, scarring signs, or systemic symptoms warrant prompt care.",
      },
      {
        question: "Will hormones on a blood test explain everything?",
        answer:
          "Not always. Normal androgens do not exclude pattern thinning in women; abnormal tests prompt targeted follow-up rather than self-treatment.",
      },
      {
        question: "Are procedures mandatory?",
        answer:
          "No. Many people start with medical assessment and evidence-based therapies. Procedures are optional add-ons where appropriate and legal.",
      },
    ]),
    relatedSlugs: [
      "dht-and-androgenetic-alopecia",
      "ferritin-and-hair-loss",
      "thyroid-hair-loss-explained",
      "finasteride-vs-saw-palmetto",
    ],
    glossarySlugs: ["telogen-effluvium", "dht"],
    references: [
      refPending("Female hair loss classification — review"),
      refPending("Chronic telogen effluvium vs pattern loss"),
      refPending("Patient perspective: diffuse alopecia work-up"),
    ],
    Body: BodyDiffuseThinningWomen,
  },
  {
    slug: "finasteride-vs-saw-palmetto",
    title: "Finasteride vs saw palmetto for hair loss: evidence and important differences",
    deck: "Prescription medicine versus botanical products — why they are not interchangeable.",
    description:
      "A careful comparison of mechanisms, evidence, regulation, and counselling themes. Not a substitute for personalised prescribing advice.",
    excerpt:
      "Finasteride and saw palmetto are discussed in the same conversations online, but they sit in different categories. Understand the distinction before any decision with your clinician.",
    hub: "treatments",
    audience: "both",
    contentType: "comparison",
    ctaType: "compare-treatments",
    publishedAt: "2026-02-15",
    updatedAt: "2026-03-28",
    reviewedAt: "2026-03-24",
    taxonomy: {
      conditions: ["androgenetic-alopecia"],
      markers: ["testosterone", "dht"],
      symptoms: ["temple-recession", "crown-thinning", "miniaturisation"],
      treatments: ["oral-finasteride", "botanical-supplements", "monitoring"],
      tags: ["evidence-based-medicine", "androgens", "patient-safety"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "finasteride-mechanism", label: "Finasteride mechanism" },
      { id: "women", label: "Use in women" },
      { id: "saw-palmetto", label: "Saw palmetto claims" },
      { id: "not-substitute", label: "Why natural ≠ equivalent" },
      { id: "dht-context", label: "DHT context" },
      { id: "monitoring", label: "Monitoring and expectations" },
      { id: "takeaway", label: "Takeaway" },
    ],
    faq: faqBlock([
      {
        question: "Is saw palmetto a safer version of finasteride?",
        answer:
          "Safety is not guaranteed by being “natural.” Supplements vary in purity and can interact with medicines. Finasteride has defined prescribing and monitoring obligations.",
      },
      {
        question: "Can I switch between them freely?",
        answer:
          "No. Dosing, expectations, and risks differ. Any change should involve your prescriber, especially where pregnancy or other medications are relevant.",
      },
      {
        question: "Does finasteride work for everyone?",
        answer:
          "Response varies. Some people see stabilisation and regrowth; others see limited change. Timeline for judgement is typically many months.",
      },
      {
        question: "Where can I read about DHT biology first?",
        answer:
          "Start with our DHT overview, then return here for product-category differences.",
      },
    ]),
    relatedSlugs: [
      "dht-and-androgenetic-alopecia",
      "prp-vs-exosomes",
      "diffuse-thinning-in-women",
      "what-blood-tests-matter-for-hair-loss",
    ],
    glossarySlugs: ["dht"],
    references: [
      refPending("Finasteride male pattern hair loss — pivotal trials summary"),
      refPending("Saw palmetto extracts — systematic review quality assessment"),
      refPending("5α-reductase inhibitors — safety counselling themes"),
    ],
    Body: BodyFinasterideVsSawPalmetto,
  },
  {
    slug: "prp-vs-exosomes",
    title: "PRP vs exosomes for hair: comparing concepts, evidence, and caution",
    deck: "Office-based biologic-style therapies — questions to ask before you pay.",
    description:
      "How PRP and exosome offerings differ in principle, why evidence and regulation vary, and how to think about safety and candidacy without hype.",
    excerpt:
      "PRP and exosome hair treatments are marketed aggressively. This piece separates mechanism from marketing and lists the questions worth asking your clinician.",
    hub: "treatments",
    audience: "both",
    contentType: "comparison",
    ctaType: "compare-treatments",
    publishedAt: "2026-02-22",
    updatedAt: "2026-03-28",
    reviewedAt: "2026-03-24",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "diffuse-thinning"],
      markers: ["ferritin", "tsh"],
      symptoms: ["crown-thinning", "diffuse-loss"],
      treatments: ["prp", "exosome-therapy", "supportive-medical-therapy"],
      tags: ["procedures", "evidence-quality", "informed-consent"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "what-prp-is", label: "What PRP involves" },
      { id: "exosomes-claims", label: "What exosomes can mean" },
      { id: "evidence", label: "Evidence snapshot" },
      { id: "safety", label: "Safety and regulation" },
      { id: "who-benefits", label: "Candidacy (conceptual)" },
      { id: "before-procedure", label: "Before choosing a procedure" },
      { id: "labs", label: "Laboratory context" },
    ],
    faq: faqBlock([
      {
        question: "Which works better, PRP or exosomes?",
        answer:
          "Head-to-head trials in hair loss are limited. Outcomes depend on diagnosis, technique, product quality, and follow-up. Be wary of universal claims.",
      },
      {
        question: "Are exosome injections legal where I live?",
        answer:
          "Regulation differs by country and product class. Ask whether the preparation is approved for your indication and traceable to a reputable source.",
      },
      {
        question: "Should I skip medical therapy and do procedures only?",
        answer:
          "Many guidelines still prioritise established medical options where appropriate. Procedures may be adjuncts, not automatic replacements.",
      },
      {
        question: "What if my concern is past surgery quality?",
        answer:
          "That question sits closer to surgical transparency and audit pathways. See our HLI vs HairAudit page for routing context.",
      },
    ]),
    relatedSlugs: [
      "finasteride-vs-saw-palmetto",
      "what-blood-tests-matter-for-hair-loss",
      "hli-vs-hairaudit",
      "diffuse-thinning-in-women",
    ],
    references: [
      refPending("PRP in androgenetic alopecia — randomised trials synthesis"),
      refPending("Extracellular vesicle therapies — regulatory commentary"),
      refPending("Informed consent for aesthetic injectables"),
    ],
    Body: BodyPrpVsExosomes,
  },
  {
    slug: "hli-vs-hairaudit",
    title: "HLI vs HairAudit: same ecosystem, different jobs",
    deck: "When biology-first interpretation fits — and when surgical audit is the right door.",
    description:
      "Hair Longevity Institute focuses on causes, labs, and planning; HairAudit focuses on surgery transparency and procedural due diligence. A neutral map to help you choose.",
    excerpt:
      "HLI helps you interpret biology and plan medically; HairAudit focuses on surgical transparency and audit. Here is how to pick the right starting point without mixing roles.",
    hub: "hair-loss-causes",
    audience: "both",
    contentType: "decision",
    ctaType: "see-hairaudit",
    publishedAt: "2026-03-01",
    updatedAt: "2026-03-30",
    reviewedAt: "2026-03-27",
    taxonomy: {
      conditions: ["androgenetic-alopecia"],
      markers: ["ferritin", "tsh"],
      symptoms: ["diffuse-loss"],
      treatments: ["treatment-planning", "surgical-assessment-pathway"],
      tags: ["hair-intelligence-ecosystem", "platform-comparison", "patient-education"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "hli-focus", label: "HLI focus" },
      { id: "hairaudit-focus", label: "HairAudit focus" },
      { id: "overlap", label: "Where needs overlap" },
      { id: "same-ecosystem", label: "Same ecosystem, different roles" },
      { id: "reading", label: "Suggested reading on HLI" },
      { id: "when-hairaudit", label: "When HairAudit first" },
      { id: "not-advice", label: "Not routing or medical advice" },
    ],
    faq: faqBlock([
      {
        question: "Can I use both over time?",
        answer:
          "Yes. Many people have both medical interpretation questions and procedural questions at different stages. The goal is to match the right tool to the dominant question.",
      },
      {
        question: "Does HLI perform surgery audits?",
        answer:
          "No. That remit maps to HairAudit-style pathways focused on surgical transparency and quality themes.",
      },
      {
        question: "Will HLI tell me which surgeon to choose?",
        answer:
          "HLI provides education and structured analysis in its scope; it does not replace your own due diligence and informed consent discussions with providers.",
      },
      {
        question: "I only want blood results interpreted — is that HLI?",
        answer:
          "That is closer to HLI’s biology-first lane than to surgical audit. Bring results to your clinician as well; educational interpretation complements but does not replace care.",
      },
    ]),
    relatedSlugs: [
      "what-blood-tests-matter-for-hair-loss",
      "prp-vs-exosomes",
      "finasteride-vs-saw-palmetto",
      "dht-and-androgenetic-alopecia",
    ],
    references: [
      refPending("Hair Intelligence ecosystem — public positioning statements"),
      refPending("Informed consent in hair restoration surgery — review"),
      refPending("Trichology scope vs surgical audit — professional boundary commentary"),
    ],
    Body: BodyHliVsHairaudit,
  },
];
