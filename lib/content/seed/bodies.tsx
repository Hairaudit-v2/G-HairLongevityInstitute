import Link from "next/link";
import { glossaryPath } from "@/lib/content/glossary";
import { PILLAR_GUIDE_HREF } from "@/lib/content/pillarGuides";

export {
  BodyDutasterideHairLossConversation,
  BodyNormalTestosteroneAndrogenSensitive,
  BodyOralVsTopicalMinoxidil,
  BodyPostpartumVsFemalePattern,
  BodySheddingVsBreakage,
  BodyTrtCauseOrUnmask,
} from "@/lib/content/seed/bodiesInsightArticles";

const insight = (slug: string) => `/insights/${slug}`;

const h2 = "scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]";
const wrap = "editorial-prose space-y-6 text-[rgb(var(--text-secondary))]";
const lead = "text-base leading-relaxed text-[rgb(var(--text-primary))]";

export function BodyWhatBloodTestsMatter() {
  return (
    <div className={wrap}>
      <p className={lead}>
        If you are losing hair, you may wonder which blood tests matter. Here is the short version: labs never diagnose
        hair loss on their own. They help your doctor see whether iron, thyroid, inflammation, or other whole-body
        factors belong in the picture — together with your scalp exam, pattern of loss, and how symptoms changed over
        time. This guide lists themes doctors often discuss; it is not a list to self-order online.
      </p>
      <h2 id="why-selective" className={h2}>
        Why you might not need every test
      </h2>
      <p className="leading-relaxed">
        Good care avoids both skipping useful tests and ordering huge panels “just in case.” Whether a test helps depends
        on your symptoms, how fast things changed, medicines you take, pregnancy or postpartum status, and what your scalp
        looks like. What helps one person may add little for another.
      </p>
      <h2 id="iron-and-blood-count" className={h2}>
        Blood count and iron
      </h2>
      <p className="leading-relaxed">
        A full blood count and iron studies may come up when shedding is heavy or all-over, or when symptoms suggest low
        iron — if your doctor thinks testing is warranted.{" "}
        <Link href={insight("ferritin-and-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          Ferritin and hair loss
        </Link>{" "}
        goes deeper on storage iron; the number always needs the rest of the picture, not just a screenshot.
      </p>
      <h2 id="thyroid" className={h2}>
        Thyroid (TSH and related tests)
      </h2>
      <p className="leading-relaxed">
        Thyroid hormones affect the hair cycle. When your history or exam suggests a thyroid problem, your doctor may
        order TSH and sometimes free T4 or other tests. See{" "}
        <Link href={insight("thyroid-hair-loss-explained")} className="font-medium text-medical underline-offset-2 hover:underline">
          thyroid and hair loss explained
        </Link>{" "}
        for a plain walkthrough — your clinician still reads the trend and your symptoms, not one line in isolation.
      </p>
      <h2 id="inflammation-nutrition" className={h2}>
        Inflammation and vitamins
      </h2>
      <p className="leading-relaxed">
        Inflammation markers or specific vitamins and minerals may be checked when your story fits — for example diet,
        gut symptoms, or chronic illness. They are not a default package for every cosmetic hair worry, and “within
        range” on a printout does not replace a proper exam.
      </p>
      <h2 id="fitting-together" className={h2}>
        How labs fit with your scalp and pattern
      </h2>
      <p className="leading-relaxed">
        Pattern thinning, diffuse shedding, and inflamed scalps often overlap. Blood work is one layer next to photos,
        scalp inspection (sometimes with magnified views), and an honest talk about goals and timeframes.
      </p>
      <h2 id="not-medical-advice" className={h2}>
        What this page is not
      </h2>
      <p className="leading-relaxed">
        This article is educational. It is not a personal lab order or supplement plan. If you already have results, take
        them to a qualified clinician — or use a structured education pathway that still works alongside your doctor, not
        instead of them.
      </p>
      <h2 id="when-specialist" className={h2}>
        When a hair specialist can help
      </h2>
      <p className="leading-relaxed">
        If you are stuck on what your numbers mean for shedding or thinning, or several causes seem possible, a hair-focused
        review may help you sort what to do next — without replacing your GP or dermatologist.
      </p>
    </div>
  );
}

export function BodyFerritinAndHairLoss() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Ferritin measures how much iron your body has in reserve — think “storage,” not a perfect read of today’s iron
        status in every situation. It comes up often when hair sheds, because low stores can matter for some people. One
        result is never the whole story: your symptoms, exam, and often other blood tests still decide what it means.
      </p>
      <h2 id="what-ferritin-is" className={h2}>
        What is ferritin?
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
        Ferritin and shedding
      </h2>
      <p className="leading-relaxed">
        In{" "}
        <Link href={glossaryPath("telogen-effluvium")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium
        </Link>
        -type shedding, doctors may check whether low iron stores could be playing a part — when your symptoms and exam fit.
        That is not the same as saying ferritin alone caused the shed, and many people with shedding have normal iron
        studies.
      </p>
      <h2 id="targets-and-ranges" className={h2}>
        “Normal” vs online targets
      </h2>
      <p className="leading-relaxed">
        Laboratory reference intervals vary by laboratory and population. Public discussions sometimes cite narrow
        “optimal” ferritin targets for hair; robust trial evidence tying a single ferritin cut-off to hair outcomes is
        limited, so decisions still depend on symptoms, haemoglobin, iron studies, menstrual losses, diet, and tolerance
        of treatment. Avoid self-treating based on a label alone.
      </p>
      <h2 id="with-thyroid" className={h2}>
        Iron and thyroid tests together
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
        Iron supplements and follow-up
      </h2>
      <p className="leading-relaxed">
        Iron therapy carries risks if iron overload is present or if the diagnosis is wrong. Dosing, duration, and
        follow-up belong with a prescriber. Repeat testing is used to confirm response and safety, not as a DIY loop.
      </p>
      <h2 id="summary" className={h2}>
        In short
      </h2>
      <p className="leading-relaxed">
        Ferritin can be a useful clue when shedding has a reversible piece — but only read with your symptoms, exam, and
        often other blood work. It does not replace a proper assessment, and it should not be treated as the whole story
        for every hair concern.
      </p>
    </div>
  );
}

export function BodyThyroidHairLoss() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Wondering if your thyroid is behind your hair loss? An under- or overactive thyroid can speed up shedding or
        change hair texture for some people. At the same time, hair can thin when thyroid labs look fine — diet, stress,
        medicines, and pattern hair loss are common co-travellers. This article walks through how doctors usually connect
        the dots; it does not replace your own appointment.
      </p>
      <h2 id="how-thyroid-affects-hair" className={h2}>
        How thyroid trouble can affect hair
      </h2>
      <p className="leading-relaxed">
        Both low and high thyroid hormone states can go with diffuse shedding or coarser, weaker hair for some patients.
        Not everyone with thyroid disease loses hair the same way — timing, other symptoms, and what your scalp looks like
        still steer the conversation.
      </p>
      <h2 id="common-tests" className={h2}>
        Tests your doctor may order
      </h2>
      <p className="leading-relaxed">
        TSH is often the first screen. Depending on symptoms and local guidelines, your doctor may add free T4 or other
        tests. Numbers are read together with how you feel, repeat tests when needed, and pregnancy status — not as a
        one-off screenshot.
      </p>
      <h2 id="subclinical" className={h2}>
        Borderline or “mild” results
      </h2>
      <p className="leading-relaxed">
        Mild abnormalities may be monitored rather than treated immediately. Whether treatment is appropriate is a
        decision between you and your clinician, based on symptoms, cardiovascular risk, fertility goals, and follow-up
        plans — not general internet thresholds.
      </p>
      <h2 id="normal-tests-still-shedding" className={h2}>
        Normal thyroid labs but hair still shedding
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
        Iron and thyroid checks together
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
        What to do next
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
        Male- and female-pattern thinning often runs in families. For many people,{" "}
        <Link href={glossaryPath("dht")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT
        </Link>{" "}
        (dihydrotestosterone — a hormone made from testosterone) is part of why some follicles grow finer and shorter
        over the years. Genetics decide who is more sensitive. DHT is not the only story in every case, but it explains a
        large share of common pattern hair loss without turning it into a single-hormone myth.
      </p>
      <h2 id="pattern-recognition" className={h2}>
        What doctors look for on your scalp
      </h2>
      <p className="leading-relaxed">
        Pattern, distribution, and miniaturisation help distinguish androgenetic thinning from diffuse shedding or
        inflammatory conditions. Photography and follow-up can clarify progression over time.
      </p>
      <h2 id="dht-role" className={h2}>
        How DHT ties into pattern thinning
      </h2>
      <p className="leading-relaxed">
        Your body makes DHT from testosterone using the 5α-reductase enzyme. In people whose follicles are genetically
        more sensitive, that extra DHT exposure is a well-studied reason hairs can grow finer and shorter over years —
        the familiar temple and crown pattern in men, or wider part / crown thinning in many women. Other shedding causes
        can still sit on top; this is one major lane, not a single explanation for everyone.
      </p>
      <h2 id="not-only-men" className={h2}>
        Women get pattern hair loss too
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
        When blood tests help
      </h2>
      <p className="leading-relaxed">
        In selected cases — for example rapid onset, atypical patterns, or symptoms suggesting another cause — clinicians
        may order blood tests. This does not mean every case of pattern thinning requires extensive laboratories.
      </p>
      <h2 id="treatment-context" className={h2}>
        Treatment options (big picture)
      </h2>
      <p className="leading-relaxed">
        Prescription options that change androgen pathways or support follicles exist for pattern loss; they need medical
        supervision and a talk about risks. For how finasteride compares with saw palmetto as categories of treatment,
        see{" "}
        <Link href={insight("finasteride-vs-saw-palmetto")} className="font-medium text-medical underline-offset-2 hover:underline">
          finasteride vs saw palmetto
        </Link>{" "}
        — education only, not a personal recommendation.
      </p>
      <h2 id="expectations" className={h2}>
        What results usually look like
      </h2>
      <p className="leading-relaxed">
        Care that starts with the right diagnosis usually means shared decisions and patience — think months, not weeks.
        No medical therapy promises full teenage density back; many people aim first to slow loss, then see how much
        regrowth they get.
      </p>
    </div>
  );
}

export function BodyDiffuseThinningWomen() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Is your part widening, your ponytail thinner, or the brush suddenly full? Diffuse thinning in women is common, and
        several things can stack: stress shedding, female-pattern loss, low iron or thyroid issues, or an unhappy scalp. A
        steady, step-by-step assessment usually beats locking onto one internet diagnosis.
      </p>
      <h2 id="patterns" className={h2}>
        Different ways thinning can show up
      </h2>
      <p className="leading-relaxed">
        Sudden heavy shedding weeks after illness, surgery, or major stress may align with telogen effluvium. Gradual
        widening of the part or crown thinning may raise androgenetic patterning. Scalp symptoms such as itching or
        flaking point toward dermatitis or other inflammatory conditions that deserve targeted evaluation.
      </p>
      <h2 id="overlap" className={h2}>
        When several causes overlap
      </h2>
      <p className="leading-relaxed">
        Low iron stores, thyroid shifts, and pattern hair loss can appear together. Treating one contributor does not
        automatically resolve another. That is why sequencing — history, examination, and selective tests — reduces
        wasted effort.
      </p>
      <h2 id="labs-selective" className={h2}>
        Blood tests: only when they make sense
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
        Female pattern hair loss
      </h2>
      <p className="leading-relaxed">
        When pattern thinning is likely, clinicians discuss evidence-based medical options and monitoring. For
        androgen biology context, see{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and pattern hair loss
        </Link>
        .
      </p>
      <h2 id="procedural" className={h2}>
        Procedures (if you are considering them)
      </h2>
      <p className="leading-relaxed">
        Some plans include office treatments such as PRP or exosome injections. A calm comparison lives in{" "}
        <Link href={insight("prp-vs-exosomes")} className="font-medium text-medical underline-offset-2 hover:underline">
          PRP vs exosomes
        </Link>{" "}
        — rules, evidence, and consent differ by country and clinic.
      </p>
      <h2 id="support" className={h2}>
        Taking care of yourself while you sort it out
      </h2>
      <p className="leading-relaxed">
        Hair changes hit confidence and mood. Good education helps you walk into your appointment with clear questions —
        not panic or a fixed self-diagnosis. If loss is fast, painful, or comes with fever or other whole-body signs, seek
        in-person care promptly.
      </p>
    </div>
  );
}

export function BodyPrpVsExosomes() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Clinics often pitch injections for thinning hair. PRP usually means concentrating platelets from your own blood;
        exosome products differ widely by source, lab, and what regulators allow where you live. Evidence and safety are
        not the same for both, and marketing can outrun data. This page equips questions for your clinician — it does not
        choose a product for you, and a clear diagnosis should still come first.
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
        What exosome treatments involve
      </h2>
      <p className="leading-relaxed">
        Exosome therapies may refer to extracellular vesicle preparations, often marketed as regenerative. Source,
        manufacturing, purity, and regulatory classification are not uniform globally. Ask what you are receiving, from
        where, and what evidence supports use for your diagnosis.
      </p>
      <h2 id="evidence" className={h2}>
        What research actually shows
      </h2>
      <p className="leading-relaxed">
        Randomised trials exist for PRP in some contexts, with heterogeneity in technique and follow-up. Exosome
        therapies have a less mature evidence base for hair loss in many jurisdictions. Absence of long-term data should
        be part of informed discussion.
      </p>
      <h2 id="safety" className={h2}>
        Safety, regulation, and red flags
      </h2>
      <p className="leading-relaxed">
        Any injection carries infection, pain, and rare complication risk. Products should be traceable and compliant
        with local regulation. Be cautious of marketing that promises uniform regrowth or replaces medical assessment.
      </p>
      <h2 id="who-benefits" className={h2}>
        Who might even be a candidate
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
        Before you book injections
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
        Blood tests and general health (if your team suggests them)
      </h2>
      <p className="leading-relaxed">
        Some teams check nutrition or thyroid markers before or with injections when your history fits. That is the same
        selective approach as elsewhere — see{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter for hair loss
        </Link>
        .
      </p>
    </div>
  );
}

export function BodyFinasterideVsSawPalmetto() {
  return (
    <div className={wrap}>
      <p className={lead}>
        People often mention finasteride and saw palmetto in the same breath for thinning hair. Finasteride is a
        prescription medicine used for some types of male-pattern loss under a doctor’s care. Saw palmetto is a plant
        extract sold as a supplement. They are not interchangeable, and neither replaces a visit tailored to you. This
        article compares categories for learning only.
      </p>
      <h2 id="finasteride-mechanism" className={h2}>
        What finasteride does
      </h2>
      <p className="leading-relaxed">
        Finasteride inhibits type II 5α-reductase, reducing conversion of testosterone to DHT. In appropriate male
        patients, it may support slowing miniaturisation when used consistently. Prescribers discuss fertility, sexual
        side-effect risk, monitoring, and contraindications — particularly in pregnancy handling (teratogenicity risk to
        a developing male foetus from tablet exposure).
      </p>
      <h2 id="women" className={h2}>
        Women: different rules
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
        What people say about saw palmetto
      </h2>
      <p className="leading-relaxed">
        Saw palmetto extracts are marketed widely. For male-pattern hair loss specifically, only small, short trials exist,
        and major reviews have more often focused on other indications — so hair-specific conclusions remain limited
        compared with approved medicines. Product standardisation varies between brands, and interactions with other drugs
        are possible.
      </p>
      <h2 id="not-substitute" className={h2}>
        Why they are not the same thing
      </h2>
      <p className="leading-relaxed">
        Different mechanisms, dosing, purity, and trial data mean outcomes are not comparable by marketing claims alone.
        Decisions belong with a clinician who knows your history, medications, and goals.
      </p>
      <h2 id="dht-context" className={h2}>
        How DHT fits in (quick refresher)
      </h2>
      <p className="leading-relaxed">
        For how DHT may affect pattern hair loss in plain language, read{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and pattern hair loss
        </Link>
        .
      </p>
      <h2 id="monitoring" className={h2}>
        Follow-up and realistic timing
      </h2>
      <p className="leading-relaxed">
        Medical therapy for hair loss is assessed over months. Stopping treatment commonly allows progression to resume.
        Photography and structured follow-up help judge response more reliably than day-to-day mirror checks alone.
      </p>
      <h2 id="takeaway" className={h2}>
        Bottom line
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
        Not sure whether to start with medical hair education or a transplant-focused review? Hair Longevity Institute
        (HLI) and HairAudit sit in the same Hair Intelligence network, but they answer different first questions. This page
        matches your worry — ongoing thinning, labs, and planning versus surgery plans, consent, or post-op concerns —
        so you do not pick the wrong door.
      </p>
      <h2 id="hli-focus" className={h2}>
        When Hair Longevity Institute fits
      </h2>
      <p className="leading-relaxed">
        HLI is built around long-term hair support and follow-up: why hair may be thinning, what blood tests might mean
        when your doctor orders them, hormone and scalp themes at a high level, and how medical options fit together. It
        may help in the right situation when you want structured clarity on biology and planning — not when your main
        question is whether a past or planned surgery was handled well.
      </p>
      <h2 id="hairaudit-focus" className={h2}>
        When HairAudit fits
      </h2>
      <p className="leading-relaxed">
        HairAudit focuses on hair transplant transparency: reviewing plans, understanding candidacy, clinic quality, and
        post-op concerns. If you are asking “Is this surgical plan reasonable?” or “Something feels off after my
        procedure,” that lane is closer to HairAudit than to HLI’s medical-education focus.
      </p>
      <h2 id="overlap" className={h2}>
        When you need a bit of both
      </h2>
      <p className="leading-relaxed">
        Someone heading toward surgery may still want labs or general health sorted first — topics HLI-style education
        often covers. Someone focused on medical thinning may still have old transplant questions later. The useful split
        is what matters most today: medical drivers and options, or surgical review and audit.
      </p>
      <h2 id="same-ecosystem" className={h2}>
        Same network, different jobs
      </h2>
      <p className="leading-relaxed">
        Same family of services does not mean the same job description. HLI is not a substitute for HairAudit when you
        need procedural audit, and HairAudit does not replace the medical interpretation your own doctors provide day to
        day.
      </p>
      <h2 id="reading" className={h2}>
        Good articles to read first on HLI
      </h2>
      <p className="leading-relaxed">
        If you are early in your journey,{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter
        </Link>
        ,{" "}
        <Link href={insight("telogen-effluvium-after-illness-or-stress")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium after illness or stress
        </Link>
        , and{" "}
        <Link href={insight("postpartum-shedding-when-to-reassure-vs-when-to-test")} className="font-medium text-medical underline-offset-2 hover:underline">
          postpartum shedding
        </Link>{" "}
        provide educational anchors before you commit to a pathway — alongside procedure comparisons such as{" "}
        <Link href={insight("prp-vs-exosomes")} className="font-medium text-medical underline-offset-2 hover:underline">
          PRP vs exosomes
        </Link>
        .
      </p>
      <h2 id="when-hairaudit" className={h2}>
        When a transplant review comes first
      </h2>
      <p className="leading-relaxed">
        If surgery quality, consent paperwork, or post-op worries are what keep you up at night, HairAudit’s materials
        are the more direct fit. HLI should not be expected to do that audit work for you.
      </p>
      <h2 id="not-advice" className={h2}>
        This page helps you decide where to start
      </h2>
      <p className="leading-relaxed">
        Nothing here tells you which service you “must” use, and nothing here diagnoses you. It is a map for your
        questions; your doctors and surgeons still lead your actual care.
      </p>
    </div>
  );
}

export function BodyPostpartumShedding() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Many new parents notice clumps or a thinner ponytail a few months after birth. That often follows normal hair-cycle
        shifts — and it can still feel frightening. Postpartum life can also overlap with low iron or thyroid changes, so
        this guide separates “probably normal for now” from “worth a call,” without replacing your midwife, GP, or
        obstetric team.
      </p>
      <h2 id="normal-postpartum-shedding" className={h2}>
        What normal postpartum shedding looks like
      </h2>
      <p className="leading-relaxed">
        Shedding often becomes noticeable several months after delivery as follicles move through recovery from pregnancy-related
        hormonal shifts. Volume changes can feel dramatic emotionally even when the pattern is physiologic. If you are
        unsure, a routine postpartum or GP review is an appropriate first step.
      </p>
      <h2 id="when-reassurance-fits" className={h2}>
        When it is OK to wait and observe
      </h2>
      <p className="leading-relaxed">
        Diffuse shedding without scalp pain, scarring signs, or major systemic symptoms sometimes follows a time course
        consistent with{" "}
        <Link href={glossaryPath("telogen-effluvium")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium
        </Link>
        -type recovery. Compare timing and context with{" "}
        <Link href={insight("telogen-effluvium-after-illness-or-stress")} className="font-medium text-medical underline-offset-2 hover:underline">
          shedding after illness or stress
        </Link>{" "}
        — triggers differ, but the hair-cycle principles rhyme.
      </p>
      <h2 id="red-flags-testing" className={h2}>
        When your doctor may order tests
      </h2>
      <p className="leading-relaxed">
        Fatigue beyond expected recovery, palpitations, big mood shifts, heavy bleeding, or symptoms that point to thyroid
        or iron trouble may lead to selective labs — not a giant panel for every new parent who sheds. See{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter
        </Link>{" "}
        and{" "}
        <Link href={insight("ferritin-and-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          ferritin and hair loss
        </Link>
        .
      </p>
      <h2 id="overlap-thyroid-iron" className={h2}>
        Thyroid, iron, and diet after birth
      </h2>
      <p className="leading-relaxed">
        Postpartum thyroiditis and iron depletion occur in some patients and can overlap with hair symptoms. Interpretation
        belongs with clinicians who know your pregnancy history. Micronutrient articles such as{" "}
        <Link href={insight("vitamin-d-b12-folate-what-labs-may-mean-for-hair")} className="font-medium text-medical underline-offset-2 hover:underline">
          vitamin D, B12, and folate
        </Link>{" "}
        explain how those markers are discussed — not automatic causes of hair loss.
      </p>
      <h2 id="hair-cycle-timelines" className={h2}>
        How long recovery usually takes
      </h2>
      <p className="leading-relaxed">
        Hair improvement, when drivers are resolving, is measured in months. Photography and gentle tracking can reduce
        day-to-day anxiety; they do not replace medical review when red flags exist.
      </p>
      <h2 id="partner-with-clinician" className={h2}>
        Working with your midwife or GP
      </h2>
      <p className="leading-relaxed">
        Bring a simple timeline: delivery date, breastfeeding status, supplements, and symptom list. For broader female
        thinning patterns,{" "}
        <Link href={insight("diffuse-thinning-in-women")} className="font-medium text-medical underline-offset-2 hover:underline">
          diffuse thinning in women
        </Link>{" "}
        adds context when postpartum shedding blends into longer-term change.
      </p>
      <h2 id="what-this-is-not" className={h2}>
        What this article is not
      </h2>
      <p className="leading-relaxed">
        This is education, not postpartum medical advice for you individually. If you feel unwell, in crisis, or unsure,
        contact your maternity team or urgent services as local guidance recommends.
      </p>
    </div>
  );
}

export function BodyTelogenAfterIllnessStress() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Hair falling out weeks or months after a fever, surgery, crash diet, or major stress? That delayed shed is what
        many clinicians call telogen effluvium — extra hairs shift into shedding phase around the same time, so the fall
        feels sudden even though the trigger was earlier. Do not self-diagnose from shedding alone; this article explains
        the pattern in plain language so you can ask your doctor better questions.
      </p>
      <h2 id="what-te-triggers" className={h2}>
        Common triggers (illness, stress, hormones)
      </h2>
      <p className="leading-relaxed">
        Illness with fever, surgery, major psychological stress, crash dieting, and some medications appear on many
        clinicians’ lists. Postpartum shifts are another common context — see{" "}
        <Link href={insight("postpartum-shedding-when-to-reassure-vs-when-to-test")} className="font-medium text-medical underline-offset-2 hover:underline">
          postpartum shedding: reassure vs test
        </Link>
        .
      </p>
      <h2 id="timing-after-stressor" className={h2}>
        Why shedding shows up late
      </h2>
      <p className="leading-relaxed">
        Shedding often lags the trigger because many follicles synchronise into shedding phase together. That delay
        confuses people who no longer “feel sick” when hair falls. Your clinician correlates history with examination.
      </p>
      <h2 id="overlap-pattern-loss" className={h2}>
        When thinning is not “just stress”
      </h2>
      <p className="leading-relaxed">
        Androgenetic thinning can coexist. If the scalp shows pattern miniaturisation or symptoms persist longer than
        expected, assessment may broaden. For pattern biology,{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and pattern hair loss
        </Link>{" "}
        is a separate read — not every shedder needs that lens first.
      </p>
      <h2 id="labs-when-indicated" className={h2}>
        When blood tests may help
      </h2>
      <p className="leading-relaxed">
        Your doctor may order targeted tests when your story suggests iron, thyroid, or other issues — not a default
        battery for everyone. Our{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          blood tests overview
        </Link>{" "}
        and{" "}
        <Link href={insight("vitamin-d-b12-folate-what-labs-may-mean-for-hair")} className="font-medium text-medical underline-offset-2 hover:underline">
          vitamin D, B12, and folate article
        </Link>{" "}
        explain how those pieces fit when they actually change the plan.
      </p>
      <h2 id="prognosis" className={h2}>
        Will it grow back?
      </h2>
      <p className="leading-relaxed">
        When the driver resolves, many people see gradual normalisation over months. Ongoing triggers or second diagnoses
        change that picture — another reason personalised review matters.
      </p>
      <h2 id="emotional-load" className={h2}>
        When hair loss hits your mood
      </h2>
      <p className="leading-relaxed">
        Shedding is visible and stressful. Naming the pattern can help, but it does not minimise distress. If anxiety or
        mood symptoms dominate, discuss them with your clinician — they deserve care in their own right.
      </p>
      <h2 id="when-specialist" className={h2}>
        When a hair specialist helps
      </h2>
      <p className="leading-relaxed">
        Rapid progression, scarring signs, pain, or diagnostic uncertainty are reasons people seek dermatology or
        trichology-aligned review. For scalp symptoms,{" "}
        <Link href={insight("scalp-inflammation-and-shedding")} className="font-medium text-medical underline-offset-2 hover:underline">
          scalp inflammation and shedding
        </Link>{" "}
        outlines inflammatory overlap themes.
      </p>
    </div>
  );
}

export function BodyVitaminMicronutrientsHair() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Should you test vitamin D, B12, or folate because of hair shedding? Sometimes — when your story fits. Low levels
        can matter for your health and may sit alongside hair symptoms, but normal labs do not prove vitamins “caused”
        thinning, and pills are not automatic. Here is how doctors usually fold these tests in with the rest of the visit.
      </p>
      <h2 id="why-context-matters" className={h2}>
        Why one lab line rarely explains hair loss
      </h2>
      <p className="leading-relaxed">
        Diet, malabsorption, medications, pregnancy, sunlight exposure, and chronic illness all influence micronutrient
        indices. Your clinician interprets labs against symptoms — not against generic “optimal hair” thresholds from
        informal sources.
      </p>
      <h2 id="vitamin-d" className={h2}>
        Vitamin D: what low results might mean
      </h2>
      <p className="leading-relaxed">
        Low vitamin D is common in some populations and may warrant replacement for bone and general health reasons when
        clinically appropriate. Linking a specific 25-OH vitamin D value directly to hair density is usually overstated
        without broader assessment.
      </p>
      <h2 id="b12-folate" className={h2}>
        B12 and folate
      </h2>
      <p className="leading-relaxed">
        Deficiency can associate with anaemia or neurological symptoms that deserve treatment on their own merits. Hair
        may be one part of the conversation, not the sole decision driver for dosing.
      </p>
      <h2 id="interpretation-limits" className={h2}>
        What these tests cannot prove
      </h2>
      <p className="leading-relaxed">
        “Mild” deviations do not automatically explain months of shedding if the rest of the assessment points elsewhere.
        Conversely, fixing a real deficiency may still leave pattern hair loss or inflammatory scalp disease to address
        separately.
      </p>
      <h2 id="with-iron-thyroid" className={h2}>
        How iron and thyroid fit in
      </h2>
      <p className="leading-relaxed">
        When diffuse shedding is evaluated, clinicians often consider iron and thyroid in selected cases. Pair this read
        with{" "}
        <Link href={insight("ferritin-and-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          ferritin
        </Link>{" "}
        and{" "}
        <Link href={insight("thyroid-hair-loss-explained")} className="font-medium text-medical underline-offset-2 hover:underline">
          thyroid and hair
        </Link>
        .
      </p>
      <h2 id="supplementation-caution" className={h2}>
        Supplements: benefits and risks
      </h2>
      <p className="leading-relaxed">
        High-dose or combined supplements can cause harm, mask other issues, or interact with medicines. Dosing and
        duration belong with prescribers who know your full history.
      </p>
      <h2 id="constructive-next-steps" className={h2}>
        What to do next
      </h2>
      <p className="leading-relaxed">
        If you already have labs, bring them to your clinician with symptom timelines. For how tests fit a broader plan,
        start with{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter for hair loss
        </Link>
        .
      </p>
    </div>
  );
}

export function BodyScalpInflammationShedding() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Itchy, flaky, or tender scalp and extra hairs in the brush often show up together. Causes range from common
        dandruff-type conditions to problems that need a specific prescription plan. This article explains why the scalp
        exam matters — it does not replace an in-person diagnosis or treatment choice.
      </p>
      <h2 id="inflammation-and-cycle" className={h2}>
        How scalp inflammation can affect shedding
      </h2>
      <p className="leading-relaxed">
        Local inflammation can disrupt the comfortable hair environment and sometimes overlaps with diffuse shedding
        patterns. Sorting inflammation from pure telogen effluvium is part of why clinicians examine the scalp closely.
      </p>
      <h2 id="common-presentations" className={h2}>
        Common scalp conditions people confuse
      </h2>
      <p className="leading-relaxed">
        Itch, burning, tightness, yellowish scale, or redness prompt different diagnostic considerations than painless
        diffuse shedding alone. Photography can help track change but does not replace diagnosis.
      </p>
      <h2 id="overlap-shedding-aga" className={h2}>
        When shedding and pattern thinning overlap
      </h2>
      <p className="leading-relaxed">
        You can have inflammatory scalp symptoms alongside{" "}
        <Link href={insight("telogen-effluvium-after-illness-or-stress")} className="font-medium text-medical underline-offset-2 hover:underline">
          stress-related shedding
        </Link>{" "}
        or{" "}
        <Link href={insight("diffuse-thinning-in-women")} className="font-medium text-medical underline-offset-2 hover:underline">
          diffuse thinning
        </Link>
        . Sequencing treatment depends on which piece is driving symptoms and risk.
      </p>
      <h2 id="examination-themes" className={h2}>
        What your doctor looks for
      </h2>
      <p className="leading-relaxed">
        Pattern, scale type, lymph nodes, and hair shaft changes all refine the differential. Trichoscopy may be used
        where available — interpretation stays with the examining clinician.
      </p>
      <h2 id="treatment-prescriber-led" className={h2}>
        Treatment needs a prescriber
      </h2>
      <p className="leading-relaxed">
        Shampoos, topicals, and oral therapies vary by diagnosis. This site does not recommend a product by brand or
        replace a prescription plan. If symptoms are painful, rapidly worsening, or associated with fever, seek timely
        in-person care.
      </p>
      <h2 id="alongside-systemic-health" className={h2}>
        Whole-body health and blood tests
      </h2>
      <p className="leading-relaxed">
        Sometimes inflammatory scalp disease prompts broader review; other times it is local. For lab philosophy, see{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter
        </Link>
        .
      </p>
      <h2 id="when-urgent-care" className={h2}>
        When to seek urgent care
      </h2>
      <p className="leading-relaxed">
        Sudden painful patches, pus, spreading redness, or systemic illness warrant urgent medical assessment rather than
        self-management.
      </p>
    </div>
  );
}

export function BodyMinoxidilMechanism() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Minoxidil is a common topical treatment for some types of pattern hair loss, and occasionally for other diagnoses
        when a clinician directs it. It is not a miracle serum for everyone — irritation, shedding phases, and how long
        you need to wait all vary. This explainer covers the basics and timelines; it does not replace your prescriber’s
        instructions.
      </p>
      <h2 id="mechanism-overview" className={h2}>
        What minoxidil is trying to do
      </h2>
      <p className="leading-relaxed">
        Minoxidil’s hair effects relate to follicle biology and local blood flow signalling in ways that continue to be
        refined in research. The practical takeaway is simpler: it is a long-game therapy assessed over months, not
        weeks.
      </p>
      <h2 id="who-uses-it" className={h2}>
        Who might use it
      </h2>
      <p className="leading-relaxed">
        Many discussions centre on androgenetic patterning in men and women under medical guidance. Candidacy, strength,
        and formulation depend on diagnosis, scalp condition, pregnancy status, and tolerance.
      </p>
      <h2 id="timelines-shedding-phase" className={h2}>
        Early shedding (and why it happens)
      </h2>
      <p className="leading-relaxed">
        Some people notice increased shedding shortly after starting. That phenomenon is discussed clinically but should
        not be self-diagnosed. If shedding is severe or prolonged, your prescriber should review whether to continue,
        adjust, or investigate other causes such as{" "}
        <Link href={insight("telogen-effluvium-after-illness-or-stress")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium
        </Link>
        .
      </p>
      <h2 id="realistic-outcomes" className={h2}>
        What results usually look like
      </h2>
      <p className="leading-relaxed">
        Goals are often stabilisation first, then meaningful regrowth in responders. Complete restoration of prior density
        is not promised. Photography helps track change more reliably than daily hair counts.
      </p>
      <h2 id="adherence" className={h2}>
        Using it consistently and caring for your scalp
      </h2>
      <p className="leading-relaxed">
        Consistent application matters. Irritant or allergic reactions should be reported. If you have active scalp
        inflammation, addressing it may be part of making topical therapy tolerable — see{" "}
        <Link href={insight("scalp-inflammation-and-shedding")} className="font-medium text-medical underline-offset-2 hover:underline">
          scalp inflammation and shedding
        </Link>
        .
      </p>
      <h2 id="combination-context" className={h2}>
        Using it alongside other treatments
      </h2>
      <p className="leading-relaxed">
        Clinicians sometimes layer treatments in pattern loss. Oral options for men are discussed in{" "}
        <Link href={insight("finasteride-vs-saw-palmetto")} className="font-medium text-medical underline-offset-2 hover:underline">
          finasteride vs saw palmetto
        </Link>
        ; women’s oral therapies require specialist oversight — see{" "}
        <Link href={insight("oral-anti-androgens-in-women-specialist-led-context")} className="font-medium text-medical underline-offset-2 hover:underline">
          oral anti-androgens in women
        </Link>
        .
      </p>
      <h2 id="not-substitute-diagnosis" className={h2}>
        It does not replace a proper diagnosis
      </h2>
      <p className="leading-relaxed">
        Starting minoxidil without clarity on diagnosis can blur follow-up. If thinning is diffuse or atypical, medical
        assessment first usually serves you better than product-first shopping.
      </p>
    </div>
  );
}

export function BodyPostTransplantShockLoss() {
  return (
    <div className={wrap}>
      <p className={lead}>
        After a hair transplant, many people go through a phase where native or transplanted hairs shed — often called
        shock loss. Timing and how it looks depend on technique and how you heal. This article sets broad expectations;
        your surgical team is the one who should interpret what you are seeing.
      </p>
      <h2 id="shock-loss-what-it-is" className={h2}>
        What “shock loss” means
      </h2>
      <p className="leading-relaxed">
        Shock loss describes hair shedding in the surgical setting thought to relate to surgical stress on follicles and
        surrounding hairs. It is a descriptive term, not a single disease entity, and it does not describe every post-op
        change people notice.
      </p>
      <h2 id="typical-timing" className={h2}>
        Rough timing after surgery
      </h2>
      <p className="leading-relaxed">
        Shedding may appear in the weeks after procedure, with regrowth timelines measured in months. Exact patterns
        depend on graft type, density planning, medications, and healing — your clinic’s aftercare information is
        authoritative for your case.
      </p>
      <h2 id="different-graft-concerns" className={h2}>
        When something may be wrong
      </h2>
      <p className="leading-relaxed">
        Infection signs, unusual pain, expanding bald patches beyond discussed expectations, or distress should prompt
        contact with your surgical provider. This education page cannot triage post-op urgency.
      </p>
      <h2 id="communication-with-team" className={h2}>
        Staying in touch with your clinic
      </h2>
      <p className="leading-relaxed">
        Many clinics use scheduled reviews and photos. Aligning expectations before surgery reduces anxiety when
        temporary shedding appears. For ecosystem context on surgical pathways,{" "}
        <Link href={insight("hli-vs-hairaudit")} className="font-medium text-medical underline-offset-2 hover:underline">
          HLI vs HairAudit
        </Link>{" "}
        separates medical interpretation from surgical audit questions.
      </p>
      <h2 id="labs-systemic-health" className={h2}>
        General health and blood tests
      </h2>
      <p className="leading-relaxed">
        Pre- or post-operative optimisation sometimes includes nutrition or thyroid discussion when clinically relevant.
        That is not unique to transplant — see{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter
        </Link>{" "}
        and{" "}
        <Link href={insight("vitamin-d-b12-folate-what-labs-may-mean-for-hair")} className="font-medium text-medical underline-offset-2 hover:underline">
          micronutrient labs
        </Link>
        .
      </p>
      <h2 id="longitudinal-expectations" className={h2}>
        What density might look like long term
      </h2>
      <p className="leading-relaxed">
        Final cosmetic results take time. Native hair may still miniaturise if underlying pattern loss continues — a
        reason some plans combine surgery with medical therapy where appropriate.
      </p>
      <h2 id="emotional-expectations" className={h2}>
        The emotional side
      </h2>
      <p className="leading-relaxed">
        Surgery is a major decision. Temporary shedding can feel like failure even when it is within expected variation.
        If mood or anxiety spikes, tell your clinical team or seek mental health support alongside follow-up visits.
      </p>
    </div>
  );
}

export function BodyOralAntiandrogensWomen() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Some women discuss oral medicines such as spironolactone for pattern thinning — only with a specialist who can
        prescribe and monitor safely. This article explains why forum protocols are a bad idea, what safety themes come
        up, and how this lane differs from typical male-pattern drug conversations.
      </p>
      <h2 id="scope-specialist-led" className={h2}>
        Why a specialist is involved
      </h2>
      <p className="leading-relaxed">
        Drug choice, dosing, contraception requirements, and monitoring are not DIY decisions. Dermatology, endocrinology,
        or other qualified prescribers tailor plans to your history, fertility goals, and risk profile.
      </p>
      <h2 id="why-not-self-start" className={h2}>
        Why you should not self-start
      </h2>
      <p className="leading-relaxed">
        Teratogenicity risk, electrolyte shifts, liver monitoring, and drug interactions are real considerations for some
        agents. Online anecdotes do not replace individual risk assessment.
      </p>
      <h2 id="drug-classes-high-level" className={h2}>
        Types of medicines (high level only)
      </h2>
      <p className="leading-relaxed">
        Clinicians may discuss agents such as anti-androgens or other hormone modulators in selected female patients.
        Trial evidence, licensed indications, and guideline positions differ between drugs and jurisdictions; naming a
        specific drug here would read like indirect prescribing. Your clinician chooses based on evidence and regulation
        in your region.
      </p>
      <h2 id="monitoring-safety" className={h2}>
        Monitoring and safety
      </h2>
      <p className="leading-relaxed">
        Baseline and follow-up labs, blood pressure, and symptom review may be scheduled. Report pregnancy immediately if
        it occurs while on therapy — management is urgent and individualised.
      </p>
      <h2 id="fertility-pregnancy" className={h2}>
        Pregnancy and fertility
      </h2>
      <p className="leading-relaxed">
        Many regimens require reliable contraception. Planning conception may require structured medication holidays under
        supervision — never improvised from articles.
      </p>
      <h2 id="relation-pattern-hair-loss" className={h2}>
        How this ties to pattern hair loss
      </h2>
      <p className="leading-relaxed">
        For background on pattern thinning in women, read{" "}
        <Link href={insight("diffuse-thinning-in-women")} className="font-medium text-medical underline-offset-2 hover:underline">
          diffuse thinning in women
        </Link>{" "}
        and{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and pattern hair loss
        </Link>
        . Topical minoxidil context appears in{" "}
        <Link href={insight("minoxidil-mechanism-and-realistic-timelines")} className="font-medium text-medical underline-offset-2 hover:underline">
          minoxidil mechanism and timelines
        </Link>
        .
      </p>
      <h2 id="constructive-questions" className={h2}>
        Questions worth asking your doctor
      </h2>
      <p className="leading-relaxed">
        Ask about expected timeline, side effects to watch, what “success” means for you, and alternatives if therapy is
        unsuitable. Bring a full medication and supplement list.
      </p>
    </div>
  );
}

export function BodyRecedingHairlineVsMature() {
  const tableCell = "border border-[rgb(var(--border-soft))] px-3 py-2 align-top";
  return (
    <div className={wrap}>
      <p className={lead}>
        For many men, the first sign of a changing hairline triggers concern. Temples shift, the frontal edge moves, and the
        instinct is to search for answers — often landing on worst-case scenarios. But not every hairline change signals the
        beginning of male-pattern hair loss. Understanding the distinction between a mature hairline and a genuinely receding
        one is one of the most clinically important — and personally reassuring — pieces of information you can have. This
        guide walks through what a mature hairline actually looks like, how early recession typically differs, what
        clinicians examine, and when it makes sense to take action. It does not replace a professional assessment; it gives a
        clear framework so you can approach an appointment — or your own mirror — with confidence rather than anxiety.
      </p>
      <h2 id="why-this-question-comes-up-so-often" className={h2}>
        Why this question comes up so often
      </h2>
      <p className="leading-relaxed">
        The confusion between a mature hairline and a receding one is common. Hairline changes in young adult men tend to be
        gradual, subtle, and highly variable. There is rarely a single moment where a hairline visibly “flips” from normal to
        abnormal — so the transition, if there is one, is easy to misread in either direction.
      </p>
      <p className="leading-relaxed">
        Many men notice temple movement in their late teens or early twenties and assume balding has begun. Online forums can
        amplify anxiety, with classifications and transplant timelines circulating among young men who may simply be
        experiencing normal development. Conversely, some men dismiss genuine early recession as “just maturing,” which can
        delay evaluation during a window where treatment tends to be most effective.
      </p>
      <p className="leading-relaxed">
        The clinical reality is more nuanced. Some hairline movement is a normal part of male development. The adolescent
        hairline sits lower on the forehead and often rises slightly through the late teens and twenties — maturation, not
        loss. The challenge is identifying when that maturation has settled into a stable pattern versus when it represents
        the opening phase of androgenetic alopecia.
      </p>
      <h2 id="what-a-mature-hairline-usually-looks-like" className={h2}>
        What a mature hairline usually looks like
      </h2>
      <p className="leading-relaxed">
        A mature hairline is the natural repositioning of the frontal hairline as part of normal male development — not hair
        loss in the clinical sense. It is a transition from the lower, more uniform juvenile hairline to a slightly higher,
        often slightly more angular hairline that then remains stable for many years, or for life.
      </p>
      <p className="leading-relaxed">
        Movement with maturation is typically mild and relatively even across the frontal region. The temples may rise slightly
        or show gentle recession — often modest (roughly one to two centimetres from the juvenile position) and broadly
        symmetrical. Hair behind the frontal edge remains full. If you part the hair or look closely, density is preserved.
        There is no visible scalp showing through at the crown or mid-scalp in the way of progressive loss, and the frontal
        forelock remains intact and dense.
      </p>
      <p className="leading-relaxed">
        Another hallmark is stability. Once maturation has completed — often by the mid-twenties — the hairline does not keep
        moving. Men with a mature hairline can often compare photos from their mid-twenties with photos from their thirties or
        forties and see little meaningful change in frontal position or overall density. Individual hairs remain full in
        calibre and pigmentation, without the thin, wispy, shortened hairs that indicate miniaturisation.
      </p>
      <p className="leading-relaxed">
        A mature hairline can still look slightly different from a juvenile one — that is appropriate. The goal is not to
        preserve a teenage hairline indefinitely, but to understand whether what you see is a completed developmental change or
        an ongoing process of loss.
      </p>
      <h2 id="what-early-recession-usually-looks-like" className={h2}>
        What early recession usually looks like
      </h2>
      <p className="leading-relaxed">
        Early male-pattern hair loss (androgenetic alopecia) in its initial stages can be subtle. It rarely appears as
        dramatic overnight change. It often begins quietly at the temples, sometimes asymmetrically, and progresses at a rate
        that is hard to perceive month to month but clearer when comparing photographs a year or more apart.
      </p>
      <p className="leading-relaxed">
        Temple changes in early recession tend to be deeper than in simple maturation. Rather than a modest lift across the
        frontal hairline, the temples show more pronounced angular recession — sometimes an early M-shaped pattern. Over
        time, those recessions can extend inward and the central forelock may thin. Density at the frontal edges is often
        visibly reduced. Under good lighting or with dermatoscopy, hairs at the hairline may look finer, shorter, or lighter than
        those further back — a sign of miniaturisation.
      </p>
      <p className="leading-relaxed">
        Miniaturisation is one of the most diagnostically significant findings in early androgenetic alopecia. The follicle,
        under the influence of dihydrotestosterone (DHT), gradually produces thinner and shorter hairs with each growth cycle.
        These changes may not be obvious to the naked eye at first, but they represent an important biological shift.{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">Trichoscopy</span> (scalp surface imaging) can reveal
        miniaturisation early, which is why clinical assessment matters even when visible change seems limited.
      </p>
      <p className="leading-relaxed">
        Early recession does not always progress rapidly. Some men change slowly over many years; others faster. Rate varies
        with genetics, DHT sensitivity, and individual biology — part of why early assessment and monitoring can matter for men
        who want to preserve density.
      </p>
      <h2 id="what-clinicians-look-for-and-key-differences" className={h2}>
        What clinicians look for — and key differences at a glance
      </h2>
      <p className="leading-relaxed">
        Assessment is rarely a single snapshot. It combines examination, history, family background, and often scalp imaging.
        Pattern and symmetry matter: androgenetic alopecia tends to follow recognisable distributions (for example
        Norwood–Hamilton patterns). Family history is one of the strongest predictors — the condition is polygenic, so it can
        appear even when neither parent shows obvious loss, and it can vary between brothers. Speed of change matters: a
        hairline that has shifted significantly over twelve to eighteen months warrants more attention than one that has been
        stable. Older photographs help. Trichoscopy, where available, adds precision by showing hair calibre variability at
        the follicle level.
      </p>
      <p className="leading-relaxed">
        The table below summarises core differences; it is educational, not a substitute for an in-person diagnosis.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="bg-subtle">
              <th className={tableCell}>Feature</th>
              <th className={tableCell}>Mature hairline</th>
              <th className={tableCell}>Early recession (AGA)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tableCell}>Temple movement</td>
              <td className={tableCell}>Mild, even, symmetrical</td>
              <td className={tableCell}>Deeper, angular; often asymmetric early on</td>
            </tr>
            <tr>
              <td className={tableCell}>Rate of change</td>
              <td className={tableCell}>Settles by mid-twenties</td>
              <td className={tableCell}>Continues over months and years</td>
            </tr>
            <tr>
              <td className={tableCell}>Hair density behind the edge</td>
              <td className={tableCell}>Preserved</td>
              <td className={tableCell}>May show early reduction or see-through appearance</td>
            </tr>
            <tr>
              <td className={tableCell}>Miniaturised hairs</td>
              <td className={tableCell}>Not expected</td>
              <td className={tableCell}>Often present at hairline and temples</td>
            </tr>
            <tr>
              <td className={tableCell}>Crown or mid-scalp</td>
              <td className={tableCell}>Unaffected by pattern loss</td>
              <td className={tableCell}>May show early involvement</td>
            </tr>
            <tr>
              <td className={tableCell}>Frontal forelock</td>
              <td className={tableCell}>Dense and intact</td>
              <td className={tableCell}>May thin over time</td>
            </tr>
            <tr>
              <td className={tableCell}>Typical Norwood pattern</td>
              <td className={tableCell}>Often NW1–NW2, stable</td>
              <td className={tableCell}>NW2 progressing toward NW3 or beyond</td>
            </tr>
            <tr>
              <td className={tableCell}>Trichoscopy pattern</td>
              <td className={tableCell}>Uniform hair calibre</td>
              <td className={tableCell}>Calibre variability; vellus or intermediate hairs</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="leading-relaxed">
        If you are uncertain, a consultation with a dermatologist or trichologist is the most reliable next step.
      </p>
      <h2 id="when-it-is-worth-acting-early" className={h2}>
        When it is worth acting early
      </h2>
      <p className="leading-relaxed">
        Early action — when appropriate — is generally better than unnecessary delay.{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">
          Acting early does not mean rushing into treatment.
        </span>{" "}
        It means clarifying whether the pattern is stable maturation or active miniaturisation before deciding what, if
        anything, to do next. Treatments for androgenetic alopecia work best on follicles that are still active, even if
        miniaturised; once follicles have been dormant for a long time, restoring meaningful density becomes harder.
      </p>
      <p className="leading-relaxed">
        Patterns that should prompt a more active response than “wait and see” include: temple recession that deepens over six
        months or more (especially if photographs confirm it); crown thinning alongside frontal changes; loss of density in the
        frontal forelock; and changes that fit recognised androgenetic patterns with a relevant family history. Evidence-based
        options — including topical and oral minoxidil, finasteride, and combination approaches — have established profiles in
        appropriate candidates. A knowledgeable clinician can clarify what fits your pattern and what realistic expectations
        look like.
      </p>
      <h2 id="the-role-of-dht-and-genetics" className={h2}>
        The role of DHT and genetics
      </h2>
      <p className="leading-relaxed">
        Androgenetic alopecia is driven primarily by DHT, and whether it causes visible hair loss depends largely on genetics.
        In men with susceptible follicles, DHT gradually triggers miniaturisation over time, but sensitivity varies — which is
        why some men lose hair early, others much later, and some hardly at all. Because the condition is polygenic,
        inheritance is complex and family history on both sides matters.
      </p>
      <p className="leading-relaxed">
        That gradual, DHT-driven miniaturisation is part of why timing of intervention can matter. Treatments such as
        finasteride, dutasteride (where prescribed), and minoxidil are most effective when follicles are still responding well,
        before substantial miniaturisation has accumulated. For a deeper look at the biology of DHT and follicle
        miniaturisation, see our{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and pattern hair loss
        </Link>{" "}
        explainer — this section is a bridge, not a full mechanism chapter.
      </p>
      <h2 id="summary-and-next-steps" className={h2}>
        Summary and next steps
      </h2>
      <p className="leading-relaxed">
        Distinguishing a mature hairline from early recession is not always straightforward, but a useful rule is to watch
        change over time: stability is reassuring; continued progression deserves attention. If you are in your late teens or
        early twenties, document your hairline with photographs and observe over six to twelve months. If the hairline is
        stable, that is strongly reassuring. If it keeps shifting, or you notice crown or forelock thinning, a clinical review is
        sensible — not an overreaction.
      </p>
      <p className="leading-relaxed">
        If you are older and a previously stable hairline is changing, that pattern deserves clinical attention. Effective,
        evidence-based treatments exist. Starting earlier — before significant miniaturisation accumulates — offers the best
        foundation for preserving density. A conversation with a clinician is not a commitment to treatment; it is an
        opportunity to understand your situation and decide next steps.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Recommended further reading:</span>{" "}
        <Link href={PILLAR_GUIDE_HREF["male-pattern-hair-loss"]} className="font-medium text-medical underline-offset-2 hover:underline">
          Male pattern hair loss guide
        </Link>
        ;{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        ;{" "}
        <Link href={insight("minoxidil-mechanism-and-realistic-timelines")} className="font-medium text-medical underline-offset-2 hover:underline">
          Minoxidil: mechanism and realistic timelines
        </Link>
        .
      </p>
      <p className="leading-relaxed text-sm text-[rgb(var(--text-muted))]">
        This page is for education and does not replace personalised medical advice. For individual assessment, consult a
        qualified dermatologist or trichologist.
      </p>
    </div>
  );
}

export function BodyCrownThinningHarderToTreat() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Crown thinning is one of the most common concerns in male-pattern hair loss — yet it is often misunderstood. Unlike
        frontal recession, vertex thinning can develop quietly until a meaningful amount of density is already lost. That can
        fuel frustration, unrealistic expectations, and a sense that treatment is not working. This guide explains why crown
        thinning behaves as it does, why visible improvement may take longer than in other areas, and what evidence-based steps
        are most likely to help — without discouraging you from sustainable, realistic planning.
      </p>
      <h2 id="why-crown-thinning-is-often-noticed-late" className={h2}>
        Why crown thinning is often noticed late
      </h2>
      <p className="leading-relaxed">
        The crown is structurally hard to see without a second mirror, a phone at an angle, or someone else pointing it out.
        Routine grooming rarely includes a careful look at the top of the scalp. Without a baseline photo from a fixed angle,
        gradual change is difficult to judge. Lighting also changes the appearance dramatically: overhead light, bright sun, or
        some fluorescent settings can make thinning look worse than under softer, diffuse light — so a single photo in an
        unfamiliar environment can feel alarming.
      </p>
      <p className="leading-relaxed">
        The crown whorl creates a zone of naturally lower density even without hair loss, which can make early thinning hard
        to tell from normal anatomy. Many men either dismiss early change or become anxious about something not yet clinically
        significant. Professional assessment is often the most reliable way to separate the two. Many people do not notice
        meaningful crown thinning until overall density in the area has already reduced substantially; early photography and
        baseline review help.
      </p>
      <h2 id="why-crown-thinning-can-feel-harder-to-improve" className={h2}>
        Why crown thinning can feel harder to improve
      </h2>
      <p className="leading-relaxed">
        Even with consistent treatment, the crown can feel stubborn. That is not simply “product failure” — it reflects biology
        and perception. Because the crown is often noticed late, treatment may start when miniaturisation is more advanced than
        at the hairline. Follicles may still respond, but response can be slower and regrowth more modest.{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">
          Stabilising further loss is often the first meaningful achievable goal
        </span>{" "}
        in earlier treatment phases.
      </p>
      <p className="leading-relaxed">
        The whorl pattern makes density hard to judge: the same amount of hair can look denser or sparser depending on parting,
        styling, and viewing angle — so week-to-week fluctuation may reflect geometry, not true change. Photographic tracking
        from a fixed angle under consistent lighting is essential.
      </p>
      <p className="leading-relaxed">
        Miniaturisation (follicles shrinking under DHT) is reversible only in earlier stages; long-standing miniaturisation may
        have less capacity to return to full terminal production. Treatments such as minoxidil and finasteride can slow or halt
        further miniaturisation and may stimulate partial regrowth, but degree of response depends on how long follicles have
        been affected.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">
          Visible improvement at the crown often takes longer than people expect.
        </span>{" "}
        Hair cycles are long; regrowth from miniaturised follicles may start fine and unpigmented before thickening. Many
        people stop effective treatment between six and ten months, just before change would become visible — patience and
        objective photos matter.
      </p>
      <h2 id="what-usually-helps-most" className={h2}>
        What usually helps most
      </h2>
      <p className="leading-relaxed">
        A durable approach usually starts with clear goals in order. <span className="font-medium text-[rgb(var(--text-primary))]">Step 1: stabilise progression.</span> If thinning keeps advancing, any regrowth is offset by ongoing miniaturisation. Finasteride and minoxidil — alone or together — are among the most evidence-based tools for slowing or stopping androgenetic alopecia. For the crown,{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">
          preventing further loss is often the first meaningful win
        </span>
        , even before obvious regrowth.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Step 2: consistency over time.</span> Benefits tie to uninterrupted use where prescribed. Missing doses or long breaks allows DHT-related miniaturisation to resume. Many people see meaningful stabilisation within six months of consistent use, with visible density changes often emerging between twelve and eighteen months.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Step 3: realistic timelines.</span> Crown regrowth, when it occurs, is rarely dramatic; success may mean better coverage of the thinning area rather than full restoration of youthful density. Month-one versus month-twelve photos under consistent lighting beat day-to-day mirror checks. Progress that feels invisible can still be clinically meaningful.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Step 4: treat the broader pattern.</span> Crown thinning usually sits within a wider androgenetic pattern that may include the hairline and mid-scalp. Plans that ignore overall progression can mislead.
      </p>
      <h2 id="when-crown-thinning-suggests-broader-pattern-loss" className={h2}>
        When crown thinning suggests broader pattern loss
      </h2>
      <p className="leading-relaxed">
        Crown thinning is most often androgenetic alopecia. Mid-scalp thinning alongside the crown suggests loss is not focal.
        Frontal recession plus vertex loss fits mid-to-advanced grading patterns and usually implies a more progressive overall
        picture — relevant for medical treatment timing and whether surgery belongs in the conversation. Multi-zone thinning
        warrants coordinated planning rather than treating only the most obvious spot.
      </p>
      <h2 id="when-to-seek-professional-review" className={h2}>
        When to seek professional review
      </h2>
      <p className="leading-relaxed">
        Seek review if you are unsure whether thinning is real versus normal whorl variation — dermoscopy can distinguish calibre
        and miniaturisation from anatomy. If the crown is clearly worsening on photos over months, early intervention generally
        produces better outcomes than delay. If you want personalised options and timelines rather than generic online advice,
        a clinical visit helps. If you are considering surgery before medical stabilisation, review matters: the crown can be
        technically demanding; transplanting into an actively progressing pattern risks an unnatural long-term result without
        stabilisation first.
      </p>
      <h2 id="understanding-the-biology-dht-miniaturisation-and-the-crown" className={h2}>
        Understanding the biology: DHT, miniaturisation, and the crown
      </h2>
      <p className="leading-relaxed">
        Male-pattern loss is not usually about follicles vanishing overnight — follicles shrink and produce finer, shorter hairs
        until they may stop producing visible hair: miniaturisation, driven primarily by DHT. The crown is especially prone
        because vertex follicles often carry more androgen-sensitive signalling than the DHT-resistant occipital zone — one
        reason the vertex can thin earlier or more noticeably.
      </p>
      <p className="leading-relaxed">
        Miniaturisation is gradual and may be reversible in earlier stages, which is why earlier intervention can matter.
        Finasteride and minoxidil tend to work best when follicles are still present but miniaturised. For fuller detail, see{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>{" "}
        — this section is a trimmed bridge, not a duplicate explainer.
      </p>
      <h2 id="setting-realistic-expectations-framework-for-progress" className={h2}>
        Setting realistic expectations: a framework for progress
      </h2>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Months 0–3:</span> Establish treatment and tolerate
        adjustment. Visible change is often minimal; consistency is the goal. Some minoxidil users notice a temporary increase in
        shedding as cycles shift.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Months 3–6:</span> Shedding often settles. Crown density may
        still look unchanged on casual inspection, but baseline photos may show early fine changes. The milestone is often{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">
          absence of clear worsening — stabilisation is a genuine success
        </span>
        , even when it does not feel dramatic.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Months 6–12:</span> Responders may see finer hairs in
        thinned areas — not yet always cosmetically obvious. Photos beat mirrors for the crown.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Months 12–18+:</span> This is often when visible crown
        change becomes apparent for responders. Clinicians often reassess here.{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">
          Stabilisation without dramatic regrowth is still a clinically meaningful outcome
        </span>{" "}
        — it preserves options and allows time for treatment responses to mature.
      </p>
      <h2 id="next-steps-and-further-reading" className={h2}>
        Next steps and further reading
      </h2>
      <p className="leading-relaxed">
        Crown thinning is manageable with realistic planning. Useful steps include: confirming diagnosis and extent; using an
        evidence-based regimen with medical supervision where possible; taking baseline photos now; and setting a review
        around twelve months before assuming failure or jumping to aggressive interventions.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Further reading:</span>{" "}
        <Link href={PILLAR_GUIDE_HREF["male-pattern-hair-loss"]} className="font-medium text-medical underline-offset-2 hover:underline">
          Male pattern hair loss guide
        </Link>
        ;{" "}
        <Link href={insight("minoxidil-mechanism-and-realistic-timelines")} className="font-medium text-medical underline-offset-2 hover:underline">
          Minoxidil: how it works and realistic timelines
        </Link>
        ;{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        .
      </p>
      <p className="leading-relaxed text-sm text-[rgb(var(--text-muted))]">
        Educational information only; not a substitute for individual medical assessment.
      </p>
    </div>
  );
}
