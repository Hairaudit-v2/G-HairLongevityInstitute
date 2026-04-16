import type { EditorialArticle, EditorialFaqItem, EditorialPerson, EditorialReference } from "@/lib/content/types";
import {
  BodyCrownThinningHarderToTreat,
  BodyDiffuseThinningWomen,
  BodyDhtAndAga,
  BodyDutasterideHairLossConversation,
  BodyFerritinAndHairLoss,
  BodyFinasterideVsSawPalmetto,
  BodyHliVsHairaudit,
  BodyMinoxidilMechanism,
  BodyNormalTestosteroneAndrogenSensitive,
  BodyOralAntiandrogensWomen,
  BodyOralVsTopicalMinoxidil,
  BodyPostpartumShedding,
  BodyPostpartumVsFemalePattern,
  BodyPostTransplantShockLoss,
  BodyPrpVsExosomes,
  BodyRecedingHairlineVsMature,
  BodyScalpInflammationShedding,
  BodySheddingVsBreakage,
  BodyTelogenAfterIllnessStress,
  BodyThyroidHairLoss,
  BodyTrtCauseOrUnmask,
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
  credentials: "Senior trichology sign-off before publication; same review standard across insight articles.",
};

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
    title: "Blood tests for hair loss: when labs help",
    deck: "Iron, thyroid, and more — when tests are useful, and why your panel may differ from someone else’s.",
    description:
      "Overview for shedding or thinning: when iron, thyroid, or other tests may matter, why panels are not one-size-fits-all, and how labs fit with your history and exam.",
    excerpt:
      "Same hair worry, different labs — when iron, thyroid, and others actually change your care.",
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
      { id: "why-selective", label: "Why you might not need every test" },
      { id: "iron-and-blood-count", label: "Blood count and iron" },
      { id: "thyroid", label: "Thyroid (TSH and related tests)" },
      { id: "inflammation-nutrition", label: "Inflammation and vitamins" },
      { id: "fitting-together", label: "How labs fit with your scalp and pattern" },
      { id: "not-medical-advice", label: "What this page is not" },
      { id: "when-specialist", label: "When a hair specialist can help" },
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
          "It can matter when low iron is plausible — but it is never read alone. See our ferritin article for nuance.",
      },
      {
        question: "Who should interpret my results?",
        answer:
          "Your GP, dermatologist, or hair specialist. Education can help you prepare questions; it does not replace prescribing or diagnosis.",
      },
    ]),
    relatedSlugs: [
      "ferritin-and-hair-loss",
      "thyroid-hair-loss-explained",
      "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
      "hair-shedding-vs-hair-breakage",
    ],
    primaryPillar: "hair-longevity",
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
    title: "Ferritin and hair loss: what your result means",
    deck: "One lab value for stored iron — helpful in context, not a full diagnosis of why hair is shedding.",
    description:
      "What ferritin reflects, when inflammation skews it, and why one number never tells the whole hair story. More specific than our general blood-test overview.",
    excerpt:
      "Low ferritin can matter for shedding — not a DIY iron prescription. Basics before you supplement.",
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
      { id: "what-ferritin-is", label: "What is ferritin?" },
      { id: "shedding-context", label: "Ferritin and shedding" },
      { id: "targets-and-ranges", label: "“Normal” vs online targets" },
      { id: "with-thyroid", label: "Iron and thyroid tests together" },
      { id: "supplements", label: "Iron supplements and follow-up" },
      { id: "summary", label: "In short" },
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
          "It is safer to test through your doctor so results connect to a clear plan. Random home tests often add confusion.",
      },
    ]),
    relatedSlugs: [
      "what-blood-tests-matter-for-hair-loss",
      "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
      "postpartum-shedding-when-to-reassure-vs-when-to-test",
      "telogen-effluvium-after-illness-or-stress",
    ],
    primaryPillar: "hair-longevity",
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
    title: "Thyroid and hair loss: TSH, tests & borderline results",
    deck: "Under- or overactive thyroid can change shedding or texture — and “normal” TSH still leaves other causes on the table.",
    description:
      "TSH and related tests, hypo- and hyperthyroid clues, borderline results, and why normal thyroid labs still leave room for other causes. Deeper than our broad blood-test overview.",
    excerpt:
      "What TSH and related tests are for — and when shedding continues despite normal labs.",
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
      { id: "how-thyroid-affects-hair", label: "How thyroid trouble can affect hair" },
      { id: "common-tests", label: "Tests your doctor may order" },
      { id: "subclinical", label: "Borderline or “mild” results" },
      { id: "normal-tests-still-shedding", label: "Normal thyroid labs but hair still shedding" },
      { id: "iron-and-thyroid", label: "Iron and thyroid checks together" },
      { id: "next-steps", label: "What to do next" },
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
    primaryPillar: "hair-longevity",
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
    title: "DHT and pattern hair loss: how miniaturisation works",
    deck: "How DHT fits male- and female-pattern thinning — without blaming one hormone for everything.",
    description:
      "Plain-language mechanics: DHT, follicular miniaturisation, male- and female-pattern context, what clinicians look for on the scalp, and when blood tests are secondary. Complements the male pattern guide for progression and treatment framing.",
    excerpt:
      "DHT is one part of many pattern-loss stories — not the whole picture. Calm prep for your visit.",
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
      { id: "pattern-recognition", label: "What doctors look for on your scalp" },
      { id: "dht-role", label: "How DHT ties into pattern thinning" },
      { id: "not-only-men", label: "Women get pattern hair loss too" },
      { id: "labs", label: "When blood tests help" },
      { id: "treatment-context", label: "Treatment options (big picture)" },
      { id: "expectations", label: "What results usually look like" },
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
      "receding-hairline-vs-mature-hairline",
    ],
    primaryPillar: "male-pattern-hair-loss",
    secondaryPillar: "androgen-index",
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
    title: "Thinning hair in women: causes doctors consider",
    deck: "Shedding, slow thinning, or scalp symptoms — often more than one cause at once.",
    description:
      "Wider part, volume loss, telogen shedding, female-pattern thinning, scalp conditions, and when selective labs help — practical sorting for women, without replacing an exam.",
    excerpt:
      "Wider part or less volume? How clinicians separate shedding, pattern thinning, and scalp issues.",
    hub: "conditions",
    audience: "patients",
    contentType: "guide",
    ctaType: "book-consult",
    publishedAt: "2026-02-08",
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      { id: "patterns", label: "Different ways thinning can show up" },
      { id: "overlap", label: "When several causes overlap" },
      { id: "labs-selective", label: "Blood tests: only when they make sense" },
      { id: "androgenetic", label: "Female pattern hair loss" },
      { id: "procedural", label: "Procedures (if you are considering them)" },
      { id: "support", label: "Taking care of yourself while you sort it out" },
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
      "postpartum-hair-loss-vs-female-pattern-thinning",
      "telogen-effluvium-after-illness-or-stress",
      "scalp-inflammation-and-shedding",
    ],
    primaryPillar: "hair-longevity",
    secondaryPillar: "androgen-index",
    glossarySlugs: ["telogen-effluvium", "dht"],
    references: [
      cite(
        "American Academy of Dermatology. What causes hair loss in women? (patient resource).",
        "https://www.aad.org/public/diseases/hair-loss/causes/women"
      ),
      cite(
        "American Academy of Dermatology. Female pattern hair loss — overview (patient resource).",
        "https://www.aad.org/public/diseases/hair-loss/types/female-pattern"
      ),
      cite(
        "StatPearls / NCBI Bookshelf. Telogen effluvium (reversible shedding — clinical overview).",
        "https://www.ncbi.nlm.nih.gov/books/NBK430957/"
      ),
    ],
    Body: BodyDiffuseThinningWomen,
  },
  {
    slug: "finasteride-vs-saw-palmetto",
    title: "Finasteride vs saw palmetto for hair loss",
    deck: "Prescription finasteride vs saw palmetto supplements — same internet thread, different rules.",
    description:
      "How prescription finasteride and saw palmetto supplements differ in evidence, regulation, and safety. For DHT biology, see our DHT overview; for full treatment categories, see our treatments guide.",
    excerpt:
      "Why “natural” is not the same as regulated medicine — questions for your prescriber.",
    hub: "treatments",
    audience: "both",
    contentType: "comparison",
    ctaType: "compare-treatments",
    publishedAt: "2026-02-15",
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      { id: "finasteride-mechanism", label: "What finasteride does" },
      { id: "women", label: "Women: different rules" },
      { id: "saw-palmetto", label: "What people say about saw palmetto" },
      { id: "not-substitute", label: "Why they are not the same thing" },
      { id: "dht-context", label: "How DHT fits in (quick refresher)" },
      { id: "monitoring", label: "Follow-up and realistic timing" },
      { id: "takeaway", label: "Bottom line" },
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
      "dutasteride-for-hair-loss-when-it-enters-the-conversation",
      "what-blood-tests-matter-for-hair-loss",
    ],
    primaryPillar: "hair-loss-medications",
    secondaryPillar: "androgen-index",
    glossarySlugs: ["dht"],
    references: [
      cite(
        "NHS (UK). Finasteride — uses, safety, and interactions including with herbal products (medicines guide).",
        "https://www.nhs.uk/medicines/finasteride/"
      ),
      cite(
        "NCCIH (NIH). Saw palmetto — what research shows and safety basics (consumer fact sheet).",
        "https://www.nccih.nih.gov/health/saw-palmetto"
      ),
      cite(
        "American Academy of Dermatology. Androgenetic alopecia (pattern hair loss) — patient summary.",
        "https://www.aad.org/public/diseases/hair-loss/causes/androgenetic-alopecia"
      ),
    ],
    Body: BodyFinasterideVsSawPalmetto,
  },
  {
    slug: "prp-vs-exosomes",
    title: "PRP vs exosomes for hair: evidence & safety",
    deck: "Two injection options — what they are, safety basics, diagnosis first.",
    description:
      "PRP versus exosome hair treatments: what the evidence shows, regulation and red flags, and questions to ask before you pay. Not a substitute for diagnosis-first medical care.",
    excerpt:
      "What to ask before you pay — and how to spot oversold promises.",
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
      { id: "exosomes-claims", label: "What exosome treatments involve" },
      { id: "evidence", label: "What research actually shows" },
      { id: "safety", label: "Safety, regulation, and red flags" },
      { id: "who-benefits", label: "Who might even be a candidate" },
      { id: "before-procedure", label: "Before you book injections" },
      { id: "labs", label: "Blood tests and general health (if your team suggests them)" },
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
          "That is a different kind of question — closer to surgical review and transparency. See our HLI vs HairAudit page to see where that fits.",
      },
    ]),
    relatedSlugs: [
      "finasteride-vs-saw-palmetto",
      "post-transplant-shock-loss-and-expectations",
      "hli-vs-hairaudit",
      "minoxidil-mechanism-and-realistic-timelines",
    ],
    primaryPillar: "hair-loss-medications",
    secondaryPillar: "hair-longevity",
    references: [
      cite(
        "American Academy of Dermatology. Hair loss: treatment options to discuss with a dermatologist.",
        "https://www.aad.org/public/diseases/hair-loss/treatment"
      ),
      cite(
        "U.S. FDA. Consumer update — stem cell and related products (regulatory caution for unapproved “regenerative” claims).",
        "https://www.fda.gov/consumers/consumer-updates/fda-warns-about-stem-cell-therapies"
      ),
      cite(
        "Gentile P et al. Autologous PRP in alopecia: overview with trial context (PMC open access).",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC7923160/"
      ),
    ],
    Body: BodyPrpVsExosomes,
  },
  {
    slug: "hli-vs-hairaudit",
    title: "HLI vs HairAudit: where to start",
    deck: "Ongoing thinning care vs transplant review — same network, two different doors in.",
    description:
      "Choose between long-term hair health education and lab support at HLI versus transplant review and surgical due diligence at HairAudit. Same network; different entry points.",
    excerpt:
      "Medical hair support first, or surgery questions first? A simple way to pick the right entry.",
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
      { id: "hli-focus", label: "When Hair Longevity Institute fits" },
      { id: "hairaudit-focus", label: "When HairAudit fits" },
      { id: "overlap", label: "When you need a bit of both" },
      { id: "same-ecosystem", label: "Same network, different jobs" },
      { id: "reading", label: "Good articles to read first on HLI" },
      { id: "when-hairaudit", label: "When a transplant review comes first" },
      { id: "not-advice", label: "This page helps you decide where to start" },
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
    primaryPillar: "hair-longevity",
    references: [
      cite(
        "American Academy of Dermatology. Hair transplantation: what patients should know.",
        "https://www.aad.org/public/diseases/hair-loss/treatment/hair-transplant"
      ),
      cite(
        "ISHRS. Getting started — patient information on hair restoration.",
        "https://ishrs.org/patients/getting-started"
      ),
      cite(
        "American Academy of Dermatology. Hair loss: causes and types (patient overview).",
        "https://www.aad.org/public/diseases/hair-loss"
      ),
    ],
    Body: BodyHliVsHairaudit,
  },
  {
    slug: "postpartum-shedding-when-to-reassure-vs-when-to-test",
    title: "Postpartum hair shedding: normal vs when to get checked",
    deck: "Typical timing after birth, plus when iron, thyroid, or other tests are worth discussing.",
    description:
      "Timing, reassurance versus red flags, and when iron or thyroid may be part of the story. Pairs with our postpartum guide for the full walkthrough.",
    excerpt:
      "Clumps after baby? Usually a normal cycle phase — when to watch and when to call your doctor.",
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
      { id: "normal-postpartum-shedding", label: "What normal postpartum shedding looks like" },
      { id: "when-reassurance-fits", label: "When it is OK to wait and observe" },
      { id: "red-flags-testing", label: "When your doctor may order tests" },
      { id: "overlap-thyroid-iron", label: "Thyroid, iron, and diet after birth" },
      { id: "hair-cycle-timelines", label: "How long recovery usually takes" },
      { id: "partner-with-clinician", label: "Working with your midwife or GP" },
      { id: "what-this-is-not", label: "What this article is not" },
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
      "postpartum-hair-loss-vs-female-pattern-thinning",
      "telogen-effluvium-after-illness-or-stress",
      "ferritin-and-hair-loss",
      "thyroid-hair-loss-explained",
    ],
    primaryPillar: "postpartum-hair-loss",
    secondaryPillar: "hair-longevity",
    glossarySlugs: ["telogen-effluvium"],
    references: [
      cite(
        "American Academy of Dermatology. Women’s hair loss (female pattern and diffuse shedding context).",
        "https://www.aad.org/public/diseases/hair-loss/causes/womens-hair-loss-female-pattern-baldness"
      ),
      cite(
        "StatPearls / NCBI Bookshelf. Postpartum thyroiditis (clinical overview).",
        "https://www.ncbi.nlm.nih.gov/books/NBK534824/"
      ),
      cite(
        "NICE CKS (UK). Anaemia — iron deficiency: investigation and management.",
        "https://cks.nice.org.uk/topics/anaemia-iron-deficiency/"
      ),
    ],
    Body: BodyPostpartumShedding,
  },
  {
    slug: "telogen-effluvium-after-illness-or-stress",
    title: "Telogen effluvium: shedding after stress or illness",
    deck: "Heavy shedding that starts weeks or months after a trigger — why the delay confuses people.",
    description:
      "Why delayed shedding happens, common triggers, overlap with pattern thinning, and when selective tests or review make sense.",
    excerpt:
      "Hair falls after you feel better? Delayed shedding happens — when to get checked instead of guessing.",
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
      { id: "what-te-triggers", label: "Common triggers (illness, stress, hormones)" },
      { id: "timing-after-stressor", label: "Why shedding shows up late" },
      { id: "overlap-pattern-loss", label: "When thinning is not “just stress”" },
      { id: "labs-when-indicated", label: "When blood tests may help" },
      { id: "prognosis", label: "Will it grow back?" },
      { id: "emotional-load", label: "When hair loss hits your mood" },
      { id: "when-specialist", label: "When a hair specialist helps" },
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
      "hair-shedding-vs-hair-breakage",
    ],
    primaryPillar: "hair-longevity",
    glossarySlugs: ["telogen-effluvium"],
    references: [
      cite(
        "StatPearls / NCBI Bookshelf. Telogen effluvium (mechanism, triggers, course).",
        "https://www.ncbi.nlm.nih.gov/books/NBK430957/"
      ),
      cite(
        "American Academy of Dermatology. Hair loss: causes and types (patient resource).",
        "https://www.aad.org/public/diseases/hair-loss"
      ),
      cite(
        "American Academy of Dermatology. Hair shedding: how much is normal?",
        "https://www.aad.org/public/diseases/hair-loss/insider/shedding"
      ),
    ],
    Body: BodyTelogenAfterIllnessStress,
  },
  {
    slug: "vitamin-d-b12-folate-what-labs-may-mean-for-hair",
    title: "Vitamin D, B12 & folate: labs and hair loss",
    deck: "D, B12, folate — what labs can and cannot explain about shedding or thinning.",
    description:
      "What vitamin D, B12, and folate tests can show, what they cannot prove about hair loss, and why high-dose supplements are not automatic. Narrower than our broad blood-test overview.",
    excerpt:
      "Before every “hair vitamin,” how D, B12, and folate fit a sensible check-up with your doctor.",
    hub: "blood-markers",
    audience: "both",
    contentType: "interpretation",
    ctaType: "start-assessment",
    publishedAt: "2026-03-12",
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      { id: "why-context-matters", label: "Why one lab line rarely explains hair loss" },
      { id: "vitamin-d", label: "Vitamin D" },
      { id: "b12-folate", label: "B12 and folate" },
      { id: "interpretation-limits", label: "What these tests cannot prove" },
      { id: "with-iron-thyroid", label: "How iron and thyroid fit in" },
      { id: "supplementation-caution", label: "Supplements: benefits and risks" },
      { id: "constructive-next-steps", label: "What to do next" },
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
          "Quality and follow-up vary. Testing through your doctor usually connects results to a clear plan.",
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
    primaryPillar: "hair-longevity",
    references: [
      cite(
        "NHS (UK). Vitamin D — roles, deficiency risk, and sensible supplementation context.",
        "https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/"
      ),
      cite(
        "NHS (UK). Vitamin B12 or folate deficiency anaemia — overview for patients.",
        "https://www.nhs.uk/conditions/vitamin-b12-or-folate-deficiency-anaemia/"
      ),
      cite(
        "Guo EL, Katta R. Diet and hair loss: effects of nutrient deficiency and supplement use. Dermatol Pract Concept. 2017 — open access via PMC.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC5315033/"
      ),
    ],
    Body: BodyVitaminMicronutrientsHair,
  },
  {
    slug: "scalp-inflammation-and-shedding",
    title: "Scalp inflammation, itching & hair shedding",
    deck: "Itch, flakes, or soreness plus shedding — why the scalp check comes before random shampoos.",
    description:
      "Seborrhoeic dermatitis, psoriasis, and overlap with shedding or pattern thinning — why exam-led diagnosis comes before trying random shampoos.",
    excerpt:
      "Angry scalp and hair falling? Often linked — not just a cosmetic add-on.",
    hub: "conditions",
    audience: "both",
    contentType: "guide",
    ctaType: "book-consult",
    publishedAt: "2026-03-15",
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      { id: "inflammation-and-cycle", label: "How scalp inflammation can affect shedding" },
      { id: "common-presentations", label: "Common scalp conditions people confuse" },
      { id: "overlap-shedding-aga", label: "When shedding and pattern thinning overlap" },
      { id: "examination-themes", label: "What your doctor looks for" },
      { id: "treatment-prescriber-led", label: "Treatment needs a prescriber" },
      { id: "alongside-systemic-health", label: "Whole-body health and blood tests" },
      { id: "when-urgent-care", label: "When to seek urgent care" },
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
    primaryPillar: "hair-longevity",
    references: [
      cite(
        "American Academy of Dermatology. Seborrheic dermatitis: overview (patient resource).",
        "https://www.aad.org/public/diseases/a-z/seborrheic-dermatitis-overview"
      ),
      cite(
        "American Academy of Dermatology. Scalp psoriasis: reducing hair loss (patient resource).",
        "https://www.aad.org/public/diseases/psoriasis/treatment/genitals/scalp-hair-loss"
      ),
      cite(
        "Rudnicka L et al. Trichoscopy update 2011. J Dermatol Case Rep. 2011 — open access via PMC.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC3241952/"
      ),
    ],
    Body: BodyScalpInflammationShedding,
  },
  {
    slug: "minoxidil-mechanism-and-realistic-timelines",
    title: "Minoxidil for hair loss: timelines & what to expect",
    deck: "Common topical for some pattern thinning — timelines, early shed, and why consistency matters.",
    description:
      "How topical minoxidil works, who it may suit, early shedding, irritation, and realistic timelines. One drug in depth — see our treatments guide for the full category map.",
    excerpt:
      "Using minoxidil and unsure it is working? Timing, irritation, and when to loop back to your prescriber.",
    hub: "treatments",
    audience: "both",
    contentType: "explainer",
    ctaType: "compare-treatments",
    publishedAt: "2026-03-18",
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      { id: "mechanism-overview", label: "What minoxidil is trying to do" },
      { id: "who-uses-it", label: "Who might use it" },
      { id: "timelines-shedding-phase", label: "Early shedding (and why it happens)" },
      { id: "realistic-outcomes", label: "What results usually look like" },
      { id: "adherence", label: "Using it consistently and caring for your scalp" },
      { id: "combination-context", label: "Using it alongside other treatments" },
      { id: "not-substitute-diagnosis", label: "It does not replace a proper diagnosis" },
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
      "oral-minoxidil-vs-topical-minoxidil",
      "scalp-inflammation-and-shedding",
    ],
    primaryPillar: "hair-loss-medications",
    secondaryPillar: "male-pattern-hair-loss",
    references: [
      cite(
        "MedlinePlus (NIH). Minoxidil topical — patient drug information (uses, precautions, timelines).",
        "https://medlineplus.gov/druginfo/meds/a689003.html"
      ),
      cite(
        "American Academy of Dermatology. Hair loss: diagnosis and treatment (patient resource).",
        "https://www.aad.org/public/diseases/hair-loss/treatment/diagnosis-treat"
      ),
      cite(
        "Suchonwanit P, Thammarucha S, Leerunyakul K. Minoxidil and its use in hair disorders: a review. Drug Des Devel Ther. 2019 — open access via PMC.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC6691938/"
      ),
    ],
    Body: BodyMinoxidilMechanism,
  },
  {
    slug: "post-transplant-shock-loss-and-expectations",
    title: "Hair transplant shock loss: what to expect",
    deck: "Temporary shed after a transplant is common — your clinic still reads your photos and symptoms.",
    description:
      "Temporary shedding after a transplant: usual timing, when to contact your clinic, recovery expectations, and urgent red flags. Follow your surgeon’s plan.",
    excerpt:
      "Hair falling after a transplant? Often an expected phase — plus red flags to call about fast.",
    hub: "conditions",
    audience: "patients",
    contentType: "guide",
    ctaType: "read-more",
    publishedAt: "2026-03-22",
    updatedAt: "2026-03-31",
    reviewedAt: "2026-03-31",
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
      { id: "shock-loss-what-it-is", label: "What “shock loss” means" },
      { id: "typical-timing", label: "Rough timing after surgery" },
      { id: "different-graft-concerns", label: "When something may be wrong" },
      { id: "communication-with-team", label: "Staying in touch with your clinic" },
      { id: "labs-systemic-health", label: "General health and blood tests" },
      { id: "longitudinal-expectations", label: "What density might look like long term" },
      { id: "emotional-expectations", label: "The emotional side" },
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
    primaryPillar: "hair-loss-medications",
    secondaryPillar: "hair-longevity",
    references: [
      cite(
        "American Academy of Dermatology. Hair transplant surgery — patient overview.",
        "https://www.aad.org/public/diseases/hair-loss/treatment/transplant"
      ),
      cite(
        "International Society of Hair Restoration Surgery. Getting started — informed patient education on hair restoration.",
        "https://ishrs.org/patients/getting-started"
      ),
      cite(
        "Goldin J, Zito PM, Raggio BS. Hair transplantation (includes counselling on shock loss and complications). StatPearls [Internet].",
        "https://www.ncbi.nlm.nih.gov/books/NBK547740/"
      ),
    ],
    Body: BodyPostTransplantShockLoss,
  },
  {
    slug: "oral-anti-androgens-in-women-specialist-led-context",
    title: "Women’s hair loss: oral anti-androgens & specialist care",
    deck: "Pills such as spironolactone are not DIY — monitoring and pregnancy planning are essential.",
    description:
      "Why some women discuss prescription anti-androgens under specialist care: monitoring, pregnancy planning, and safety — not instructions to start or switch medicines yourself. See our androgen guide for hormone context.",
    excerpt:
      "Not a forum or self-start topic — safety and follow-up need a specialist.",
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
      { id: "scope-specialist-led", label: "Why a specialist is involved" },
      { id: "why-not-self-start", label: "Why you should not self-start" },
      { id: "drug-classes-high-level", label: "Types of medicines (high level only)" },
      { id: "monitoring-safety", label: "Monitoring and safety" },
      { id: "fertility-pregnancy", label: "Pregnancy and fertility" },
      { id: "relation-pattern-hair-loss", label: "How this ties to pattern hair loss" },
      { id: "constructive-questions", label: "Questions worth asking your doctor" },
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
      "normal-testosterone-and-androgen-sensitive-hair-loss",
      "minoxidil-mechanism-and-realistic-timelines",
    ],
    primaryPillar: "androgen-index",
    secondaryPillar: "hair-loss-medications",
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
  {
    slug: "receding-hairline-vs-mature-hairline",
    title: "Receding Hairline vs Mature Hairline: What Is the Difference?",
    deck:
      "Not every hairline change means male-pattern loss — here is how maturation, early recession, and clinical clues differ, without turning this into a full DHT textbook.",
    description:
      "A calm, clinical walkthrough: what a mature hairline usually looks like, how early androgenetic recession differs, what clinicians assess (including trichoscopy), when early action makes sense — and why acting early means clarifying the pattern first, not rushing into treatment.",
    excerpt:
      "Temples shifting? Learn maturation versus recession, what photos and exams add, and when a visit is sensible.",
    hub: "hair-loss-causes",
    audience: "patients",
    contentType: "explainer",
    ctaType: "compare-treatments",
    publishedAt: "2026-04-17",
    updatedAt: "2026-04-17",
    reviewedAt: "2026-04-17",
    taxonomy: {
      conditions: ["androgenetic-alopecia"],
      markers: [],
      symptoms: ["temple-recession", "miniaturisation"],
      treatments: ["clinical-assessment", "topical-therapy"],
      tags: ["hairline", "pattern-hair-loss", "expectations"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "why-this-question-comes-up-so-often", label: "Why this question comes up so often" },
      { id: "what-a-mature-hairline-usually-looks-like", label: "What a mature hairline usually looks like" },
      { id: "what-early-recession-usually-looks-like", label: "What early recession usually looks like" },
      {
        id: "what-clinicians-look-for-and-key-differences",
        label: "What clinicians look for — and key differences at a glance",
      },
      { id: "when-it-is-worth-acting-early", label: "When it is worth acting early" },
      { id: "the-role-of-dht-and-genetics", label: "The role of DHT and genetics" },
      { id: "summary-and-next-steps", label: "Summary and next steps" },
    ],
    faq: faqBlock([
      {
        question: "What age does a mature hairline usually appear?",
        answer:
          "Maturation often begins in the late teens and completes by the mid-twenties — commonly between about seventeen and twenty-five. If meaningful movement continues beyond that window, early androgenetic alopecia is more likely than ongoing ‘normal’ maturation.",
      },
      {
        question: "Can a mature hairline still look slightly thinner?",
        answer:
          "Yes — and that can confuse assessment. The frontal edge can look a little less dense than hair further back in some lighting because of geometry. A mature hairline still keeps full-calibre hairs; if hairs look definitively wispy, shortened, or lighter than expected, that deserves closer review.",
      },
      {
        question: "How do I know if recession is still progressing?",
        answer:
          "The most practical approach is longitudinal photos: same angle, distance, and lighting every three to six months. Meaningful change after six to twelve months is a stronger signal than any single check-in. A clinician can also compare trichoscopy over time.",
      },
      {
        question: "Does a mature hairline always stay stable?",
        answer:
          "Not always. You can have normal maturation in your late teens or twenties and still develop androgenetic alopecia years later from that mature baseline — the two are not mutually exclusive.",
      },
    ]),
    relatedSlugs: [
      "dht-and-androgenetic-alopecia",
      "crown-thinning-why-it-can-be-harder-to-treat",
      "minoxidil-mechanism-and-realistic-timelines",
      "finasteride-vs-saw-palmetto",
    ],
    primaryPillar: "male-pattern-hair-loss",
    secondaryPillar: "androgen-index",
    glossarySlugs: ["dht"],
    references: [
      cite(
        "American Academy of Dermatology. Androgenetic alopecia (pattern hair loss) — patient summary.",
        "https://www.aad.org/public/diseases/hair-loss/causes/androgenetic-alopecia"
      ),
      cite(
        "Norwood OT. Male pattern baldness: classification and incidence. South Med J. 1975 — historical staging context (clinical teaching).",
        "https://pubmed.ncbi.nlm.nih.gov/1247724/"
      ),
      cite(
        "Ramos PM, Miot HA. Female Pattern Hair Loss: a clinical and pathophysiological review. An Bras Dermatol. 2015 — pattern recognition principles.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC4560543/"
      ),
    ],
    Body: BodyRecedingHairlineVsMature,
  },
  {
    slug: "crown-thinning-why-it-can-be-harder-to-treat",
    title: "Crown Thinning: Why It Can Be Harder to Treat",
    deck:
      "Vertex thinning is easy to miss, slower to judge in photos, and often slower to show cosmetic change — here is why stabilisation still counts as a win while you wait for visible density.",
    description:
      "Why crown thinning is noticed late, why improvement can take longer than at the hairline, what usually helps first (including stabilisation as a meaningful outcome), a trimmed DHT/crown biology bridge, and a month-by-month expectations framework — plus when to seek review.",
    excerpt:
      "Crown thinning: late detection, stubborn appearance, realistic timelines — and why stopping further loss matters.",
    hub: "hair-loss-causes",
    audience: "patients",
    contentType: "explainer",
    ctaType: "compare-treatments",
    publishedAt: "2026-04-17",
    updatedAt: "2026-04-17",
    reviewedAt: "2026-04-17",
    taxonomy: {
      conditions: ["androgenetic-alopecia"],
      markers: [],
      symptoms: ["crown-thinning", "miniaturisation"],
      treatments: ["topical-therapy", "antiandrogen-therapy"],
      tags: ["crown", "adherence", "pattern-hair-loss"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "why-crown-thinning-is-often-noticed-late", label: "Why crown thinning is often noticed late" },
      { id: "why-crown-thinning-can-feel-harder-to-improve", label: "Why crown thinning can feel harder to improve" },
      { id: "what-usually-helps-most", label: "What usually helps most" },
      {
        id: "when-crown-thinning-suggests-broader-pattern-loss",
        label: "When crown thinning suggests broader pattern loss",
      },
      { id: "when-to-seek-professional-review", label: "When to seek professional review" },
      {
        id: "understanding-the-biology-dht-miniaturisation-and-the-crown",
        label: "Understanding the biology: DHT, miniaturisation, and the crown",
      },
      {
        id: "setting-realistic-expectations-framework-for-progress",
        label: "Setting realistic expectations: a framework for progress",
      },
      { id: "next-steps-and-further-reading", label: "Next steps and further reading" },
    ],
    faq: faqBlock([
      {
        question: "Is crown thinning always male-pattern hair loss?",
        answer:
          "Usually androgenetic alopecia is the cause, but not always. Other possibilities include alopecia areata, diffuse telogen effluvium, nutritional or illness-related shedding, and less commonly scarring alopecias. Sudden, patchy, or symptomatic scalp changes deserve professional assessment.",
      },
      {
        question: "Why does the crown look worse in bright light?",
        answer:
          "Overhead and direct light cast shadows onto the scalp and can exaggerate see-through appearance. Side-lit or diffuse light often looks kinder. That is mostly optics — consistent photo conditions matter for tracking progress.",
      },
      {
        question: "Does crown thinning respond more slowly than a hairline?",
        answer:
          "Often yes: the crown may be treated at a more advanced stage, the whorl makes small gains hard to see, and cycles are slow — twelve to eighteen months is a common window before visible change for many responders.",
      },
      {
        question: "Is surgery the first answer for crown loss?",
        answer:
          "Rarely as a first step. The crown can be technically demanding to restore; without medical stabilisation, native loss around grafts can age poorly. Many clinicians recommend establishing stability — often on the order of twelve months of medical management — before planning surgery.",
      },
    ]),
    relatedSlugs: [
      "dht-and-androgenetic-alopecia",
      "minoxidil-mechanism-and-realistic-timelines",
      "receding-hairline-vs-mature-hairline",
      "finasteride-vs-saw-palmetto",
    ],
    primaryPillar: "male-pattern-hair-loss",
    secondaryPillar: "hair-loss-medications",
    glossarySlugs: ["dht"],
    references: [
      cite(
        "American Academy of Dermatology. Hair loss: diagnosis and treatment (patient resource).",
        "https://www.aad.org/public/diseases/hair-loss/treatment/diagnosis-treat"
      ),
      cite(
        "Suchonwanit P, Thammarucha S, Leerunyakul K. Minoxidil and its use in hair disorders: a review. Drug Des Devel Ther. 2019.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC6691938/"
      ),
      cite(
        "Lee WS et al. International consensus on the treatment of female pattern hair loss. J Am Acad Dermatol. 2018.",
        "https://doi.org/10.1016/j.jaad.2017.10.007"
      ),
    ],
    Body: BodyCrownThinningHarderToTreat,
  },
  {
    slug: "does-trt-cause-hair-loss-or-unmask-it",
    title: "Does TRT Cause Hair Loss, or Just Unmask It?",
    deck:
      "Whether TRT starts hair loss or reveals an existing androgen-sensitive pattern — a biology-first frame for your prescriber, not a verdict from a lab slip.",
    description:
      "How TRT changes androgen exposure and DHT context, why outcomes differ between individuals, cause versus unmasking, what clinicians assess beyond a single hormone line, and where to read next — scoped to TRT exposure, not a full DHT textbook.",
    excerpt:
      "On TRT and noticing thinning? Exposure, genetics, and pattern — framed for conversation with your clinician.",
    hub: "hair-loss-causes",
    audience: "both",
    contentType: "explainer",
    ctaType: "book-consult",
    publishedAt: "2026-04-17",
    updatedAt: "2026-04-17",
    reviewedAt: "2026-04-17",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "diffuse-thinning"],
      markers: ["testosterone", "shbg"],
      symptoms: ["temple-recession", "crown-thinning"],
      treatments: ["hormone-therapy-context", "clinical-assessment"],
      tags: ["trt", "androgens", "pattern-hair-loss"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "why-this-question-matters", label: "Why this question matters" },
      { id: "what-trt-changes-biologically", label: "What TRT changes biologically" },
      { id: "why-trt-does-not-affect-everyone-equally", label: "Why TRT does not affect everyone equally" },
      { id: "cause-versus-unmasking", label: "Cause versus unmasking: a critical distinction" },
      { id: "what-clinicians-look-at", label: "What clinicians look at" },
      { id: "what-to-do-next-with-your-prescriber", label: "What to do next — with your prescriber" },
      { id: "takeaways-and-where-to-read-next", label: "Takeaways and where to read next" },
    ],
    faq: faqBlock([
      {
        question: "Does TRT always cause hair loss?",
        answer:
          "No. Many men on TRT have little meaningful hair change. When thinning appears, an underlying predisposition is often being revealed or accelerated — not invented from nothing in every case.",
      },
      {
        question: "Can TRT accelerate existing male-pattern thinning?",
        answer:
          "Yes — that is often the most accurate framing. More substrate for DHT can move an existing process faster; it is usually acceleration, not a wholly new disease category.",
      },
      {
        question: "Should I stop TRT if I notice shedding?",
        answer:
          "Do not stop or change prescribed hormones without discussion. Stopping abruptly can remove therapy benefits without fixing genetic predisposition; review goals and options with your prescriber.",
      },
      {
        question: "Are blood tests enough to explain scalp changes on TRT?",
        answer:
          "Usually not on their own. Serum values do not fully describe follicle sensitivity or miniaturisation stage. Pattern, history, and exam carry weight — see our blood-test article for breadth without self-ordering.",
      },
    ]),
    relatedSlugs: [
      "dht-and-androgenetic-alopecia",
      "what-blood-tests-matter-for-hair-loss",
      "finasteride-vs-saw-palmetto",
      "normal-testosterone-and-androgen-sensitive-hair-loss",
    ],
    primaryPillar: "androgen-index",
    secondaryPillar: "male-pattern-hair-loss",
    glossarySlugs: ["dht"],
    references: [
      cite(
        "Bhasin S et al. Testosterone therapy in men with hypogonadism: an Endocrine Society clinical practice guideline. J Clin Endocrinol Metab. 2018.",
        "https://doi.org/10.1210/jc.2018-00229"
      ),
      cite(
        "American Academy of Dermatology. Androgenetic alopecia (pattern hair loss) — patient summary.",
        "https://www.aad.org/public/diseases/hair-loss/causes/androgenetic-alopecia"
      ),
      cite(
        "Mella JM et al. Efficacy and safety of finasteride therapy for androgenetic alopecia: a systematic review. Dermatology. 2010 — context for pattern-loss discussion.",
        "https://pubmed.ncbi.nlm.nih.gov/20374680/"
      ),
    ],
    Body: BodyTrtCauseOrUnmask,
  },
  {
    slug: "normal-testosterone-and-androgen-sensitive-hair-loss",
    title: "Can You Have Normal Testosterone and Still Have Androgen-Sensitive Hair Loss?",
    deck:
      "Yes — follicle sensitivity and pattern often matter more than one mid-range lab line.",
    description:
      "Why normal serum testosterone does not rule out androgen-sensitive thinning, why pattern and dermoscopy carry weight, how delayed diagnosis happens, sex-specific notes, what a fuller assessment includes, and how DHT fits — without duplicating our full DHT or blood-test explainers.",
    excerpt:
      "Normal testosterone on paper, thinning at the mirror — why both can be true.",
    hub: "hair-loss-causes",
    audience: "both",
    contentType: "explainer",
    ctaType: "compare-treatments",
    publishedAt: "2026-04-17",
    updatedAt: "2026-04-17",
    reviewedAt: "2026-04-17",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "diffuse-thinning"],
      markers: ["testosterone", "shbg"],
      symptoms: ["crown-thinning", "diffuse-loss"],
      treatments: ["clinical-assessment", "medical-therapy"],
      tags: ["androgens", "laboratory-interpretation", "pattern-hair-loss"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "why-normal-testosterone-does-not-rule-it-out", label: "Why normal testosterone does not rule it out" },
      { id: "why-pattern-matters-more-than-one-number", label: "Why pattern matters more than one number" },
      { id: "how-this-misunderstanding-delays-action", label: "How this misunderstanding delays action" },
      { id: "men-and-women-can-both-be-affected", label: "Men and women can both be affected" },
      { id: "what-a-better-assessment-looks-like", label: "What a better assessment looks like" },
      { id: "the-role-of-dht-and-local-conversion", label: "The role of DHT and local conversion" },
      { id: "takeaways-and-further-reading", label: "Takeaways and further reading" },
    ],
    faq: faqBlock([
      {
        question: "Can you lose hair with normal testosterone?",
        answer:
          "Yes. Follicle sensitivity is genetically determined and does not require a high serum testosterone; local DHT signalling can still drive miniaturisation.",
      },
      {
        question: "Do normal hormone results rule out androgen-sensitive loss?",
        answer:
          "No. A normal panel can reduce concern for some endocrine disorders, but androgenetic alopecia is primarily a clinical diagnosis from pattern and history.",
      },
      {
        question: "Is DHT measured in every case?",
        answer:
          "Not routinely — serum DHT does not fully reflect intrafollicular activity; many diagnoses are made from pattern and exam, with selective labs when indicated.",
      },
      {
        question: "Is this the same as the TRT-focused article?",
        answer:
          "No — see our TRT and hair article for therapy-specific framing. Here the focus is normal-range labs alongside thinning and follicle-level sensitivity.",
      },
    ]),
    relatedSlugs: [
      "does-trt-cause-hair-loss-or-unmask-it",
      "dht-and-androgenetic-alopecia",
      "what-blood-tests-matter-for-hair-loss",
      "diffuse-thinning-in-women",
    ],
    primaryPillar: "androgen-index",
    secondaryPillar: "hair-longevity",
    glossarySlugs: ["dht"],
    references: [
      cite(
        "American Academy of Dermatology. Androgenetic alopecia (pattern hair loss) — patient summary.",
        "https://www.aad.org/public/diseases/hair-loss/causes/androgenetic-alopecia"
      ),
      cite(
        "Lee WS et al. International consensus on the treatment of female pattern hair loss. J Am Acad Dermatol. 2018.",
        "https://doi.org/10.1016/j.jaad.2017.10.007"
      ),
      cite(
        "Lolli F et al. Trichoscopy updates in hair disorders: a systematic review. J Eur Acad Dermatol Venereol. 2021 — clinical pattern assessment context.",
        "https://pubmed.ncbi.nlm.nih.gov/33462611/"
      ),
    ],
    Body: BodyNormalTestosteroneAndrogenSensitive,
  },
  {
    slug: "oral-minoxidil-vs-topical-minoxidil",
    title: "Oral Minoxidil vs Topical Minoxidil for Hair Loss",
    deck:
      "Same active drug, different delivery — adherence, systemic monitoring, and who might discuss which route, with mechanism and timelines kept in a separate article.",
    description:
      "What topical and oral minoxidil share; how each route works in practice; who may lean toward one or the other; why ‘stronger’ is a misleading shortcut; monitoring and side-effect themes; and where to read about mechanism and timelines — route comparison only.",
    excerpt:
      "Foam versus tablet: practical differences, safety context, and prescriber-led decisions.",
    hub: "treatments",
    audience: "both",
    contentType: "comparison",
    ctaType: "compare-treatments",
    publishedAt: "2026-04-17",
    updatedAt: "2026-04-17",
    reviewedAt: "2026-04-17",
    taxonomy: {
      conditions: ["androgenetic-alopecia", "diffuse-thinning"],
      markers: [],
      symptoms: ["crown-thinning", "temple-recession"],
      treatments: ["topical-minoxidil", "oral-minoxidil-context"],
      tags: ["medical-therapy", "route-comparison", "prescriber-led"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "what-both-forms-are-trying-to-do", label: "What both forms are trying to do" },
      { id: "topical-minoxidil-in-practice", label: "Topical minoxidil in practice" },
      { id: "oral-minoxidil-in-practice", label: "Oral minoxidil in practice" },
      {
        id: "who-may-lean-toward-one-route-or-the-other",
        label: "Who may lean toward one route or the other",
      },
      { id: "what-not-to-compare-too-simplistically", label: "What not to compare too simplistically" },
      { id: "monitoring-safety-and-side-effects", label: "Monitoring, safety, and side effects" },
      { id: "next-steps-and-further-reading", label: "Next steps and further reading" },
    ],
    faq: faqBlock([
      {
        question: "Is oral minoxidil stronger than topical?",
        answer:
          "Not in a simple sense. Oral dosing changes systemic exposure and side-effect profile; ‘stronger’ is not a precise clinical comparison. Suitability and monitoring matter more than trend.",
      },
      {
        question: "Does topical minoxidil work more slowly?",
        answer:
          "Visible change with either route is usually measured in months. Consistency matters; head-to-head speed is not dramatically different for most people.",
      },
      {
        question: "Is oral minoxidil suitable for everyone?",
        answer:
          "No. Cardiovascular history and other factors may rule out systemic therapy. That decision belongs to your prescriber with your full history.",
      },
      {
        question: "What if topical minoxidil irritates my scalp?",
        answer:
          "Vehicle changes often help first (e.g. foam versus propylene-glycol-containing liquids). If irritation blocks use, supervised alternatives may be discussed.",
      },
    ]),
    relatedSlugs: [
      "minoxidil-mechanism-and-realistic-timelines",
      "finasteride-vs-saw-palmetto",
      "dht-and-androgenetic-alopecia",
      "dutasteride-for-hair-loss-when-it-enters-the-conversation",
    ],
    primaryPillar: "hair-loss-medications",
    secondaryPillar: "male-pattern-hair-loss",
    references: [
      cite(
        "Suchonwanit P, Thammarucha S, Leerunyakul K. Minoxidil and its use in hair disorders: a review. Drug Des Devel Ther. 2019.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC6691938/"
      ),
      cite(
        "Ramos PM, Miot HA. Female Pattern Hair Loss: a clinical and pathophysiological review. An Bras Dermatol. 2015.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC4560543/"
      ),
      cite(
        "American Academy of Dermatology. Hair loss: diagnosis and treatment (patient resource).",
        "https://www.aad.org/public/diseases/hair-loss/treatment/diagnosis-treat"
      ),
    ],
    Body: BodyOralVsTopicalMinoxidil,
  },
  {
    slug: "dutasteride-for-hair-loss-when-it-enters-the-conversation",
    title: "Dutasteride for Hair Loss: When It Enters the Conversation",
    deck:
      "Not first-line for everyone — when clinicians may discuss it, what ‘stronger’ gets wrong, and how it fits a long-term plan with supervision.",
    description:
      "Where dutasteride sits in hair-loss discussions, when it may come up, common misunderstandings about potency, planning beyond a single drug, questions to ask, expectations and patience, and curated next reads — conversation and safety context, not a prescribing tutorial.",
    excerpt:
      "When the name comes up: diagnosis-led discussion, access, and honest timelines — not forum dosing.",
    hub: "treatments",
    audience: "both",
    contentType: "decision",
    ctaType: "book-consult",
    publishedAt: "2026-04-17",
    updatedAt: "2026-04-17",
    reviewedAt: "2026-04-17",
    taxonomy: {
      conditions: ["androgenetic-alopecia"],
      markers: ["testosterone"],
      symptoms: ["crown-thinning", "temple-recession"],
      treatments: ["antiandrogen-therapy", "prescriber-monitoring"],
      tags: ["dutasteride", "5ari", "specialist-led"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "where-dutasteride-sits-in-the-discussion", label: "Where dutasteride sits in the discussion" },
      { id: "when-dutasteride-may-come-up", label: "When dutasteride may come up" },
      { id: "what-patients-often-misunderstand", label: "What patients often misunderstand" },
      { id: "how-dutasteride-fits-into-broader-planning", label: "How dutasteride fits into broader planning" },
      { id: "questions-worth-asking-your-clinician", label: "Questions worth asking your clinician" },
      { id: "expectations-patience-and-honest-outcomes", label: "Expectations, patience, and honest outcomes" },
      { id: "takeaways-and-best-next-reads", label: "Takeaways and best next reads" },
    ],
    faq: faqBlock([
      {
        question: "Is dutasteride always stronger than finasteride?",
        answer:
          "They differ in pharmacology and enzyme coverage; ‘stronger’ does not automatically mean better or appropriate for you. Individual response and risk profile vary.",
      },
      {
        question: "When is dutasteride discussed for hair loss?",
        answer:
          "Often when pattern loss is established, progression continues, and simpler options have had a fair, supervised trial — not as a default first step for everyone.",
      },
      {
        question: "Is dutasteride first-line for everyone?",
        answer:
          "No. Many people start with other evidence-based options; dutasteride, when it arises, is usually part of a considered path.",
      },
      {
        question: "How is response judged over time?",
        answer:
          "With agreed goals and follow-up intervals — typically over months, using photos, exam, and sometimes structured tools — not week-by-week guesswork.",
      },
    ]),
    relatedSlugs: [
      "finasteride-vs-saw-palmetto",
      "dht-and-androgenetic-alopecia",
      "minoxidil-mechanism-and-realistic-timelines",
      "oral-minoxidil-vs-topical-minoxidil",
    ],
    primaryPillar: "hair-loss-medications",
    secondaryPillar: "androgen-index",
    glossarySlugs: ["dht"],
    references: [
      cite(
        "Gubelin Harcha W et al. A randomized, active- and placebo-controlled study of the efficacy and safety of different doses of dutasteride versus placebo and finasteride in the treatment of male subjects with androgenetic alopecia. J Am Acad Dermatol. 2014.",
        "https://pubmed.ncbi.nlm.nih.gov/24041580/"
      ),
      cite(
        "American Academy of Dermatology. Androgenetic alopecia (pattern hair loss) — patient summary.",
        "https://www.aad.org/public/diseases/hair-loss/causes/androgenetic-alopecia"
      ),
      cite(
        "Singer BE, Bhimji SS. Dutasteride. StatPearls [Internet]. Treasure Island (FL): StatPearls Publishing — pharmacology overview (prescriber reference).",
        "https://www.ncbi.nlm.nih.gov/books/NBK459284/"
      ),
    ],
    Body: BodyDutasterideHairLossConversation,
  },
  {
    slug: "postpartum-hair-loss-vs-female-pattern-thinning",
    title: "Postpartum Hair Loss vs Female Pattern Thinning: How to Tell the Difference",
    deck:
      "Diffuse postpartum telogen shedding versus central, progressive pattern thinning — and when both overlap after birth.",
    description:
      "What uncomplicated postpartum shedding usually looks like, how female-pattern thinning differs, why presentations blend, a comparison table, when to reassure versus reassess, what next steps can include, and emotional context — differentiation-focused, not a generic women’s hair-loss encyclopaedia.",
    excerpt:
      "After pregnancy: expected shed, widening part, or both — a framework for the right conversation.",
    hub: "conditions",
    audience: "patients",
    contentType: "comparison",
    ctaType: "book-consult",
    publishedAt: "2026-04-17",
    updatedAt: "2026-04-17",
    reviewedAt: "2026-04-17",
    taxonomy: {
      conditions: ["telogen-effluvium", "androgenetic-alopecia"],
      markers: ["ferritin", "tsh"],
      symptoms: ["sudden-shedding", "diffuse-loss", "crown-thinning"],
      treatments: ["clinical-assessment", "laboratory-workup"],
      tags: ["postpartum", "womens-health", "pattern-hair-loss"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "what-postpartum-shedding-usually-looks-like", label: "What postpartum shedding usually looks like" },
      { id: "what-female-pattern-thinning-usually-looks-like", label: "What female-pattern thinning usually looks like" },
      { id: "when-the-line-between-them-blurs", label: "When the line between them blurs" },
      { id: "comparing-the-two-at-a-glance", label: "Comparing the two at a glance" },
      { id: "when-to-reassess-instead-of-only-reassure", label: "When to reassess instead of only reassure" },
      { id: "what-next-steps-may-look-like", label: "What next steps may look like" },
      { id: "emotional-context-and-clinical-clarity", label: "Emotional context and clinical clarity" },
    ],
    faq: faqBlock([
      {
        question: "Can postpartum shedding reveal female-pattern thinning?",
        answer:
          "Yes — hormonal transition can unmask genetic risk. If thinning persists beyond the usual recovery window or looks focal along the part or crown, pattern loss may be part of the picture.",
      },
      {
        question: "Is a widening part normal after pregnancy?",
        answer:
          "Diffuse density loss can affect the part during telogen shedding, but a clearly widening part that persists or worsens after the expected recovery period deserves clinical review.",
      },
      {
        question: "When should postpartum hair be improving?",
        answer:
          "In typical telogen effluvium, shedding often eases by roughly four to six months, with visible regrowth commonly by six to twelve months; lack of trajectory by about twelve months warrants reassessment.",
      },
      {
        question: "Do all postpartum cases need blood tests?",
        answer:
          "Not routinely when the story fits uncomplicated diffuse shedding. Tests are selective when recovery stalls, the pattern is atypical, or symptoms suggest iron, thyroid, or other contributors.",
      },
    ]),
    relatedSlugs: [
      "postpartum-shedding-when-to-reassure-vs-when-to-test",
      "diffuse-thinning-in-women",
      "telogen-effluvium-after-illness-or-stress",
      "ferritin-and-hair-loss",
    ],
    primaryPillar: "postpartum-hair-loss",
    secondaryPillar: "androgen-index",
    glossarySlugs: ["telogen-effluvium"],
    references: [
      cite(
        "American Academy of Dermatology. Women’s hair loss (female pattern hair loss) — overview.",
        "https://www.aad.org/public/diseases/hair-loss/causes/womens-hair-loss-female-pattern-baldness"
      ),
      cite(
        "Lee WS et al. International consensus on the treatment of female pattern hair loss. J Am Acad Dermatol. 2018.",
        "https://doi.org/10.1016/j.jaad.2017.10.007"
      ),
      cite(
        "Malkud S. Telogen effluvium: a review. J Clin Diagn Res. 2015 — postpartum telogen context.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC4387693/"
      ),
    ],
    Body: BodyPostpartumVsFemalePattern,
  },
  {
    slug: "hair-shedding-vs-hair-breakage",
    title: "Hair Shedding vs Hair Breakage: How to Tell the Difference",
    deck:
      "Follicle-driven shedding versus shaft damage — different clues, different next steps.",
    description:
      "What shedding and breakage are, how to use length and bulb clues, why the distinction changes management, mixed presentations, a practical self-assessment framework, and takeaways — basics under the hair-longevity pillar without duplicating full telogen or pattern articles.",
    excerpt:
      "Root release versus mid-shaft snap: how to describe what you are seeing.",
    hub: "conditions",
    audience: "patients",
    contentType: "explainer",
    ctaType: "start-assessment",
    publishedAt: "2026-04-17",
    updatedAt: "2026-04-17",
    reviewedAt: "2026-04-17",
    taxonomy: {
      conditions: ["telogen-effluvium", "diffuse-thinning"],
      markers: [],
      symptoms: ["sudden-shedding", "diffuse-loss"],
      treatments: ["clinical-assessment", "hair-care-review"],
      tags: ["shedding", "breakage", "trichoscopy-context"],
    },
    authors: [author],
    reviewers: [reviewer],
    toc: [
      { id: "what-is-hair-shedding", label: "What is hair shedding?" },
      { id: "what-is-hair-breakage", label: "What is hair breakage?" },
      { id: "clues-that-help-you-tell-them-apart", label: "Clues that help you tell them apart" },
      { id: "why-the-difference-matters", label: "Why the difference matters" },
      { id: "when-both-can-happen-together", label: "When both can happen together" },
      { id: "a-practical-self-assessment-framework", label: "A practical self-assessment framework" },
      { id: "key-takeaways-and-next-reads", label: "Key takeaways and next reads" },
    ],
    faq: faqBlock([
      {
        question: "How do I know if my hair is shedding or breaking?",
        answer:
          "Compare length and tips: shed hairs are often full-length with a possible root bulb; broken pieces are shorter, uneven, and lack a bulb.",
      },
      {
        question: "Do broken hairs have a bulb?",
        answer:
          "No — breakage occurs along the shaft; bulbs form when a whole hair releases from the follicle.",
      },
      {
        question: "Can you have both shedding and breakage at the same time?",
        answer:
          "Yes. Mixed brush findings are common; each mechanism is addressed on its own terms.",
      },
      {
        question: "Does breakage mean I am losing hair from the root?",
        answer:
          "Not in the same way as telogen shedding: the follicle can keep producing while lengths look thin from snaps — still worth sorting with your clinician if unsure.",
      },
    ]),
    relatedSlugs: [
      "telogen-effluvium-after-illness-or-stress",
      "scalp-inflammation-and-shedding",
      "diffuse-thinning-in-women",
      "what-blood-tests-matter-for-hair-loss",
    ],
    primaryPillar: "hair-longevity",
    glossarySlugs: ["telogen-effluvium"],
    references: [
      cite(
        "American Academy of Dermatology. Hair loss: tips for styling and caring for thinning hair.",
        "https://www.aad.org/public/diseases/hair-loss/causes/hair-care/styling-tips"
      ),
      cite(
        "Malkud S. Telogen effluvium: a review. J Clin Diagn Res. 2015.",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC4387693/"
      ),
      cite(
        "Goren A et al. Hair breakage assessment methods. Skin Appendage Disord. 2018 — cosmetic damage vs shedding distinction themes.",
        "https://pubmed.ncbi.nlm.nih.gov/28804714/"
      ),
    ],
    Body: BodySheddingVsBreakage,
  },
];
