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
        If you are losing hair, you may wonder which blood tests matter. Labs never diagnose hair loss by themselves —
        they help your doctor see whether iron, thyroid, inflammation, or other whole-body factors belong in the picture
        alongside your scalp exam, pattern of loss, and story over time. This guide lists themes doctors often discuss; it
        is not a list to self-order.
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
        Ferritin is a blood test that reflects how much iron your body has stored away — a bit like a reserve tank, not
        today’s fuel gauge in every situation. Doctors often mention it when hair is shedding, because low stores can
        matter for some people. It is still not a single-number verdict on your hair; it is one clue among many.
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
        change hair texture for some people. Hair can also thin when thyroid labs look fine, because diet, stress,
        medicines, and pattern hair loss often sit alongside thyroid issues. This article explains how doctors usually
        think it through — it does not replace your own visit.
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
        Why does common male- or female-pattern thinning run in families? For many people,{" "}
        <Link href={glossaryPath("dht")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT
        </Link>{" "}
        — a hormone cousin of testosterone — is part of how some follicles gradually miniaturise over time. Genetics
        decide who is more sensitive; DHT is not the only factor in every person’s story, but it helps explain a lot of
        pattern hair loss in plain terms.
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
        Trying to decide on injections for thinning hair? Platelet-rich plasma (PRP) uses concentrated platelets from
        your own blood; exosome products vary by clinic and what regulators allow where you live. Evidence, safety, and
        marketing are not the same for both. This page helps you compare ideas and questions — it does not pick a product
        or protocol for you, and a clear diagnosis still comes first.
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
        Saw palmetto extracts are marketed widely. Some small studies explore potential effects on androgen pathways; the
        hair-loss evidence base is limited compared with approved pharmacologic options. Product standardisation varies
        between brands, and interactions with other drugs are possible.
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
        Hair Longevity Institute (HLI) and HairAudit sit in the same Hair Intelligence network, but they answer different
        first questions. Use this page to match your worry — ongoing thinning and health versus transplant plans or
        surgical concerns — without mixing up what each path is for.
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
        Many new parents notice a lot more hair coming out a few months after birth. That often follows normal hair-cycle
        shifts — but postpartum life can also overlap with iron or thyroid issues. This guide separates “probably normal”
        from “worth a call,” without replacing your midwife, GP, or obstetric team.
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
        Hair falling out weeks or months after a fever, surgery, crash diet, or major stress? That delayed pattern has a
        name clinicians use — telogen effluvium — but you should not self-diagnose from shedding alone. This article
        explains the idea in patient language so you can ask your doctor sharper questions.
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
