import Link from "next/link";
import { PILLAR_GUIDE_HREF } from "@/lib/content/pillarGuides";

const insight = (slug: string) => `/insights/${slug}`;

const h2 = "scroll-mt-24 text-xl font-semibold text-[rgb(var(--text-primary))]";
const wrap = "editorial-prose space-y-6 text-[rgb(var(--text-secondary))]";
const lead = "text-base leading-relaxed text-[rgb(var(--text-primary))]";

export function BodyTrtCauseOrUnmask() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Many patients who notice hair thinning after starting testosterone replacement therapy (TRT) conclude that the treatment
        must be responsible. The timing seems to speak for itself. But the clinical picture is rarely that straightforward. The more
        precise question is whether TRT has{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">revealed or accelerated</span> an existing androgen-sensitive
        pattern, rather than creating one from nothing. Understanding this distinction matters for expectations and for decisions
        with your care team.
      </p>
      <p className="leading-relaxed">
        This article walks through the biology behind hair loss in the context of TRT, why susceptibility varies so widely between
        individuals, and a framework for discussing next steps with your prescriber. It does not replace an in-person diagnosis.
      </p>
      <h2 id="why-this-question-matters" className={h2}>
        Why this question matters
      </h2>
      <p className="leading-relaxed">
        Hair changes after starting TRT can feel sudden. When a major life change — such as beginning hormonal therapy — precedes a
        visible physical change, it is natural to draw a direct line between the two. That instinct is not wrong, but it is incomplete.
      </p>
      <p className="leading-relaxed">
        Timing alone can make TRT look like the sole cause when it may be only one factor among several. Androgenetic alopecia often
        begins years before it becomes obvious. Follicles may have been miniaturising quietly before TRT. Introducing exogenous
        testosterone does not necessarily start a new process — it may push an existing one past the threshold where it becomes visible.
      </p>
      <p className="leading-relaxed">
        Framing matters. If TRT is blamed and stopped without fuller assessment, meaningful quality-of-life benefits may be lost while
        an underlying predisposition continues. If the hormonal contribution is dismissed entirely, useful management options may be
        missed.{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">
          Susceptibility to androgen-related hair loss often matters more than the simple fact of being on TRT.
        </span>{" "}
        Two people on similar protocols can have very different scalp outcomes.
      </p>
      <h2 id="what-trt-changes-biologically" className={h2}>
        What TRT changes biologically
      </h2>
      <p className="leading-relaxed">
        TRT restores circulating testosterone toward a physiological range when endogenous production is insufficient. When
        testosterone rises, the androgen environment shifts. Testosterone has modest direct effects on follicles, but it is metabolised
        in peripheral tissues into dihydrotestosterone (DHT) by 5-alpha reductase. DHT is more potent at the androgen receptor and is
        the primary androgen implicated in androgenetic alopecia.
      </p>
      <p className="leading-relaxed">
        In androgen-sensitive follicles — largely determined by genetics — DHT binding shortens the growth (anagen) phase, prolongs
        resting (telogen) phases, and progressively shrinks follicles over cycles (miniaturisation). TRT increases the substrate from
        which DHT is produced, which can intensify that process in men whose follicles are already primed to respond.
      </p>
      <p className="leading-relaxed">
        Not all follicles respond equally. Occipital follicles are largely DHT-resistant; hairline and crown follicles are more
        susceptible. TRT does not invent regional sensitivity — it works within the architecture genetics already established.
      </p>
      <h2 id="why-trt-does-not-affect-everyone-equally" className={h2}>
        Why TRT does not affect everyone equally
      </h2>
      <p className="leading-relaxed">
        Two men on similar doses with similar serum levels can have completely different scalp outcomes. That reflects biology, not
        mystery.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Genetic predisposition.</span> Androgenetic alopecia is highly
        heritable. Androgen receptor signalling influences follicular sensitivity to DHT. Family history — including on the maternal
        line — is informative.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Follicular sensitivity.</span> Receptor density and activity vary.
        Some follicles need little DHT stimulation to miniaturise; others tolerate more exposure with less visible change.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Age and baseline.</span> Starting TRT at 55 with a slowly
        receding hairline for two decades is a different context than starting at 30 with no family history of loss.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Pre-existing miniaturisation.</span> Dermoscopy sometimes shows
        miniaturisation before it is obvious cosmetically. Therapy may cross a threshold that makes silent pathology visible — which
        can feel like TRT “caused” something already under way.
      </p>
      <h2 id="cause-versus-unmasking" className={h2}>
        Cause versus unmasking: a critical distinction
      </h2>
      <p className="leading-relaxed">
        Calling TRT the direct “cause” implies someone without predisposition could develop androgenetic alopecia purely from therapy.
        Evidence does not support that framing for most people. What TRT can do is{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">accelerate a predisposition</span> or reveal subclinical
        miniaturisation before you would have noticed it otherwise.
      </p>
      <p className="leading-relaxed">
        A slow leak hidden in a wall may only become visible after renovation exposes it — the renovation did not create the leak.
        Likewise, follicles were already responding to DHT from endogenous production; optimising testosterone can increase DHT
        availability and accelerate a process to visibility. The change can look abrupt because timing is now obvious and linked to a
        clinical event.
      </p>
      <p className="leading-relaxed">
        That does not minimise the hormonal contribution. If TRT meaningfully accelerates a process that might otherwise have taken
        years to show, that is clinically relevant — and worth discussing with your prescriber. The goal is accurate location of the
        concern so the response is proportionate.
      </p>
      <h2 id="what-clinicians-look-at" className={h2}>
        What clinicians look at
      </h2>
      <p className="leading-relaxed">
        Assessment goes beyond one lab line. Useful inputs include: detailed{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">family history</span>;{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">pattern</span> (temples, crown, diffuse versus focal — distinct from
        telogen effluvium or alopecia areata in many cases);{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">timing</span> relative to TRT start and dose changes; other
        androgen exposures (supplements, other medications); and whether the presentation actually matches androgenetic alopecia
        versus thyroid disease, iron deficiency, illness-related shedding, or overlap. Sudden diffuse shedding after stress or illness
        follows different reasoning — see{" "}
        <Link href={insight("telogen-effluvium-after-illness-or-stress")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium after illness or stress
        </Link>{" "}
        if that story fits better.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Look at the pattern, not just hormone numbers.</span> Serum
        testosterone or DHT does not fully describe follicle-level sensitivity, receptor density, or stage of miniaturisation. For when
        blood tests belong in hair concerns more generally, see{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter for hair loss
        </Link>
        . TRT monitoring itself follows your clinician’s protocol.
      </p>
      <h2 id="what-to-do-next-with-your-prescriber" className={h2}>
        What to do next — with your prescriber
      </h2>
      <p className="leading-relaxed">
        Resist reducing the situation to a single variable. Stopping TRT abruptly without discussion may remove benefits while doing
        little to change underlying androgen-sensitive loss if a genetic predisposition is present.
      </p>
      <p className="leading-relaxed">
        A productive step is an open conversation: family history of hair loss, when you noticed change, how you would describe the
        pattern, and how important retention is relative to other TRT goals. Priorities are personal; a good prescriber helps weigh them
        honestly.
      </p>
      <p className="leading-relaxed">
        Pathways discussed in practice can include topical minoxidil; 5-alpha-reductase inhibitors such as finasteride or dutasteride
        where appropriate (with their own risk discussions); and other options — always individualised. None of these choices should be
        DIY, and none are all-or-nothing versus TRT by default.
      </p>
      <p className="leading-relaxed">
        If you are early in noticing change, baseline photos or documented follow-up (including dermoscopy when available) grounds the
        conversation. Subjective impressions mislead in both directions.
      </p>
      <h2 id="takeaways-and-where-to-read-next" className={h2}>
        Takeaways and where to read next
      </h2>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Unmasking, not creating.</span> In most cases TRT reveals or
        accelerates predisposition rather than inventing a new disease process.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Genetics are central.</span> Follicular sensitivity is largely
        inherited; family history often predicts risk more than any single lab.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Variation is real.</span> Identical protocols, different scalps —
        biology drives response.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Pattern over numbers.</span> Distribution and character of
        change carry diagnostic weight alongside labs.
      </p>
      <p className="leading-relaxed">
        For readable pattern biology without turning this page into a full DHT textbook, see{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        . For normal serum testosterone alongside thinning, see{" "}
        <Link href={insight("normal-testosterone-and-androgen-sensitive-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          normal testosterone and androgen-sensitive hair loss
        </Link>
        . The broader hormone map lives in the{" "}
        <Link href={PILLAR_GUIDE_HREF["androgen-index"]} className="font-medium text-medical underline-offset-2 hover:underline">
          androgen index guide
        </Link>
        .
      </p>
      <p className="leading-relaxed text-sm text-[rgb(var(--text-muted))]">
        Educational information only; not a substitute for personalised medical advice.
      </p>
    </div>
  );
}

export function BodyNormalTestosteroneAndrogenSensitive() {
  return (
    <div className={wrap}>
      <p className={lead}>
        The short answer is yes — hair loss can be androgen-sensitive even when testosterone looks “normal” on routine panels. That
        mismatch is one of the most common sources of confusion. A reassuring lab value can create false certainty and delay diagnosis
        or early intervention.
      </p>
      <p className="leading-relaxed">
        This article explains why serum testosterone is incomplete, why pattern and timing carry weight, and what a fuller assessment
        can include — without duplicating our full blood-test list (see{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter for hair loss
        </Link>
        ).
      </p>
      <h2 id="why-normal-testosterone-does-not-rule-it-out" className={h2}>
        Why normal testosterone does not rule it out
      </h2>
      <p className="leading-relaxed">
        It is natural to think “hormones are fine” when total testosterone sits in the reference range. That misses how follicles work.
        The relationship is not only about how much testosterone circulates — it is about{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">how sensitive follicles are</span> to signalling, regardless of the
        number on the form.
      </p>
      <p className="leading-relaxed">
        Follicles express androgen receptors; density and sensitivity vary by person and scalp region. A frontal or crown follicle with
        high receptor density can respond strongly even when serum testosterone is mid-range. That sensitivity is genetic and not
        captured by a standard panel.
      </p>
      <p className="leading-relaxed">
        Serum testosterone is one point in a cascade. Locally, 5-alpha reductase converts testosterone to DHT, which binds receptors
        with greater affinity. Efficiency of that conversion — not the starting level alone — shapes the signal at the follicle. Normal
        total testosterone can still coexist with elevated local DHT effect in susceptible regions.
      </p>
      <p className="leading-relaxed">
        Blood tests reflect systemic circulation, not intrafollicular biology — where sensitivity actually matters. Free versus bound
        testosterone also differs: SHBG and albumin binding change bioavailable fractions, so two people with identical totals can differ
        meaningfully in what tissues “see.”
      </p>
      <h2 id="why-pattern-matters-more-than-one-number" className={h2}>
        Why pattern matters more than one number
      </h2>
      <p className="leading-relaxed">
        Pattern recognition is often the most reliable tool for androgen-sensitive loss — frequently more informative than a single
        laboratory value. Location, shape, and progression convey what serum results cannot. Major classification systems are built
        around pattern, not a hormone line item.
      </p>
      <p className="leading-relaxed">
        In men, Norwood–Hamilton-type progression (temples, vertex, convergence) reflects differential sensitivity across the scalp
        versus the stable occipital fringe. When that distribution is present, it is strong clinical evidence of androgenetic alopecia
        regardless of testosterone printout.
      </p>
      <p className="leading-relaxed">
        In women, Ludwig-type central thinning (widening part, crown-predominant loss, often preserved frontal hairline) is equally
        recognisable. Patterns may overlap with male-type features in some cases. A normal hormone panel does not erase a convincing
        clinical pattern.
      </p>
      <p className="leading-relaxed">
        Dermoscopy adds precision: diameter variability, vellus or miniaturised hairs in characteristic zones — direct evidence at the
        follicle level, sometimes when labs are unremarkable.
      </p>
      <h2 id="how-this-misunderstanding-delays-action" className={h2}>
        How this misunderstanding delays action
      </h2>
      <p className="leading-relaxed">
        Assuming “normal testosterone means hormones are irrelevant” delays diagnosis and treatment. Follicles do not regenerate once
        lost; miniaturisation is gradual and, for a period, interruptible. Early miniaturisation often responds better than long-standing
        change.
      </p>
      <p className="leading-relaxed">
        After a normal result, patients may disengage — attributing loss to stress, diet, or ageing — or clinicians less familiar with
        follicular biology may reinforce that stop. The result is a missed window. A reassuring lab is one data point, not a verdict when
        pattern, family history, and scalp exam say otherwise.
      </p>
      <h2 id="men-and-women-can-both-be-affected" className={h2}>
        Men and women can both be affected
      </h2>
      <p className="leading-relaxed">
        Female-pattern thinning is common and often occurs without dramatically elevated androgens on routine tests. Follicles can
        respond to circulating levels that are normal for that person but sufficient to drive miniaturisation when genetics load the dice.
      </p>
      <p className="leading-relaxed">
        Post-menopausally, shifting oestrogen–androgen balance can unmask or accelerate thinning. Some women need broader endocrine
        workup (e.g. PCOS signs); many do not — and androgenetic alopecia remains a valid clinical diagnosis without a “high T” result. For
        wider women’s thinning context see{" "}
        <Link href={insight("diffuse-thinning-in-women")} className="font-medium text-medical underline-offset-2 hover:underline">
          diffuse thinning in women
        </Link>
        .
      </p>
      <h2 id="what-a-better-assessment-looks-like" className={h2}>
        What a better assessment looks like
      </h2>
      <p className="leading-relaxed">
        Good evaluation integrates history (onset, pace, triggers, family on both sides), pattern examination (hairline, crown, occiput,
        inflammation or scarring cues), selective labs when they change management — not reflex mega-panels — and dermoscopy when
        available. Gradual progressive thinning over years suggests androgenetic alopecia; abrupt shedding may point toward telogen
        effluvium or other drivers.
      </p>
      <p className="leading-relaxed">
        In women with rapid progression or hyperandrogenism signs, targeted testing may include testosterone, SHBG, DHEA-S, thyroid,
        iron — chosen by clinical reasoning. The breadth of “who gets which test” stays in our dedicated blood-test article so this page
        stays focused on serum-versus-sensitivity framing.
      </p>
      <h2 id="the-role-of-dht-and-local-conversion" className={h2}>
        The role of DHT and local conversion
      </h2>
      <p className="leading-relaxed">
        The molecule that drives miniaturisation in this pathway is primarily DHT, produced locally by 5-alpha reductase — types I and
        II, with type II especially relevant in scalp follicles (the target of finasteride; dutasteride inhibits both). That is why
        treatments can modify scalp biology without “fixing” a testosterone number on a lab slip.
      </p>
      <p className="leading-relaxed">
        Serum DHT is not routinely measured for hair diagnosis: intrafollicular activity is what matters, and blood levels do not always
        mirror it. The clinical pattern often tells the story more clearly than a single figure. For pathway depth see{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        ; for medication class context (not personal dosing) see{" "}
        <Link href={insight("finasteride-vs-saw-palmetto")} className="font-medium text-medical underline-offset-2 hover:underline">
          finasteride versus saw palmetto
        </Link>
        .
      </p>
      <h2 id="takeaways-and-further-reading" className={h2}>
        Takeaways and further reading
      </h2>
      <p className="leading-relaxed">
        Normal testosterone is not the final word; pattern, family history, and scalp findings can outweigh one line on a form. Early,
        timely workup preserves more options. Women are affected too — often with normal androgen panels. Integrated assessment beats
        any single component, especially a single number.
      </p>
      <p className="leading-relaxed">
        Continue with the{" "}
        <Link href={PILLAR_GUIDE_HREF["androgen-index"]} className="font-medium text-medical underline-offset-2 hover:underline">
          androgen index guide
        </Link>
        ,{" "}
        <Link href={insight("does-trt-cause-hair-loss-or-unmask-it")} className="font-medium text-medical underline-offset-2 hover:underline">
          TRT and hair loss: cause versus unmasking
        </Link>
        , and{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter for hair loss
        </Link>
        .
      </p>
      <p className="leading-relaxed text-sm text-[rgb(var(--text-muted))]">
        Educational information only; not a substitute for personalised medical advice.
      </p>
    </div>
  );
}

export function BodyOralVsTopicalMinoxidil() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Minoxidil is established in hair-loss care, but it comes in two very different forms: topical (solution or foam on the scalp)
        and low-dose oral tablets. Patients and clinicians are increasingly asked to weigh them. The decision depends on diagnosis,
        medical history, scalp sensitivity, lifestyle, and whether systemic treatment is appropriate — not on which route sounds
        “stronger” in the abstract.
      </p>
      <p className="leading-relaxed">
        This article compares routes at a practical level. For mechanism, early shedding, and month-by-month expectations, see{" "}
        <Link href={insight("minoxidil-mechanism-and-realistic-timelines")} className="font-medium text-medical underline-offset-2 hover:underline">
          minoxidil mechanism and realistic timelines
        </Link>{" "}
        — kept separate so this page stays route-focused.
      </p>
      <h2 id="what-both-forms-are-trying-to-do" className={h2}>
        What both forms are trying to do
      </h2>
      <p className="leading-relaxed">
        Both oral and topical minoxidil address pattern hair loss (most often androgenetic alopecia). They share the same active
        compound and usually sit inside a broader plan that may include other therapies or behaviour changes.
      </p>
      <p className="leading-relaxed">
        The goal is to support follicular activity and slow progression of pattern loss. Neither route is a permanent cure; sustained use
        is typically needed, and stopping either is generally associated with return toward the prior pattern over time. What differs is
        how drug reaches the body, tolerability, adherence, and monitoring — not a simple potency label.
      </p>
      <h2 id="topical-minoxidil-in-practice" className={h2}>
        Topical minoxidil in practice
      </h2>
      <p className="leading-relaxed">
        Topical minoxidil is applied directly to the scalp, often once or twice daily. Common concentrations are 2% and 5%, in liquid or
        foam; foam is often preferred when liquids feel greasy or disrupt styling, though experience varies.
      </p>
      <p className="leading-relaxed">
        The practical challenge is adherence — parting hair, spreading product, drying time, travel. Long-term adherence to topical
        regimens often declines. Scalp tolerability matters too: contact dermatitis, dryness, folliculitis; propylene glycol in some
        liquids drives irritation for some patients, and vehicle changes may help.
      </p>
      <p className="leading-relaxed">
        Systemic absorption occurs with topical use, usually at lower levels than oral dosing — but topical is not automatically “free” of
        systemic considerations; unexpected symptoms still deserve clinician review.
      </p>
      <h2 id="oral-minoxidil-in-practice" className={h2}>
        Oral minoxidil in practice
      </h2>
      <p className="leading-relaxed">
        For hair loss, oral minoxidil is typically prescribed at low doses compared with historic hypertension dosing — a range may be
        used depending on sex, weight, cardiovascular profile, and judgement. Use is often off-label; regulation varies by region.
      </p>
      <p className="leading-relaxed">
        A tablet once daily removes scalp application burden — meaningful for poor topical adherence, scalp conditions complicating
        application, or diffuse patterns where topical logistics are hard. Systemically, minoxidil is a vasodilator: fluid retention, edema,
        hypertrichosis beyond the scalp, and cardiovascular effects are possible; baseline assessment and monitoring are part of
        responsible prescribing — not DIY internet dosing.
      </p>
      <h2 id="who-may-lean-toward-one-route-or-the-other" className={h2}>
        Who may lean toward one route or the other
      </h2>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Toward topical:</span> preference to minimise systemic exposure
        where topical is tolerated; cardiovascular or other contraindications to oral therapy; good response and adherence on topical;
        more localised loss where application is feasible.
      </p>
      <p className="leading-relaxed">
        <span className="font-medium text-[rgb(var(--text-primary))]">Toward oral (supervised):</span> chronic irritation despite vehicle
        changes; documented poor topical adherence; diffuse thinning where application is impractical; no contraindication after
        cardiovascular review. Some patients are never suitable candidates for oral therapy — significant cardiac disease, certain
        arrhythmias, or other vasodilator-sensitive conditions — that call belongs to your clinician with full history.
      </p>
      <h2 id="what-not-to-compare-too-simplistically" className={h2}>
        What not to compare too simplistically
      </h2>
      <p className="leading-relaxed">
        Oral minoxidil is not simply a “stronger topical.” Efficacy comparisons are complicated by different populations, doses, and
        outcomes in studies; head-to-head data are limited. Both routes can help appropriate patients; the question is suitability and
        safety, not a hierarchy of potency.
      </p>
      <p className="leading-relaxed">
        Oral tablets are not automatically “easier” — systemic therapy needs assessment and monitoring. Route should follow diagnosis
        and risk context, not trend alone. If topical works and is tolerated, there is usually no clinical reason to switch without a
        specific rationale.
      </p>
      <h2 id="monitoring-safety-and-side-effects" className={h2}>
        Monitoring, safety, and side effects
      </h2>
      <p className="leading-relaxed">
        Topical monitoring is often modest for healthy adults: follow response and tolerability; report dizziness, chest discomfort, or
        swelling. Oral therapy typically involves more structured baseline cardiovascular review and follow-up around initiation and dose
        changes — your prescriber sets the plan.
      </p>
      <p className="leading-relaxed">
        Scalp irritation (often vehicle-related), fluid retention and peripheral edema (more oral), hypertrichosis (more oral), and
        cardiovascular effects from vasodilation are among themes to discuss. Chest pain, severe shortness of breath, rapid heartbeat, or
        sudden swelling need urgent care; do not stop prescribed medicines abruptly without advice.
      </p>
      <h2 id="next-steps-and-further-reading" className={h2}>
        Next steps and further reading
      </h2>
      <p className="leading-relaxed">
        Choose routes with your prescriber after a full history — not from forums. If you are doing well on topical, change only for a
        clinical reason. If adherence or tolerability fails, ask what supervised options fit.
      </p>
      <p className="leading-relaxed">
        Read next:{" "}
        <Link href={insight("minoxidil-mechanism-and-realistic-timelines")} className="font-medium text-medical underline-offset-2 hover:underline">
          minoxidil mechanism and realistic timelines
        </Link>
        ,{" "}
        <Link href={PILLAR_GUIDE_HREF["hair-loss-medications"]} className="font-medium text-medical underline-offset-2 hover:underline">
          hair loss medications guide
        </Link>
        ,{" "}
        <Link href={PILLAR_GUIDE_HREF["male-pattern-hair-loss"]} className="font-medium text-medical underline-offset-2 hover:underline">
          male pattern hair loss guide
        </Link>
        .
      </p>
      <p className="leading-relaxed text-sm text-[rgb(var(--text-muted))]">
        Educational information only; not a substitute for personalised medical advice.
      </p>
    </div>
  );
}

export function BodyDutasterideHairLossConversation() {
  return (
    <div className={wrap}>
      <p className={lead}>
        Dutasteride sometimes surfaces in hair-loss discussions when people want a more advanced approach to androgen-sensitive loss.
        It is not a default first-line option for everyone. Its place requires diagnosis, appropriate oversight, and realistic expectations
        — not forum-driven substitution.
      </p>
      <p className="leading-relaxed">
        This page explains when the name comes up, what patients often misunderstand, and how to discuss it with a specialist. It is
        not a prescribing guide. Finasteride class context (high level) lives in{" "}
        <Link href={insight("finasteride-vs-saw-palmetto")} className="font-medium text-medical underline-offset-2 hover:underline">
          finasteride versus saw palmetto
        </Link>
        ; DHT biology in{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        .
      </p>
      <h2 id="where-dutasteride-sits-in-the-discussion" className={h2}>
        Where dutasteride sits in the discussion
      </h2>
      <p className="leading-relaxed">
        Dutasteride usually does not appear at the very start of care. Clinicians typically review history, pattern, progression, simpler
        options, and adherence before advanced androgen-pathway discussions. When it arises, it is often because loss appears
        established, progression continues, or established therapies have not met goals after a fair trial — not because of impatience
        alone.
      </p>
      <p className="leading-relaxed">
        Dutasteride is not a casual “upgrade.” Its pharmacology differs from other options; benefits and trade-offs are distinct. The
        conversation should be diagnosis-led, legally supervised, and grounded in your full medical picture — not self-directed sourcing.
      </p>
      <h2 id="when-dutasteride-may-come-up" className={h2}>
        When dutasteride may come up
      </h2>
      <p className="leading-relaxed">
        Situations where it may be discussed (none automatic): patterned loss that keeps progressing; prior serious trials of established
        options with honest evaluation; a global picture — severity, pace, family history — suggesting strong androgen-pathway
        involvement. Early or uncertain diagnosis, skipped baseline treatments, or non-androgen-predominant hair disorders are settings
        where jumping to dutasteride is usually premature.
      </p>
      <h2 id="what-patients-often-misunderstand" className={h2}>
        What patients often misunderstand
      </h2>
      <p className="leading-relaxed">
        “Stronger” is not the same as “better” or “right for me.” Potency without suitability can mean unnecessary risk. Escalation without
        rationale is an impulse, not a strategy — clinicians should push back when escalation is unwarranted.
      </p>
      <p className="leading-relaxed">
        Timelines matter: androgen-pathway treatments work on slow hair-cycle scales. Expecting dramatic visible change in a few months
        confuses slow biology with treatment failure. Dutasteride is judged over meaningful intervals with agreed criteria — not week-by-
        week rumination.
      </p>
      <h2 id="how-dutasteride-fits-into-broader-planning" className={h2}>
        How dutasteride fits into broader planning
      </h2>
      <p className="leading-relaxed">
        Hair loss care is rarely single-pill. Stabilisation is often the first honest goal. Consistent use, periodic review, and long-term
        perspective beat chasing quick wins. Medication sits alongside health, nutrition, stress, and scalp factors — integrated plans
        outperform fixation on one molecule.
      </p>
      <p className="leading-relaxed">
        If dutasteride is discussed and the conclusion is not to proceed, that can still be a success — informed, considered reasoning is
        the point.
      </p>
      <h2 id="questions-worth-asking-your-clinician" className={h2}>
        Questions worth asking your clinician
      </h2>
      <p className="leading-relaxed">
        Useful questions include: why this option for{" "}
        <span className="font-medium text-[rgb(var(--text-primary))]">your</span> situation; whether the aim is stabilisation, regrowth, or
        slowing loss; what alternatives exist; how success will be judged over time and when review happens. Engagement is not distrust —
        good clinicians welcome it.
      </p>
      <h2 id="expectations-patience-and-honest-outcomes" className={h2}>
        Expectations, patience, and honest outcomes
      </h2>
      <p className="leading-relaxed">
        Hair loss is distressing; urgency is understandable. Honest framing of timelines and what “improvement” can mean — stabilisation
        versus regrowth — is part of good care. Not everyone who discusses dutasteride will use it; the value is quality of reasoning.
      </p>
      <h2 id="takeaways-and-best-next-reads" className={h2}>
        Takeaways and best next reads
      </h2>
      <p className="leading-relaxed">
        Start from diagnosis; context determines relevance; stronger is not the same as better; plan for the long term; ask questions and
        expect clear answers.
      </p>
      <p className="leading-relaxed">
        Continue with{" "}
        <Link href={PILLAR_GUIDE_HREF["hair-loss-medications"]} className="font-medium text-medical underline-offset-2 hover:underline">
          hair loss medications guide
        </Link>
        ,{" "}
        <Link href={insight("oral-minoxidil-vs-topical-minoxidil")} className="font-medium text-medical underline-offset-2 hover:underline">
          oral versus topical minoxidil
        </Link>
        , and{" "}
        <Link href={insight("dht-and-androgenetic-alopecia")} className="font-medium text-medical underline-offset-2 hover:underline">
          DHT and androgenetic alopecia
        </Link>
        .
      </p>
      <p className="leading-relaxed text-sm text-[rgb(var(--text-muted))]">
        Educational information only; not a substitute for personalised medical advice.
      </p>
    </div>
  );
}

export function BodyPostpartumVsFemalePattern() {
  const tableCell = "border border-[rgb(var(--border-soft))] px-3 py-2 align-top text-left";
  return (
    <div className={wrap}>
      <p className={lead}>
        Postpartum shedding is common, and for many people it resolves over months. Not every story is that straightforward. Some
        shedding lasts longer than expected, or uncovers thinning that looks different from diffuse telogen loss. Understanding
        postpartum telogen shedding versus female-pattern thinning — and when they overlap — helps you seek the right support.
      </p>
      <p className="leading-relaxed">
        This article contrasts typical postpartum shedding with features that may suggest androgenetic (female-pattern) thinning, for
        discussion with your clinician — not self-diagnosis from one heavy-shed week.
      </p>
      <h2 id="what-postpartum-shedding-usually-looks-like" className={h2}>
        What postpartum shedding usually looks like
      </h2>
      <p className="leading-relaxed">
        Postpartum shedding is telogen effluvium: pregnancy hormones prolong anagen; after delivery, levels fall and many follicles
        enter shedding together — a delayed catch-up. Onset is often roughly six weeks to four months after birth, with peak shedding
        around three to four months common.
      </p>
      <p className="leading-relaxed">
        The pattern is typically diffuse — hair coming from all over the scalp rather than only the part or crown. In uncomplicated
        cases, shedding slows, regrowth begins within months, and by about twelve months many people see meaningful recovery with
        short new hairs visible at the hairline and surface.
      </p>
      <h2 id="what-female-pattern-thinning-usually-looks-like" className={h2}>
        What female-pattern thinning usually looks like
      </h2>
      <p className="leading-relaxed">
        Female-pattern hair loss (androgenetic alopecia in women) is different: progressive miniaturisation of follicles — terminal hairs
        gradually replaced by finer vellus hairs — without necessarily one dramatic “shedding event.”
      </p>
      <p className="leading-relaxed">
        Distribution matters: central scalp, part line, crown, often frontal zone behind a usually preserved hairline. A widening part is
        a frequent early sign. The course is gradual; spontaneous full reversal without treatment is uncommon — unlike typical
        uncomplicated postpartum telogen recovery.
      </p>
      <h2 id="when-the-line-between-them-blurs" className={h2}>
        When the line between them blurs
      </h2>
      <p className="leading-relaxed">
        Postpartum change can unmask underlying pattern risk: hormones do not “cause” female-pattern thinning, but the transition may
        surface genetics earlier. Mixed pictures happen — initial diffuse shed, then incomplete recovery or focal thinning along the part
        or crown that no longer looks purely diffuse.
      </p>
      <p className="leading-relaxed">
        Iron deficiency (common postpartum), thyroid dysfunction, contraception changes, and sleep or nutrition stress can overlap.
        Complex cases rarely reduce to one label without examination.
      </p>
      <h2 id="comparing-the-two-at-a-glance" className={h2}>
        Comparing the two at a glance
      </h2>
      <p className="leading-relaxed">
        The table below summarises common distinctions; mixed presentations exist, and your clinician integrates history and exam.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="bg-subtle">
              <th className={tableCell}>Feature</th>
              <th className={tableCell}>Postpartum shedding (telogen effluvium)</th>
              <th className={tableCell}>Female-pattern thinning (androgenetic alopecia)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tableCell}>Distribution</td>
              <td className={tableCell}>Diffuse, fairly even</td>
              <td className={tableCell}>Central, crown, part-predominant</td>
            </tr>
            <tr>
              <td className={tableCell}>Onset pattern</td>
              <td className={tableCell}>Often noticeable shed phase after birth</td>
              <td className={tableCell}>Gradual density change over time</td>
            </tr>
            <tr>
              <td className={tableCell}>Part line</td>
              <td className={tableCell}>Often minimally changed versus baseline</td>
              <td className={tableCell}>Widening is a classic early clue</td>
            </tr>
            <tr>
              <td className={tableCell}>Recovery</td>
              <td className={tableCell}>Often self-limited within months in uncomplicated cases</td>
              <td className={tableCell}>Does not typically resolve fully without treatment</td>
            </tr>
            <tr>
              <td className={tableCell}>Family history</td>
              <td className={tableCell}>Helpful context, not required for TE</td>
              <td className={tableCell}>Often informative for pattern risk</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="when-to-reassess-instead-of-only-reassure" className={h2}>
        When to reassess instead of only reassure
      </h2>
      <p className="leading-relaxed">
        Reassurance fits classic uncomplicated telogen: diffuse loss, plausible timing, no focal pattern. But reassurance alone is wrong
        when: shedding has not slowed by ~six months, density is not recovering by nine to twelve months, thinning looks focal along
        the part or crown, or strong family pattern raises prior probability. Symptoms suggesting iron or thyroid issues deserve targeted
        testing — see{" "}
        <Link href={insight("postpartum-shedding-when-to-reassure-vs-when-to-test")} className="font-medium text-medical underline-offset-2 hover:underline">
          postpartum shedding: when to reassure versus when to test
        </Link>
        .
      </p>
      <h2 id="what-next-steps-may-look-like" className={h2}>
        What next steps may look like
      </h2>
      <p className="leading-relaxed">
        Next steps stay diagnosis-first: distribution, hair calibre, timeline since delivery, evolution. Selective labs (e.g. ferritin,
        TSH) when features warrant — not reflex huge panels. Plans may include monitoring, nutrition correction, topical therapies, or
        other options matched to diagnosis. For general lab framing see{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter for hair loss
        </Link>
        ; broader women’s thinning in{" "}
        <Link href={insight("diffuse-thinning-in-women")} className="font-medium text-medical underline-offset-2 hover:underline">
          diffuse thinning in women
        </Link>
        .
      </p>
      <h2 id="emotional-context-and-clinical-clarity" className={h2}>
        Emotional context and clinical clarity
      </h2>
      <p className="leading-relaxed">
        Postpartum life is demanding; hair changes can weigh heavily. Normalising distress without dismissing it matters. If thinning is
        not temporary, vague reassurance that “it will grow back” ages poorly — clear explanation of what is likely, uncertainty, and
        options is more supportive.
      </p>
      <p className="leading-relaxed">
        More on the postpartum pillar:{" "}
        <Link href={PILLAR_GUIDE_HREF["postpartum-hair-loss"]} className="font-medium text-medical underline-offset-2 hover:underline">
          postpartum hair loss guide
        </Link>
        .
      </p>
      <p className="leading-relaxed text-sm text-[rgb(var(--text-muted))]">
        Educational information only; not a substitute for personalised medical advice.
      </p>
    </div>
  );
}

export function BodySheddingVsBreakage() {
  return (
    <div className={wrap}>
      <p className={lead}>
        People often say “hair loss” for any change — shower drain, pillow, shorter pieces in a brush. Shedding and breakage are
        different processes: different origins, appearances, and next steps. Telling them apart is the first move toward the right help.
      </p>
      <h2 id="what-is-hair-shedding" className={h2}>
        What is hair shedding?
      </h2>
      <p className="leading-relaxed">
        Shedding is part of the hair cycle: growth (anagen), brief transition (catagen), rest (telogen), then release. When a hair
        completes the cycle and leaves the follicle, that is shedding. Many adults shed roughly fifty to one hundred hairs daily — more
        visible on wash day after a gap — which can be normal.
      </p>
      <p className="leading-relaxed">
        Shedding becomes a concern when the cycle shifts and many follicles rest together (telogen effluvium) — often weeks to months
        after illness, stress, hormones, or weight change. The follicle stays viable; new growth follows when the trigger resolves. For
        stress- or illness-related shedding see{" "}
        <Link href={insight("telogen-effluvium-after-illness-or-stress")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium after illness or stress
        </Link>
        ; postpartum timing has{" "}
        <Link href={PILLAR_GUIDE_HREF["postpartum-hair-loss"]} className="font-medium text-medical underline-offset-2 hover:underline">
          postpartum hair resources
        </Link>
        .
      </p>
      <h2 id="what-is-hair-breakage" className={h2}>
        What is hair breakage?
      </h2>
      <p className="leading-relaxed">
        Breakage is shaft damage: the cuticle erodes; cortex weakens; strands snap along the length. Heat, colour, relaxers, tension, and
        friction are common culprits. The follicle is not the primary problem — it can still produce new hair while lengths look thin from
        snapped ends.
      </p>
      <h2 id="clues-that-help-you-tell-them-apart" className={h2}>
        Clues that help you tell them apart
      </h2>
      <p className="leading-relaxed">
        Look at length and the root end. Shed hairs are often near full length and may show a tiny bulb. Broken pieces are shorter,
        uneven, jagged, and lack a root bulb. A gentle stretch test on a single strand (healthy hair has some elasticity) is imperfect but
        can hint at shaft fragility versus excess telogen release.
      </p>
      <h2 id="why-the-difference-matters" className={h2}>
        Why the difference matters
      </h2>
      <p className="leading-relaxed">
        Causes and responses differ. Excess shedding may need medical context — thyroid, iron, illness, hormones — matched to story and
        exam. Breakage needs styling and chemical load review; labs rarely explain mid-shaft snap. Expectations differ too: reducing
        damage can show benefit sooner; telogen recovery often lags months behind fixing the trigger.
      </p>
      <p className="leading-relaxed">
        For scalp inflammation overlaps see{" "}
        <Link href={insight("scalp-inflammation-and-shedding")} className="font-medium text-medical underline-offset-2 hover:underline">
          scalp inflammation and shedding
        </Link>
        ; for lab breadth see{" "}
        <Link href={insight("what-blood-tests-matter-for-hair-loss")} className="font-medium text-medical underline-offset-2 hover:underline">
          what blood tests matter for hair loss
        </Link>
        .
      </p>
      <h2 id="when-both-can-happen-together" className={h2}>
        When both can happen together
      </h2>
      <p className="leading-relaxed">
        Mixed pictures are common: telogen increase plus heat or colour damage, or fragile hair that breaks as shed hairs move through
        the mass. Brush findings may show both long strands with bulbs and short fragments — manage each problem on its own terms.
      </p>
      <h2 id="a-practical-self-assessment-framework" className={h2}>
        A practical self-assessment framework
      </h2>
      <p className="leading-relaxed">
        Collect hairs over a few days on a light background; note proportions of long versus short. Review six to twelve months of
        styling, colour, illness, stress, pregnancy, or medication changes. If shedding is heavy, persistent, or unclear — or scalp
        symptoms dominate — dermatology review and examination (including trichoscopy when indicated) beats guessing.
      </p>
      <h2 id="key-takeaways-and-next-reads" className={h2}>
        Key takeaways and next reads
      </h2>
      <p className="leading-relaxed">
        Shedding is follicular cycle–driven; breakage is structural. Different causes, different fixes. Mixed cases need diagnosis-first
        thinking, not a shopping cart of supplements.
      </p>
      <p className="leading-relaxed">
        Continue with{" "}
        <Link href={PILLAR_GUIDE_HREF["hair-longevity"]} className="font-medium text-medical underline-offset-2 hover:underline">
          hair longevity guide
        </Link>
        ,{" "}
        <Link href={insight("telogen-effluvium-after-illness-or-stress")} className="font-medium text-medical underline-offset-2 hover:underline">
          telogen effluvium after illness or stress
        </Link>
        , and{" "}
        <Link href={insight("vitamin-d-b12-folate-what-labs-may-mean-for-hair")} className="font-medium text-medical underline-offset-2 hover:underline">
          vitamin D, B12, and folate context for hair
        </Link>
        .
      </p>
      <p className="leading-relaxed text-sm text-[rgb(var(--text-muted))]">
        Educational information only; not a substitute for personalised medical advice.
      </p>
    </div>
  );
}
