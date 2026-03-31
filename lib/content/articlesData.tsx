import type { EditorialArticle, EditorialFaqItem, EditorialPerson, EditorialReference } from "@/lib/content/types";
import {
  BodyDiffuseThinningWomen,
  BodyDhtAndAga,
  BodyFerritinAndHairLoss,
  BodyFinasterideVsSawPalmetto,
  BodyHliVsHairaudit,
  BodyMinoxidilMechanism,
  BodyOralAntiandrogensWomen,
  BodyPostpartumShedding,
  BodyPostTransplantShockLoss,
  BodyPrpVsExosomes,
  BodyScalpInflammationShedding,
  BodyTelogenAfterIllnessStress,
  BodyThyroidHairLoss,
  BodyVitaminMicronutrientsHair,
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

/** Structured external citation (concise label + URL). */
function cite(label: string, url: string): EditorialReference {
  return { label, url };
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
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
      "telogen-effluvium-after-illness-or-stress",
    ],
    glossarySlugs: ["ferritin", "telogen-effluvium"],
    references: [
      cite(
        "NHS (UK). Iron deficiency anaemia — symptoms, diagnosis, treatment overview.",
        "https://www.nhs.uk/conditions/iron-deficiency-anaemia/"
      ),
      cite(
        "NICE CKS (UK). Thyroid disease — assessment: initial tests and when to refer.",
        "https://cks.nice.org.uk/topics/thyroid-disease-assessing/"
      ),
      cite(
        "American Academy of Dermatology. Hair loss: causes and types (patient resource).",
        "https://www.aad.org/public/diseases/hair-loss"
      ),
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
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
      "postpartum-shedding-when-to-reassure-vs-when-to-test",
      "telogen-effluvium-after-illness-or-stress",
    ],
    glossarySlugs: ["ferritin", "telogen-effluvium"],
    references: [
      cite(
        "NICE CKS (UK). Anaemia — iron deficiency: investigation and management context.",
        "https://cks.nice.org.uk/topics/anaemia-iron-deficiency/"
      ),
      cite(
        "StatPearls / NCBI Bookshelf. Iron deficiency anemia (pathophysiology, ferritin, acute-phase behaviour).",
        "https://www.ncbi.nlm.nih.gov/books/NBK459260/"
      ),
      cite(
        "StatPearls / NCBI Bookshelf. Telogen effluvium (reversible shedding — clinical overview).",
        "https://www.ncbi.nlm.nih.gov/books/NBK430957/"
      ),
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
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      "postpartum-shedding-when-to-reassure-vs-when-to-test",
      "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
    ],
    glossarySlugs: ["telogen-effluvium"],
    references: [
      cite(
        "NHS (UK). Underactive thyroid (hypothyroidism) — overview.",
        "https://www.nhs.uk/conditions/underactive-thyroid-hypothyroidism/"
      ),
      cite(
        "NICE CKS (UK). Thyroid disease — assessment: TSH, follow-up, referral.",
        "https://cks.nice.org.uk/topics/thyroid-disease-assessing/"
      ),
      cite(
        "American Thyroid Association. Hypothyroidism (patient-focused overview).",
        "https://www.thyroid.org/hypothyroidism/"
      ),
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
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      "minoxidil-mechanism-and-realistic-timelines",
      "telogen-effluvium-after-illness-or-stress",
    ],
    glossarySlugs: ["dht"],
    references: [
      cite(
        "American Academy of Dermatology. Androgenetic alopecia (pattern hair loss) — patient summary.",
        "https://www.aad.org/public/diseases/hair-loss/causes/androgenetic-alopecia"
      ),
      cite(
        "MedlinePlus (NIH). Androgenetic alopecia — genetics and description.",
        "https://medlineplus.gov/genetics/condition/androgenetic-alopecia/"
      ),
      cite(
        "Ntshingila S et al. Androgenetic alopecia: an update (JAAD Int / AAD). 2023 — open access via PMC.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC10562178/"
      ),
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
      "postpartum-shedding-when-to-reassure-vs-when-to-test",
      "scalp-inflammation-and-shedding",
      "telogen-effluvium-after-illness-or-stress",
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
      "minoxidil-mechanism-and-realistic-timelines",
      "oral-anti-androgens-in-women-specialist-led-context",
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
      "post-transplant-shock-loss-and-expectations",
      "hli-vs-hairaudit",
      "minoxidil-mechanism-and-realistic-timelines",
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
      "post-transplant-shock-loss-and-expectations",
      "prp-vs-exosomes",
      "scalp-inflammation-and-shedding",
    ],
    references: [
      refPending("Hair Intelligence ecosystem — public positioning statements"),
      refPending("Informed consent in hair restoration surgery — review"),
      refPending("Trichology scope vs surgical audit — professional boundary commentary"),
    ],
    Body: BodyHliVsHairaudit,
  },
  {
    slug: "postpartum-shedding-when-to-reassure-vs-when-to-test",
    title: "Postpartum shedding: when to reassure vs when to test",
    deck: "Normal cycle shifts, red flags, and how clinicians think about iron and thyroid after birth.",
    description:
      "Increased shedding after pregnancy is common. Learn typical timing, when reassurance fits, when blood tests or referral may help, and how this overlaps with telogen effluvium and nutrition.",
    excerpt:
      "Postpartum hair shedding worries many new parents. Here is a calm, clinical framing of normal patterns, warning signs, and what selective testing can — and cannot — clarify.",
    hub: "conditions",
    audience: "patients",
    contentType: "guide",
    ctaType: "book-consult",
    publishedAt: "2026-03-05",
    updatedAt: "2026-03-29",
    reviewedAt: "2026-03-26",
    taxonomy: {
      conditions: ["postpartum-shedding", "telogen-effluvium"],
      markers: ["ferritin", "tsh"],
      symptoms: ["sudden-shedding", "diffuse-loss"],
      treatments: ["clinical-assessment", "laboratory-workup", "reassurance-counselling"],
      tags: ["postpartum", "womens-health", "shedding"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "normal-postpartum-shedding", label: "Normal postpartum shedding" },
      { id: "when-reassurance-fits", label: "When reassurance fits" },
      { id: "red-flags-testing", label: "When clinicians consider tests" },
      { id: "overlap-thyroid-iron", label: "Thyroid, iron, nutrition" },
      { id: "hair-cycle-timelines", label: "Timelines and expectations" },
      { id: "partner-with-clinician", label: "Partnering with your team" },
      { id: "what-this-is-not", label: "What this is not" },
    ],
    faq: faqBlock([
      {
        question: "Is heavy shedding three months after birth always normal?",
        answer:
          "Often it aligns with hair-cycle recovery, but severity, associated symptoms, and duration still matter. If you are unsure or unwell, book a review rather than self-diagnosing.",
      },
      {
        question: "Should every breastfeeding parent have ferritin checked?",
        answer:
          "No. Testing follows symptoms, examination, and history. Your clinician decides whether iron or thyroid tests add value.",
      },
      {
        question: "Can postpartum shedding hide pattern hair loss?",
        answer:
          "Sometimes several mechanisms overlap. If thinning persists beyond the usual window or shows a new pattern, reassessment is reasonable.",
      },
      {
        question: "Does this article replace my postnatal checks?",
        answer:
          "No. Continue routine maternity and GP follow-up; use this as background for questions only.",
      },
    ]),
    relatedSlugs: [
      "telogen-effluvium-after-illness-or-stress",
      "ferritin-and-hair-loss",
      "thyroid-hair-loss-explained",
      "diffuse-thinning-in-women",
    ],
    glossarySlugs: ["telogen-effluvium"],
    references: [
      refPending("Postpartum telogen effluvium — clinical review"),
      refPending("Postpartum thyroiditis — guideline summary"),
      refPending("Iron deficiency in the postpartum period"),
    ],
    Body: BodyPostpartumShedding,
  },
  {
    slug: "telogen-effluvium-after-illness-or-stress",
    title: "Telogen effluvium after illness or stress",
    deck: "Delayed shedding, overlap with other diagnoses, and when selective labs help.",
    description:
      "How telogen effluvium-type shedding can follow illness, surgery, stress, or physiological shifts; why timing confuses people; and how clinicians broaden assessment when needed.",
    excerpt:
      "Shedding that starts after you have recovered can still be telogen effluvium. Understand triggers, timelines, overlap with pattern loss, and when to seek review — without self-labelling.",
    hub: "hair-loss-causes",
    audience: "both",
    contentType: "explainer",
    ctaType: "start-assessment",
    publishedAt: "2026-03-08",
    updatedAt: "2026-03-29",
    reviewedAt: "2026-03-26",
    taxonomy: {
      conditions: ["telogen-effluvium", "diffuse-thinning"],
      markers: ["ferritin", "tsh"],
      symptoms: ["sudden-shedding", "diffuse-loss"],
      treatments: ["clinical-assessment", "supportive-care"],
      tags: ["shedding", "stress-recovery", "illness-recovery"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "what-te-triggers", label: "Common trigger categories" },
      { id: "timing-after-stressor", label: "Timing after the event" },
      { id: "overlap-pattern-loss", label: "Overlap with pattern loss" },
      { id: "labs-when-indicated", label: "When blood tests are considered" },
      { id: "prognosis", label: "Prognosis and patience" },
      { id: "emotional-load", label: "Emotional load" },
      { id: "when-specialist", label: "When a specialist helps" },
    ],
    faq: faqBlock([
      {
        question: "Can I diagnose telogen effluvium from shedding alone?",
        answer:
          "No. The pattern is a clinical judgement that excludes other causes. Self-diagnosis from articles or forums often misses overlap with scalp disease or pattern thinning.",
      },
      {
        question: "How long should shedding last before I worry?",
        answer:
          "Courses vary. If shedding is extreme, prolonged beyond your clinician’s expected window, or accompanied by red flags, book a review.",
      },
      {
        question: "Do I need every blood test on the internet?",
        answer:
          "Selective testing follows clues. See our overview of which tests are commonly discussed and why panels are not universal.",
      },
      {
        question: "Is stress “just in my head” if labs are normal?",
        answer:
          "Stress-related shedding is biologically plausible; normal labs do not invalidate distress. Mental health support still matters.",
      },
    ]),
    relatedSlugs: [
      "postpartum-shedding-when-to-reassure-vs-when-to-test",
      "what-blood-tests-matter-for-hair-loss",
      "scalp-inflammation-and-shedding",
      "diffuse-thinning-in-women",
    ],
    glossarySlugs: ["telogen-effluvium"],
    references: [
      refPending("Acute telogen effluvium — diagnostic approach"),
      refPending("Hair cycle biology and effluvium — review"),
      refPending("Diffuse hair loss evaluation in primary care"),
    ],
    Body: BodyTelogenAfterIllnessStress,
  },
  {
    slug: "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
    title: "Vitamin D, B12, and folate: what labs may mean for hair",
    deck: "Micronutrients in context — not a substitute for whole-person interpretation.",
    description:
      "How clinicians discuss vitamin D, B12, and folate when people report hair symptoms; why abnormal or normal results both require context; and why supplements are not automatic.",
    excerpt:
      "Micronutrient labs are often misunderstood online. This interpretation-focused guide explains sensible framing next to iron, thyroid, and examination — without supplement hype.",
    hub: "blood-markers",
    audience: "both",
    contentType: "interpretation",
    ctaType: "start-assessment",
    publishedAt: "2026-03-12",
    updatedAt: "2026-03-29",
    reviewedAt: "2026-03-26",
    taxonomy: {
      conditions: ["diffuse-thinning", "telogen-effluvium"],
      markers: ["vitamin-d", "b12", "folate"],
      symptoms: ["diffuse-loss"],
      treatments: ["laboratory-workup", "dietary-review"],
      tags: ["micronutrients", "laboratory-interpretation", "nutrition"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "why-context-matters", label: "Why context matters" },
      { id: "vitamin-d", label: "Vitamin D" },
      { id: "b12-folate", label: "B12 and folate" },
      { id: "interpretation-limits", label: "Limits of interpretation" },
      { id: "with-iron-thyroid", label: "Iron and thyroid companions" },
      { id: "supplementation-caution", label: "Supplementation caution" },
      { id: "constructive-next-steps", label: "Constructive next steps" },
    ],
    faq: faqBlock([
      {
        question: "Will raising vitamin D regrow my hair?",
        answer:
          "Only if deficiency is clinically relevant and part of a broader picture. Many people with hair concerns have normal micronutrient levels; fixing a lab line does not guarantee cosmetic change.",
      },
      {
        question: "Should I take B complex “for hair” preventively?",
        answer:
          "Routine high-dose supplementation without indication can cause harm or obscure other issues. Discuss with your clinician.",
      },
      {
        question: "Are home finger-prick tests enough?",
        answer:
          "Quality and follow-up vary. Clinician-directed testing usually ties results to a management plan.",
      },
      {
        question: "How do these labs relate to ferritin?",
        answer:
          "They are separate domains; some work-ups consider several markers together when history supports it.",
      },
    ]),
    relatedSlugs: [
      "what-blood-tests-matter-for-hair-loss",
      "ferritin-and-hair-loss",
      "thyroid-hair-loss-explained",
      "telogen-effluvium-after-illness-or-stress",
    ],
    references: [
      refPending("Vitamin D deficiency — population and clinical context"),
      refPending("B12 and folate deficiency — haematology reference"),
      refPending("Nutritional factors in diffuse alopecia — review"),
    ],
    Body: BodyVitaminMicronutrientsHair,
  },
  {
    slug: "scalp-inflammation-and-shedding",
    title: "Scalp inflammation and shedding: themes for discussion with your clinician",
    deck: "Itch, scale, and overlap with diffuse loss — education only, not a treatment guide.",
    description:
      "How inflammatory scalp conditions can intersect with shedding and pattern thinning; why examination matters; and why treatment choices belong with a prescriber.",
    excerpt:
      "An angry scalp can accompany hair shedding. Learn how clinicians separate inflammation from pure telogen effluvium and why product-first approaches often skip the real question.",
    hub: "conditions",
    audience: "both",
    contentType: "guide",
    ctaType: "book-consult",
    publishedAt: "2026-03-15",
    updatedAt: "2026-03-29",
    reviewedAt: "2026-03-26",
    taxonomy: {
      conditions: ["seborrheic-dermatitis", "inflammatory-shedding", "telogen-effluvium"],
      markers: [],
      symptoms: ["itch", "flaking", "sudden-shedding"],
      treatments: ["topical-therapy", "clinical-assessment"],
      tags: ["scalp-health", "inflammation", "dermatology"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "inflammation-and-cycle", label: "Inflammation and the hair cycle" },
      { id: "common-presentations", label: "Common presentations" },
      { id: "overlap-shedding-aga", label: "Overlap with shedding and pattern loss" },
      { id: "examination-themes", label: "Examination themes" },
      { id: "treatment-prescriber-led", label: "Treatment is prescriber-led" },
      { id: "alongside-systemic-health", label: "Systemic health and labs" },
      { id: "when-urgent-care", label: "When to seek urgent review" },
    ],
    faq: faqBlock([
      {
        question: "Can dandruff shampoo cure my shedding?",
        answer:
          "Sometimes a medicated regimen helps scalp disease and comfort; it is not a universal fix for all hair loss types. Diagnosis first.",
      },
      {
        question: "Is itchy scalp always seborrhoeic dermatitis?",
        answer:
          "No. Several conditions can itch; examination narrows the list.",
      },
      {
        question: "Should I get blood tests for an itchy scalp?",
        answer:
          "Only when history and exam suggest systemic contributors. Not every scalp symptom needs a broad panel.",
      },
      {
        question: "Can I use steroid creams indefinitely on my own?",
        answer:
          "No. Potency, duration, and side effects require medical supervision.",
      },
    ]),
    relatedSlugs: [
      "telogen-effluvium-after-illness-or-stress",
      "diffuse-thinning-in-women",
      "what-blood-tests-matter-for-hair-loss",
      "minoxidil-mechanism-and-realistic-timelines",
    ],
    references: [
      refPending("Seborrhoeic dermatitis — clinical management review"),
      refPending("Scalp psoriasis vs seborrhoeic dermatitis — differential"),
      refPending("Trichoscopy in inflammatory scalp disease — overview"),
    ],
    Body: BodyScalpInflammationShedding,
  },
  {
    slug: "minoxidil-mechanism-and-realistic-timelines",
    title: "Minoxidil: mechanism themes and realistic timelines",
    deck: "A long-game topical therapy — expectations, adherence, and when to involve your prescriber.",
    description:
      "High-level mechanism context for topical minoxidil in pattern hair loss, early shedding conversations, combination therapy themes, and why diagnosis still comes first.",
    excerpt:
      "Minoxidil is widely used but often misunderstood. This explainer covers how clinicians think about timelines, early shedding, and combination care — without replacing prescribing advice.",
    hub: "treatments",
    audience: "both",
    contentType: "explainer",
    ctaType: "compare-treatments",
    publishedAt: "2026-03-18",
    updatedAt: "2026-03-29",
    reviewedAt: "2026-03-26",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "diffuse-thinning"],
      markers: [],
      symptoms: ["crown-thinning", "temple-recession"],
      treatments: ["topical-minoxidil", "adherence-support"],
      tags: ["medical-therapy", "expectations", "pattern-hair-loss"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "mechanism-overview", label: "Mechanism overview" },
      { id: "who-uses-it", label: "Who uses it (conceptually)" },
      { id: "timelines-shedding-phase", label: "Early shedding" },
      { id: "realistic-outcomes", label: "Realistic outcomes" },
      { id: "adherence", label: "Adherence and scalp care" },
      { id: "combination-context", label: "Combination therapy context" },
      { id: "not-substitute-diagnosis", label: "Not a substitute for diagnosis" },
    ],
    faq: faqBlock([
      {
        question: "How many months before I judge results?",
        answer:
          "Many clinicians suggest several months of consistent use before assessing response, alongside photography. Individual plans vary.",
      },
      {
        question: "Is the 5% strength always better?",
        answer:
          "Not for everyone. Irritation, formulation, and sex-specific guidance matter — follow your prescriber or product label in your region.",
      },
      {
        question: "Can I stop once hair improves?",
        answer:
          "Stopping commonly allows progression to resume over time. Discuss maintenance plans with your clinician.",
      },
      {
        question: "Does minoxidil fix telogen effluvium from illness?",
        answer:
          "Not usually as a first-line answer. Addressing the driver matters; minoxidil is often discussed in pattern-loss contexts.",
      },
    ]),
    relatedSlugs: [
      "finasteride-vs-saw-palmetto",
      "dht-and-androgenetic-alopecia",
      "scalp-inflammation-and-shedding",
      "telogen-effluvium-after-illness-or-stress",
    ],
    references: [
      refPending("Topical minoxidil — mechanism and clinical use review"),
      refPending("Female pattern hair loss — topical therapy trials"),
      refPending("Early minoxidil shedding — patient counselling themes"),
    ],
    Body: BodyMinoxidilMechanism,
  },
  {
    slug: "post-transplant-shock-loss-and-expectations",
    title: "Post-transplant shock loss and expectations",
    deck: "Temporary shedding after surgery — themes only; your clinic guides your case.",
    description:
      "What shock loss can mean after hair transplantation, broad timing expectations, when to alert your team, and how systemic optimisation may sit alongside surgical aftercare.",
    excerpt:
      "Shock loss after a transplant can feel alarming. This guide explains common concepts, timelines in broad terms, and how to work with your surgical team — not replace their advice.",
    hub: "conditions",
    audience: "patients",
    contentType: "guide",
    ctaType: "read-more",
    publishedAt: "2026-03-22",
    updatedAt: "2026-03-29",
    reviewedAt: "2026-03-26",
    taxonomy: {
      conditions: ["post-transplant-instability", "telogen-effluvium"],
      markers: ["ferritin", "tsh"],
      symptoms: ["sudden-shedding", "diffuse-loss"],
      treatments: ["surgical-aftercare", "supportive-medical-therapy"],
      tags: ["hair-transplant", "expectations", "post-operative"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "shock-loss-what-it-is", label: "What shock loss can mean" },
      { id: "typical-timing", label: "Typical timing" },
      { id: "different-graft-concerns", label: "When to flag concerns" },
      { id: "communication-with-team", label: "Communication with your team" },
      { id: "labs-systemic-health", label: "Systemic health and labs" },
      { id: "longitudinal-expectations", label: "Long-term density expectations" },
      { id: "emotional-expectations", label: "Emotional load" },
    ],
    faq: faqBlock([
      {
        question: "Does shock loss mean the grafts failed?",
        answer:
          "Not necessarily. Many patients experience temporary shedding phases; your clinic interprets what you see against your surgical plan.",
      },
      {
        question: "Should I restart minoxidil on my own after surgery?",
        answer:
          "Only as agreed in your aftercare plan. Timing varies by surgeon protocol.",
      },
      {
        question: "When is post-op shedding an emergency?",
        answer:
          "Spreading redness, pus, fever, or severe pain need urgent surgical or medical review — do not wait on articles.",
      },
      {
        question: "Can HLI interpret my post-op photos?",
        answer:
          "HLI focuses on biology-first education and lab interpretation; surgical concerns belong to your operating team or dedicated audit pathways.",
      },
    ]),
    relatedSlugs: [
      "prp-vs-exosomes",
      "hli-vs-hairaudit",
      "what-blood-tests-matter-for-hair-loss",
      "minoxidil-mechanism-and-realistic-timelines",
    ],
    references: [
      refPending("Postoperative telogen effluvium after hair restoration — review"),
      refPending("Follicular unit transplantation — patient counselling resources"),
      refPending("Complications after hair surgery — when to seek care"),
    ],
    Body: BodyPostTransplantShockLoss,
  },
  {
    slug: "oral-anti-androgens-in-women-specialist-led-context",
    title: "Oral anti-androgens in women: specialist-led context only",
    deck: "Why these therapies are not DIY — monitoring, fertility, and pattern-loss assessment.",
    description:
      "Educational framing for how oral anti-androgen or hormone-modulating therapies may be discussed in female pattern hair loss under specialist care. Not prescribing guidance.",
    excerpt:
      "Women’s oral anti-androgen therapy requires specialist oversight, contraception planning, and monitoring. This article explains the safety themes — not which drug to take.",
    hub: "treatments",
    audience: "both",
    contentType: "guide",
    ctaType: "book-consult",
    publishedAt: "2026-03-25",
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "diffuse-thinning"],
      markers: ["testosterone", "shbg"],
      symptoms: ["crown-thinning", "diffuse-loss"],
      treatments: ["oral-antiandrogen", "specialist-monitoring"],
      tags: ["womens-health", "prescribing-safety", "pattern-hair-loss"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "scope-specialist-led", label: "Specialist-led scope" },
      { id: "why-not-self-start", label: "Why not self-start" },
      { id: "drug-classes-high-level", label: "Drug classes (high level)" },
      { id: "monitoring-safety", label: "Monitoring and safety" },
      { id: "fertility-pregnancy", label: "Fertility and pregnancy" },
      { id: "relation-pattern-hair-loss", label: "Relation to pattern assessment" },
      { id: "constructive-questions", label: "Constructive questions" },
    ],
    faq: faqBlock([
      {
        question: "Can I start spironolactone from an online forum protocol?",
        answer:
          "No. Prescription anti-androgens such as spironolactone (where used for hair-related indications) require electrolyte and blood pressure monitoring, pregnancy prevention where relevant, and review of drug interactions — all under medical supervision.",
      },
      {
        question: "Are oral options the first step for every woman with thinning?",
        answer:
          "No. Diagnosis, topical therapy, and comorbidities steer sequencing — individualised to you.",
      },
      {
        question: "Do I need hormones tested before every prescription?",
        answer:
          "Not routinely. Testing follows clinical indication and local practice — not a universal panel.",
      },
      {
        question: "Where does minoxidil fit?",
        answer:
          "Often as a foundational topical in pattern loss; combination plans are prescriber decisions.",
      },
    ]),
    relatedSlugs: [
      "diffuse-thinning-in-women",
      "dht-and-androgenetic-alopecia",
      "minoxidil-mechanism-and-realistic-timelines",
      "finasteride-vs-saw-palmetto",
    ],
    references: [
      cite(
        "American Academy of Dermatology. Women’s hair loss (female pattern hair loss) — overview.",
        "https://www.aad.org/public/diseases/hair-loss/causes/womens-hair-loss-female-pattern-baldness"
      ),
      cite(
        "Lee WS et al. International consensus on the treatment of female pattern hair loss. J Am Acad Dermatol. 2018. doi:10.1016/j.jaad.2017.10.007",
        "https://doi.org/10.1016/j.jaad.2017.10.007"
      ),
      cite(
        "NHS (UK). Spironolactone — uses, cautions, pregnancy (medicines A–Z).",
        "https://www.nhs.uk/medicines/spironolactone/"
      ),
    ],
    Body: BodyOralAntiandrogensWomen,
  },
];
