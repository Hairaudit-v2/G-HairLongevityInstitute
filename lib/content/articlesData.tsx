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
    deck: "Which tests help, when they matter, and why you rarely need the same panel as someone else.",
    description:
      "A plain-language guide to blood tests that often come up for shedding or thinning: iron and ferritin, thyroid, and others. Why your doctor picks certain tests for you — and why a big panel is not always the answer.",
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
    deck: "Storage iron in one number — useful, but not the whole hair story on its own.",
    description:
      "Ferritin is a common blood test when hair sheds. This article explains what it reflects, why illness or inflammation can change it, and why one number rarely tells the whole hair story.",
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
    deck: "Under- or overactive thyroid can change hair — and “normal” TSH does not answer every worry.",
    description:
      "Thyroid problems can speed up shedding or change hair texture for some people. Here is how doctors usually test, what borderline results can mean, and why hair loss still needs a full look beyond one lab line.",
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
    title: "DHT and pattern hair loss: a plain-English overview",
    deck: "How DHT ties into typical male and female pattern thinning — without one-hormone myths.",
    description:
      "Pattern hair loss often involves genetics and how DHT affects some follicles over time. This article explains that idea in patient terms, how doctors spot pattern loss on exam, and when blood tests are — and are not — useful.",
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
    title: "Thinning hair in women: how doctors sort common causes",
    deck: "Heavy shedding, slow thinning, or an unhappy scalp — often more than one thing is in play.",
    description:
      "Many women notice a wider part, less volume, or more hairs in the brush. This guide walks through common patterns, overlapping causes, when blood tests help, and how to avoid jumping to one internet diagnosis.",
    excerpt:
      "Wider part or less volume? How your clinician tells shedding, pattern thinning, and scalp problems apart — calmly.",
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
    deck: "Prescription finasteride vs saw palmetto supplements — same internet thread, different rules.",
    description:
      "Finasteride is a regulated medicine used for some types of pattern hair loss; saw palmetto is a plant extract sold as a supplement. This article compares how they are studied, regulated, and discussed — not which you should take.",
    excerpt:
      "Why “natural” is not the same as regulated medicine — questions for your prescriber.",
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
    title: "PRP vs exosomes for hair: what to ask before you pay",
    deck: "Two in-clinic injection options — what they are, safety basics, and why a clear diagnosis comes first.",
    description:
      "PRP uses concentrated platelets from your blood; exosome products vary by clinic and country. This article explains the difference in plain terms, what the evidence does and does not show, safety and regulation, and why established medical options still anchor most plans.",
    excerpt:
      "Know what you are buying, which questions to ask, and how to spot oversold promises.",
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
    references: [
      refPending("PRP in androgenetic alopecia — randomised trials synthesis"),
      refPending("Extracellular vesicle therapies — regulatory commentary"),
      refPending("Informed consent for aesthetic injectables"),
    ],
    Body: BodyPrpVsExosomes,
  },
  {
    slug: "hli-vs-hairaudit",
    title: "HLI vs HairAudit: where to start",
    deck: "Ongoing thinning care vs transplant review — same network, two different doors in.",
    description:
      "Hair Longevity Institute is built around long-term hair health, labs, education, and follow-up. HairAudit focuses on hair transplant review, transparency, and surgical due diligence. This page helps you decide where to start; it does not replace advice from your own doctors.",
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
    deck: "Often normal after birth — typical timing plus when iron, thyroid, or other checks help.",
    description:
      "Many parents lose more hair a few months after birth. This guide explains why that happens, when watchful waiting is reasonable, which symptoms should prompt a doctor visit, and how iron or thyroid sometimes overlap.",
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
    deck: "Shedding that shows up weeks or months after illness, surgery, or major stress — why timing feels wrong.",
    description:
      "Telogen effluvium is a common type of diffuse shedding that can start after you are already feeling better. This article explains typical triggers, timing, how it can overlap with pattern thinning, and when blood tests or a scalp exam matter.",
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
    deck: "D, B12, folate — what labs can and cannot explain about shedding or thinning.",
    description:
      "Low vitamin D, B12, or folate can matter for overall health and sometimes for hair when there is a real deficiency. This article explains what the tests measure, why normal results do not prove vitamins caused your thinning, and why high-dose supplements are not automatic.",
    excerpt:
      "Before every “hair vitamin,” how D, B12, and folate fit a sensible check-up with your doctor.",
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
    references: [
      refPending("Vitamin D deficiency — population and clinical context"),
      refPending("B12 and folate deficiency — haematology reference"),
      refPending("Nutritional factors in diffuse alopecia — review"),
    ],
    Body: BodyVitaminMicronutrientsHair,
  },
  {
    slug: "scalp-inflammation-and-shedding",
    title: "Scalp inflammation and shedding: what to discuss with your doctor",
    deck: "Itch, flakes, or soreness plus shedding — why the scalp check comes before random shampoos.",
    description:
      "Seborrhoeic dermatitis, psoriasis, and other scalp conditions can overlap with shedding or pattern thinning. This article explains why sorting the scalp problem comes before guessing at shampoos alone, and why prescriptions need a clinician.",
    excerpt:
      "Angry scalp and hair falling? Often linked — not just a cosmetic add-on.",
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
    references: [
      refPending("Seborrhoeic dermatitis — clinical management review"),
      refPending("Scalp psoriasis vs seborrhoeic dermatitis — differential"),
      refPending("Trichoscopy in inflammatory scalp disease — overview"),
    ],
    Body: BodyScalpInflammationShedding,
  },
  {
    slug: "minoxidil-mechanism-and-realistic-timelines",
    title: "Minoxidil: how it works and what to expect",
    deck: "Common topical for some pattern thinning — timelines, early shed, and why consistency matters.",
    description:
      "Minoxidil is a common topical option for some types of pattern hair loss. This article explains the basic idea, why some people shed more at first, how long before you might judge results, and why your diagnosis still guides whether it is appropriate.",
    excerpt:
      "Using minoxidil and unsure it is working? Timing, irritation, and when to loop back to your prescriber.",
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
    title: "Post-transplant shock loss: what to expect",
    deck: "Temporary shed after a transplant is common — your clinic still reads your photos and symptoms.",
    description:
      "Shock loss is a term for temporary shedding around a hair transplant. This article covers broad timing patterns, when to message your clinic, how general health and labs may sit alongside aftercare, and emotional expectations — without replacing your surgeon’s instructions.",
    excerpt:
      "Hair falling after a transplant? Often an expected phase — plus red flags to call about fast.",
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
    references: [
      refPending("Postoperative telogen effluvium after hair restoration — review"),
      refPending("Follicular unit transplantation — patient counselling resources"),
      refPending("Complications after hair surgery — when to seek care"),
    ],
    Body: BodyPostTransplantShockLoss,
  },
  {
    slug: "oral-anti-androgens-in-women-specialist-led-context",
    title: "Women’s hair loss pills (e.g. spironolactone): specialist-only",
    deck: "Sometimes used for pattern thinning — never safe to start from forums or without monitoring.",
    description:
      "Some women discuss oral anti-androgen medicines for pattern hair loss under a specialist. This article explains why these drugs need medical supervision, monitoring, pregnancy planning, and a clear diagnosis — not which tablet to take.",
    excerpt:
      "Thinking about spironolactone or similar? Safety, pregnancy, and follow-up mean a specialist has to lead.",
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
