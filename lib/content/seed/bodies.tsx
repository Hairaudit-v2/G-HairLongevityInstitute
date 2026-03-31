import Link from "next/link";
import { glossaryPath } from "@/lib/content/glossary";

const insight = (slug: string) => `/insights/${slug}`;

const h2 = "scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]";
const wrap = "editorial-prose space-y-6 text-[rgb(var(--text-secondary))]";
const lead = "text-base leading-relaxed text-[rgb(var(--text-primary))]";

export function BodyWhatBloodTestsMatter() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Blood tests do not diagnose hair loss on their own. They help your clinician decide whether nutrition, thyroid
        function, inflammation, or other systemic factors should sit alongside scalp examination, pattern, and history.
        This guide explains what is commonly discussed — not what you should order without medical advice.
      </p>
      <h2 id="why-selective" className={h2}>
        Why testing is selective, not automatic
      </h2>
      <p className="leading-relaxed">
        Good care avoids both under-investigation and over-testing. The value of a marker depends on your symptoms, pace
        of change, medications, pregnancy or postpartum status, and findings on examination. What is appropriate for one
        person may be unnecessary for another.
      </p>
      <h2 id="iron-and-blood-count" className={h2}>
        Full blood count and iron indices
      </h2>
      <p className="leading-relaxed">
        Iron studies and related indices are often part of the conversation when shedding is diffuse, rapid, or accompanied
        by symptoms that raise concern for low iron stores.{" "}
        <Link href={insight("ferritin-and-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          Ferritin interpretation
        </Link>{" "}
        is covered separately because context matters as much as the number.
      </p>
      <h2 id="thyroid" className={h2}>
        Thyroid function
      </h2>
      <p className="leading-relaxed">
        Thyroid hormones influence the hair cycle. When history or examination suggests thyroid disease, clinicians may
        request tests such as TSH and, when indicated, free T4 or additional panels. See{" "}
        <Link href={insight("thyroid-hair-loss-explained")} className="font-medium text-medical underline-offset-2 hover:underline">
          thyroid and hair loss explained
        </Link>{" "}
        for a plain-language overview — results still require individual interpretation.
      </p>
      <h2 id="inflammation-nutrition" className={h2}>
        Inflammation, nutrition, and other markers
      </h2>
      <p className="leading-relaxed">
        Markers of inflammation or specific vitamin and mineral levels may be considered when there are supporting clues
        in your history. They are not a universal panel for every cosmetic concern, and “normal” ranges do not replace
        clinical judgement.
      </p>
      <h2 id="fitting-together" className={h2}>
        How labs fit with pattern and examination
      </h2>
      <p className="leading-relaxed">
        Pattern hair loss, diffuse thinning, and inflammatory scalp disorders can overlap. Blood results are one layer in
        a broader assessment that may include photography, trichoscopy where used, and discussion of goals and timelines.
      </p>
      <h2 id="not-medical-advice" className={h2}>
        What this is not
      </h2>
      <p className="leading-relaxed">
        This article is educational. It is not a personal prescription for tests or supplements. If you already have
        results, bringing them to a qualified clinician — or a structured interpretation service — is the appropriate
        next step.
      </p>
      <h2 id="when-specialist" className={h2}>
        When a hair-focused review helps
      </h2>
      <p className="leading-relaxed">
        If you are unsure how your results relate to shedding or thinning, or if multiple causes may be in play, a
        biology-first review can help sequence next steps without replacing your GP or dermatologist.
      </p>
    </div>
  );
}

export function BodyFerritinAndHairLoss() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Ferritin is frequently discussed when people report increased shedding or reduced hair volume. It reflects iron
        storage, but it is not a stand-alone explanation for hair changes. Understanding what it measures — and what it
        cannot — helps you have clearer conversations with your clinician.
      </p>
      <h2 id="what-ferritin-is" className={h2}>
        What ferritin represents
      </h2>
      <p className="leading-relaxed">
        <Link href={glossaryPath("ferritin")} className="font-medium text-medical underline-offset-2 hover:underline">
          Ferritin
        </Link>{" "}
        is an acute-phase reactant as well as a marker of iron stores. Infection, inflammation, liver disease, and other
        conditions can shift it independently of iron status. That is why clinicians interpret it alongside history,
        examination, and often other blood indices.
      </p>
      <h2 id="shedding-context" className={h2}>
        Shedding and telogen effluvium context
      </h2>
      <p className="leading-relaxed">
        In{" "}
        <Link href={glossaryPath("telogen-effluvium")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium
        </Link>
        -type shedding, clinicians may look for reversible contributors, including low iron stores when supported by the
        wider picture. Correlation is not the same as a single cause, and not everyone with shedding has abnormal iron
        studies.
      </p>
      <h2 id="targets-and-ranges" className={h2}>
        Targets, ranges, and “optimal” labels
      </h2>
      <p className="leading-relaxed">
        Laboratory reference intervals vary by laboratory and population. Public discussions sometimes cite narrow
        “optimal” ferritin targets for hair; in practice, decisions depend on symptoms, haemoglobin, iron studies,
        menstrual losses, diet, and tolerance of treatment. Avoid self-treating based on a label alone.
      </p>
      <h2 id="with-thyroid" className={h2}>
        Iron results alongside thyroid and other tests
      </h2>
      <p className="leading-relaxed">
        Ferritin is one part of a selective work-up. When appropriate, clinicians may also consider thyroid function and
        other markers described in{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter for hair loss
        </Link>
        .
      </p>
      <h2 id="supplements" className={h2}>
        Supplements and monitoring
      </h2>
      <p className="leading-relaxed">
        Iron therapy carries risks if iron overload is present or if the diagnosis is wrong. Dosing, duration, and
        follow-up belong with a prescriber. Repeat testing is used to confirm response and safety, not as a DIY loop.
      </p>
      <h2 id="summary" className={h2}>
        Summary
      </h2>
      <p className="leading-relaxed">
        Ferritin can be a useful clue in hair shedding when interpreted in context. It does not replace clinical
        assessment, and it should not be read as a verdict on every hair concern.
      </p>
    </div>
  );
}

export function BodyThyroidHairLoss() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Thyroid disease can affect the hair cycle. Hair changes can also occur when thyroid blood tests are within
        reference ranges, because nutrition, stress, medications, and pattern hair disorders may coexist. This article
        outlines how thyroid and hair loss are discussed in clinical practice — without substituting for your own medical
        review.
      </p>
      <h2 id="how-thyroid-affects-hair" className={h2}>
        How thyroid hormones relate to the hair cycle
      </h2>
      <p className="leading-relaxed">
        Both underactive and overactive thyroid states can contribute to diffuse shedding or altered hair quality in some
        people. The mechanism is one piece of a larger picture that includes timing, associated symptoms, and scalp
        findings.
      </p>
      <h2 id="common-tests" className={h2}>
        Tests commonly used in primary care
      </h2>
      <p className="leading-relaxed">
        TSH is often used as an initial screen. Depending on symptoms and local guidelines, clinicians may add free T4 or
        other tests. Interpretation follows trends, clinical context, and pregnancy status — not a single snapshot in
        isolation.
      </p>
      <h2 id="subclinical" className={h2}>
        Borderline or “subclinical” results
      </h2>
      <p className="leading-relaxed">
        Mild abnormalities may be monitored rather than treated immediately. Whether treatment is appropriate is a
        decision between you and your clinician, based on symptoms, cardiovascular risk, fertility goals, and follow-up
        plans — not general internet thresholds.
      </p>
      <h2 id="normal-tests-still-shedding" className={h2}>
        Normal thyroid tests but ongoing shedding
      </h2>
      <p className="leading-relaxed">
        Normal thyroid blood tests do not rule out other causes of shedding, including{" "}
        <Link href={glossaryPath("telogen-effluvium")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium
        </Link>
        , pattern thinning, or scalp inflammation. See also{" "}
        <Link href={insight("diffuse-thinning-in-women")} className="font-medium text-medical underline-offset-2 hover:underline">
          diffuse thinning in women
        </Link>{" "}
        for why multiple drivers are common.
      </p>
      <h2 id="iron-and-thyroid" className={h2}>
        Iron and thyroid: often reviewed together
      </h2>
      <p className="leading-relaxed">
        In diffuse shedding, iron indices are sometimes checked alongside thyroid tests when history supports it. Our
        overview of{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          relevant blood tests
        </Link>{" "}
        explains why panels are tailored rather than universal.
      </p>
      <h2 id="next-steps" className={h2}>
        Constructive next steps
      </h2>
      <p className="leading-relaxed">
        If you have symptoms of thyroid disease, or abnormal results, follow up with your clinician. If your thyroid
        numbers are stable but hair symptoms persist, a hair-focused assessment can help separate pattern loss, shedding,
        and scalp disease.
      </p>
    </div>
  );
}

export function BodyDhtAndAga() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Androgenetic alopecia is a common pattern of hair miniaturisation driven by genetics and androgen signalling in
        susceptible follicles.{" "}
        <Link href={glossaryPath("dht")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT
        </Link>{" "}
        is an important part of that story — not the entire explanation for every person with thinning.
      </p>
      <h2 id="pattern-recognition" className={h2}>
        What clinicians look for on examination
      </h2>
      <p className="leading-relaxed">
        Pattern, distribution, and miniaturisation help distinguish androgenetic thinning from diffuse shedding or
        inflammatory conditions. Photography and follow-up can clarify progression over time.
      </p>
      <h2 id="dht-role" className={h2}>
        DHT’s role in susceptible follicles
      </h2>
      <p className="leading-relaxed">
        DHT is derived from testosterone via the 5α-reductase pathway. In genetically susceptible hair follicles, this
        signalling contributes to gradual miniaturisation. Individual sensitivity and other shedding drivers still matter
        for how symptoms present and respond.
      </p>
      <h2 id="not-only-men" className={h2}>
        Women and androgenetic patterning
      </h2>
      <p className="leading-relaxed">
        Female-pattern presentations may include widening of the part or diffuse crown thinning. Hormonal conditions can
        overlap; assessment is not based on a single lab value. For diffuse symptoms, see{" "}
        <Link href={insight("diffuse-thinning-in-women")} className="font-medium text-medical underline-offset-2 hover:underline">
          diffuse thinning in women
        </Link>
        .
      </p>
      <h2 id="labs" className={h2}>
        When blood tests are considered
      </h2>
      <p className="leading-relaxed">
        In selected cases — for example rapid onset, atypical patterns, or symptoms suggesting another cause — clinicians
        may order blood tests. This does not mean every case of pattern thinning requires extensive laboratories.
      </p>
      <h2 id="treatment-context" className={h2}>
        Treatment themes (high level)
      </h2>
      <p className="leading-relaxed">
        Medical therapies that modulate androgens or follicle signalling exist and require prescription, monitoring,
        and discussion of risks. An evidence-framed comparison of oral approaches appears in{" "}
        <Link href={insight("finasteride-vs-saw-palmetto")} className="font-medium text-medical underline-offset-2 hover:underline">
          finasteride vs saw palmetto
        </Link>{" "}
        — educational only, not a personal recommendation.
      </p>
      <h2 id="expectations" className={h2}>
        Realistic expectations
      </h2>
      <p className="leading-relaxed">
        Biology-first care emphasises accurate diagnosis, shared decision-making, and timelines measured in months.
        No medical therapy restores density overnight; goals are stabilisation and meaningful improvement where possible.
      </p>
    </div>
  );
}

export function BodyDiffuseThinningWomen() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Diffuse thinning in women is common and often multifactorial. Shedding, pattern thinning, nutritional factors,
        thyroid disease, and scalp disorders can overlap. A calm, structured assessment usually matters more than
        chasing a single label online.
      </p>
      <h2 id="patterns" className={h2}>
        Patterns that suggest different mechanisms
      </h2>
      <p className="leading-relaxed">
        Sudden heavy shedding weeks after illness, surgery, or major stress may align with telogen effluvium. Gradual
        widening of the part or crown thinning may raise androgenetic patterning. Scalp symptoms such as itching or
        flaking point toward dermatitis or other inflammatory conditions that deserve targeted evaluation.
      </p>
      <h2 id="overlap" className={h2}>
        Why several causes can coexist
      </h2>
      <p className="leading-relaxed">
        Low iron stores, thyroid shifts, and pattern hair loss can appear together. Treating one contributor does not
        automatically resolve another. That is why sequencing — history, examination, and selective tests — reduces
        wasted effort.
      </p>
      <h2 id="labs-selective" className={h2}>
        Selective laboratory review
      </h2>
      <p className="leading-relaxed">
        Guides such as{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter
        </Link>
        ,{" "}
        <Link href={insight("ferritin-and-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          ferritin
        </Link>
        , and{" "}
        <Link href={insight("thyroid-hair-loss-explained")} className="font-medium text-medical underline-offset-2 hover:underline">
          thyroid and hair
        </Link>{" "}
        explain common themes; your clinician tailors testing to you.
      </p>
      <h2 id="androgenetic" className={h2}>
        Androgenetic patterning in women
      </h2>
      <p className="leading-relaxed">
        When pattern thinning is likely, clinicians discuss evidence-based medical options and monitoring. For
        androgen biology context, see{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        .
      </p>
      <h2 id="procedural" className={h2}>
        Procedural options and timing
      </h2>
      <p className="leading-relaxed">
        Procedures such as PRP are sometimes discussed in comprehensive plans. A comparison of biologic-style office
        therapies appears in{" "}
        <Link href={insight("prp-vs-exosomes")} className="font-medium text-medical underline-offset-2 hover:underline">
          PRP vs exosomes
        </Link>{" "}
        — regulatory status, evidence, and consent vary by region and clinic.
      </p>
      <h2 id="support" className={h2}>
        Support without overclaiming
      </h2>
      <p className="leading-relaxed">
        Hair changes affect wellbeing. Education should empower questions for your clinician, not fear or premature
        self-diagnosis. If symptoms are rapid, painful, or associated with systemic signs, seek timely in-person care.
      </p>
    </div>
  );
}

export function BodyPrpVsExosomes() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Platelet-rich plasma (PRP) and exosome-based products are sometimes marketed for hair thinning. Evidence,
        regulation, product quality, and consent standards vary. This comparison is educational — it does not endorse a
        specific product or protocol.
      </p>
      <h2 id="what-prp-is" className={h2}>
        What PRP involves
      </h2>
      <p className="leading-relaxed">
        PRP generally refers to concentrating platelets from your own blood for injection or application according to a
        clinic protocol. Preparation methods and treatment schedules differ between practices, which partly explains
        variable outcomes in published literature.
      </p>
      <h2 id="exosomes-claims" className={h2}>
        What “exosomes” can mean in clinics
      </h2>
      <p className="leading-relaxed">
        Exosome therapies may refer to extracellular vesicle preparations, often marketed as regenerative. Source,
        manufacturing, purity, and regulatory classification are not uniform globally. Ask what you are receiving, from
        where, and what evidence supports use for your diagnosis.
      </p>
      <h2 id="evidence" className={h2}>
        Evidence snapshot (high level)
      </h2>
      <p className="leading-relaxed">
        Randomised trials exist for PRP in some contexts, with heterogeneity in technique and follow-up. Exosome
        therapies have a less mature evidence base for hair loss in many jurisdictions. Absence of long-term data should
        be part of informed discussion.
      </p>
      <h2 id="safety" className={h2}>
        Safety, regulation, and consent
      </h2>
      <p className="leading-relaxed">
        Any injection carries infection, pain, and rare complication risk. Products should be traceable and compliant
        with local regulation. Be cautious of marketing that promises uniform regrowth or replaces medical assessment.
      </p>
      <h2 id="who-benefits" className={h2}>
        Who might be a candidate (conceptually)
      </h2>
      <p className="leading-relaxed">
        Candidacy depends on diagnosis, pattern, expectations, and what has already been tried. Many plans still
        prioritise established medical therapies where appropriate; see{" "}
        <Link href={insight("finasteride-vs-saw-palmetto")} className="font-medium text-medical underline-offset-2 hover:underline">
          finasteride vs saw palmetto
        </Link>{" "}
        for context on oral options — always prescriber-led.
      </p>
      <h2 id="before-procedure" className={h2}>
        Before choosing a procedure
      </h2>
      <p className="leading-relaxed">
        Ensure diagnosis is clear, alternatives are understood, and photographic baselines are agreed. If you are
        evaluating surgical pathways or audit of past surgery, the ecosystem includes dedicated resources such as{" "}
        <a
          href="https://hairaudit.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-medical underline-offset-2 hover:underline"
        >
          HairAudit
        </a>{" "}
        — distinct from HLI’s biology-first medical interpretation focus (see{" "}
        <Link href={insight("hli-vs-hairaudit")} className="font-medium text-medical underline-offset-2 hover:underline">
          HLI vs HairAudit
        </Link>
        ).
      </p>
      <h2 id="labs" className={h2}>
        Laboratory context and optimisation
      </h2>
      <p className="leading-relaxed">
        Some clinicians review nutrition or thyroid status before or alongside procedures when clinically relevant.{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          What blood tests matter
        </Link>{" "}
        explains selective testing principles.
      </p>
    </div>
  );
}

export function BodyFinasterideVsSawPalmetto() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Finasteride is a prescription medication with established use in male-pattern hair loss under medical supervision.
        Saw palmetto is a botanical product sometimes discussed in androgen-related contexts. They are not interchangeable,
        and neither replaces individual medical advice. This article compares themes for education only.
      </p>
      <h2 id="finasteride-mechanism" className={h2}>
        Finasteride: mechanism and prescribing context
      </h2>
      <p className="leading-relaxed">
        Finasteride inhibits type II 5α-reductase, reducing conversion of testosterone to DHT. In appropriate male
        patients, it may support slowing miniaturisation when used consistently. Prescribers discuss fertility, sexual
        side-effect risk, monitoring, and contraindications — particularly in pregnancy handling (teratogenicity risk to
        a developing male foetus from tablet exposure).
      </p>
      <h2 id="women" className={h2}>
        Use in women
      </h2>
      <p className="leading-relaxed">
        Antiandrogen therapies in women are prescribed only in selected cases, often with contraception and specialist
        oversight. Do not apply male-pattern guidance to female patients without clinician involvement. For female
        diffuse thinning context, see{" "}
        <Link href={insight("diffuse-thinning-in-women")} className="font-medium text-medical underline-offset-2 hover:underline">
          diffuse thinning in women
        </Link>
        .
      </p>
      <h2 id="saw-palmetto" className={h2}>
        Saw palmetto: what people claim
      </h2>
      <p className="leading-relaxed">
        Saw palmetto extracts are marketed widely. Some small studies explore potential effects on androgen pathways; the
        hair-loss evidence base is limited compared with approved pharmacologic options. Product standardisation varies
        between brands, and interactions with other drugs are possible.
      </p>
      <h2 id="not-substitute" className={h2}>
        Why “natural” does not mean equivalent
      </h2>
      <p className="leading-relaxed">
        Different mechanisms, dosing, purity, and trial data mean outcomes are not comparable by marketing claims alone.
        Decisions belong with a clinician who knows your history, medications, and goals.
      </p>
      <h2 id="dht-context" className={h2}>
        DHT context
      </h2>
      <p className="leading-relaxed">
        For background on androgen signalling in pattern loss, read{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        .
      </p>
      <h2 id="monitoring" className={h2}>
        Monitoring and expectations
      </h2>
      <p className="leading-relaxed">
        Medical therapy for hair loss is assessed over months. Stopping treatment commonly allows progression to resume.
        Photography and structured follow-up help judge response more reliably than day-to-day mirror checks alone.
      </p>
      <h2 id="takeaway" className={h2}>
        Takeaway
      </h2>
      <p className="leading-relaxed">
        Finasteride and saw palmetto sit in different categories: prescription drug with defined counselling obligations
        versus supplement with variable evidence. Your prescriber can help you weigh risks, benefits, and alternatives.
      </p>
    </div>
  );
}

export function BodyHliVsHairaudit() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Hair Longevity Institute (HLI) and HairAudit are both part of the broader Hair Intelligence ecosystem, but they
        answer different questions. Choosing the right entry point saves time and sets clearer expectations.
      </p>
      <h2 id="hli-focus" className={h2}>
        HLI: biology, interpretation, and longitudinal planning
      </h2>
      <p className="leading-relaxed">
        HLI focuses on hair loss causes, blood marker interpretation in context, hormone mapping where clinically
        relevant, scalp health themes, and treatment planning from a biology-first perspective. It is suited when you want
        structured clarity on drivers, labs, and options — not when your primary need is surgical audit.
      </p>
      <h2 id="hairaudit-focus" className={h2}>
        HairAudit: surgery transparency and procedural due diligence
      </h2>
      <p className="leading-relaxed">
        HairAudit is oriented toward surgery transparency, audit, repair contexts, and assessing clinic or surgeon quality
        — including post-operative assessment themes. If your question is “was this procedure appropriate?” or “how do I
        evaluate a surgical plan?”, that pathway is closer to HairAudit’s remit.
      </p>
      <h2 id="overlap" className={h2}>
        Where people sometimes overlap
      </h2>
      <p className="leading-relaxed">
        Someone considering surgery may still benefit from pre-operative blood review or medical optimisation — areas HLI
        discusses. Someone focused on medical thinning may still have past surgery questions. The distinction is primary
        intent: medical interpretation versus surgical transparency.
      </p>
      <h2 id="same-ecosystem" className={h2}>
        Same ecosystem, different roles
      </h2>
      <p className="leading-relaxed">
        Sharing brand lineage does not blur accountability: each service has its own scope. HLI does not replace
        HairAudit for procedural audit, and HairAudit does not replace individualised medical interpretation from your
        treating clinicians.
      </p>
      <h2 id="reading" className={h2}>
        Reading that supports an HLI start
      </h2>
      <p className="leading-relaxed">
        If you are early in your journey,{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter
        </Link>
        ,{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        , and{" "}
        <Link href={insight("prp-vs-exosomes")} className="font-medium text-medical underline-offset-2 hover:underline">
          PRP vs exosomes
        </Link>{" "}
        provide educational anchors before you commit to a pathway.
      </p>
      <h2 id="when-hairaudit" className={h2}>
        When to open HairAudit first
      </h2>
      <p className="leading-relaxed">
        If surgery quality, consent documentation, or post-op concerns dominate your questions, start with HairAudit’s
        materials rather than expecting HLI to substitute for that audit function.
      </p>
      <h2 id="not-advice" className={h2}>
        Not routing or medical advice
      </h2>
      <p className="leading-relaxed">
        This page helps you self-triage information needs. It does not tell you which service you “must” use, and it does
        not diagnose. Personal decisions belong with you and your qualified professionals.
      </p>
    </div>
  );
}
