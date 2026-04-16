import type { IntakeAnswerMap, IntakeQuestionDefinition } from "./types";

export const INTAKE_QUESTION_BANK_VERSION = "adaptive_intake_v1";

function arr(a: unknown): string[] {
  return Array.isArray(a) ? a.filter((v): v is string => typeof v === "string") : [];
}

function femaleHormonalYes(answers: IntakeAnswerMap): boolean {
  return answers.female_hormonal_context === "yes";
}

function maleAndrogenYes(answers: IntakeAnswerMap): boolean {
  return answers.male_androgen_exposure_context === "yes";
}

function hasMeaningfulScalpCluster(answers: IntakeAnswerMap): boolean {
  return arr(answers.scalp_symptom_cluster).some((s) => s && s !== "none");
}

function lifestyleLoadEngaged(answers: IntakeAnswerMap): boolean {
  const l = arr(answers.lifestyle_load);
  return l.length > 0 && !l.every((x) => x === "none");
}

function hasLifestyleSignal(answers: IntakeAnswerMap, ...keys: string[]): boolean {
  return arr(answers.lifestyle_load).some((value) => keys.includes(value));
}

function sheddingOrDiffusePresentation(answers: IntakeAnswerMap): boolean {
  const p = answers.presentation_pattern;
  return (
    p === "acute_shedding" ||
    p === "chronic_shedding" ||
    p === "diffuse_thinning" ||
    p === "mixed_or_unsure"
  );
}

function maleExposureDetailChosen(answers: IntakeAnswerMap): boolean {
  return arr(answers.male_androgen_exposure_detail).some((x) => x && x !== "prefer_not_detail" && x !== "none");
}

function femaleEndocrinePituitaryPromptVisible(answers: IntakeAnswerMap): boolean {
  if (!femaleHormonalYes(answers)) return false;
  if (answers.postpartum_recent_gate === "yes") return false;
  if (answers.hormonal_contraception_change_gate === "yes") return false;
  return true;
}

function femaleHirsutismPromptVisible(answers: IntakeAnswerMap): boolean {
  if (!femaleHormonalYes(answers)) return false;
  return (
    answers.unwanted_facial_hair === "yes" ||
    answers.increased_body_hair === "yes" ||
    answers.jawline_acne_or_oily_skin === "yes" ||
    answers.known_pcos === "yes" ||
    answers.female_hormonal_context === "yes"
  );
}

function femaleHirsutismStructuredVisible(answers: IntakeAnswerMap): boolean {
  return (
    answers.hirsutism_severity === "moderate" ||
    answers.hirsutism_severity === "marked"
  );
}

export const INTAKE_QUESTION_BANK: IntakeQuestionDefinition[] = [
  {
    id: "presentation_pattern",
    label: "Which pattern best matches what you notice most?",
    type: "single_select",
    section: "base",
    helpText: "Pick the option that fits best. You can choose “mixed or unsure” if several apply.",
    explanation:
      "We use your main pattern to decide which extra questions matter. “Shedding” usually means more hairs falling out than usual. “Thinning” means the hair looks less full. “Recession” is the hairline or temples moving back. “Broken hairs” means hairs snap off shorter, not full-length fall-out. “Scalp symptoms” means itch, soreness, or flakes bother you more than thinning does.",
    options: [
      {
        value: "acute_shedding",
        label: "Acute shedding",
        description: "Suddenly losing more hair than usual over a short time",
      },
      {
        value: "chronic_shedding",
        label: "Chronic shedding",
        description: "Extra hair fall that has gone on for a longer time",
      },
      {
        value: "patterned_thinning",
        label: "Patterned thinning",
        description: "Thinning in a clear pattern (for example part line or top)",
      },
      {
        value: "frontal_temporal_recession",
        label: "Frontal/temporal recession",
        description: "Hairline or temples moving back or looking thinner there",
      },
      { value: "crown_loss", label: "Crown loss", description: "Less hair on the top back of the head" },
      {
        value: "diffuse_thinning",
        label: "Diffuse thinning",
        description: "Overall less fullness spread over the scalp",
      },
      {
        value: "broken_hairs",
        label: "Broken hairs / fragility",
        description: "Hair snaps or breaks; short pieces, not full-length shedding",
      },
      {
        value: "scalp_symptoms",
        label: "Scalp symptoms dominant",
        description: "Itch, pain, burning, or flakes are the main problem",
      },
      { value: "mixed_or_unsure", label: "Mixed or unsure", description: "Several of these fit, or you are not sure" },
    ],
    pathwayHints: [
      "androgenic_pattern",
      "telogen_effluvium_diffuse_shedding",
      "inflammatory_scalp_disease",
      "traction_mechanical_damage",
      "mixed_unclear_pattern",
    ],
  },
  {
    id: "acute_trigger_window",
    label: "Did this change start after a specific event over weeks to months?",
    type: "single_select",
    section: "trigger",
    helpText: "Examples: illness, surgery, high stress, or a big life change.",
    explanation:
      "Hair often shifts a few months after a stress or illness. This timing clue helps separate sudden shedding from slow thinning.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" },
    ],
    allowSkip: true,
    visibleWhen: (answers) =>
      answers.presentation_pattern === "acute_shedding" ||
      answers.presentation_pattern === "diffuse_thinning",
    pathwayHints: ["telogen_effluvium_diffuse_shedding"],
  },
  {
    id: "female_hormonal_context",
    label: "Any cycle, postpartum, perimenopause, or hormonal context relevant here?",
    type: "single_select",
    section: "sex_specific",
    helpText: "Includes periods, pregnancy, after birth, menopause, or hormone treatments.",
    explanation:
      "Hormone shifts can affect hair growth and shedding. You can skip details you prefer not to share; “prefer not to say” is always OK.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (_answers) => true,
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "male_androgen_exposure_context",
    label: "Any testosterone, anabolic, or androgen-related medication context?",
    type: "single_select",
    section: "sex_specific",
    helpText: "“Androgen-related” means medicines or products that affect male-type hormones.",
    explanation:
      "This includes prescribed testosterone (TRT), some gym or bodybuilding products, and similar treatments. We ask so we can interpret your hair changes in context—not to judge.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (_answers) => true,
    pathwayHints: ["medication_androgen_exposure", "androgenic_pattern"],
  },
  {
    id: "scalp_symptom_cluster",
    label: "Which scalp symptoms are present?",
    type: "multi_select",
    section: "trigger",
    helpText: "Choose all that apply. “Scale” means flaky or scaly skin on the scalp.",
    explanation:
      "Itch and flakes can come from dryness or dandruff, or from scalp conditions that need different care. Pain or burning matters for safety. “Pustules” means small spots or pimples on the scalp.",
    options: [
      { value: "itch", label: "Itch", description: "Scalp feels itchy" },
      { value: "scale", label: "Scale/flaking", description: "Flakes or scaly buildup on the scalp" },
      { value: "pain", label: "Pain/tenderness", description: "Sore or tender to touch" },
      { value: "burning", label: "Burning", description: "Burning or stinging feeling" },
      {
        value: "pustules",
        label: "Pustules",
        description: "Small blister-like spots on the scalp (not the same as ordinary spots on the face)",
      },
      { value: "none", label: "None/unsure" },
    ],
    allowSkip: true,
    visibleWhen: (answers) =>
      answers.presentation_pattern === "scalp_symptoms" ||
      answers.presentation_pattern === "mixed_or_unsure",
    pathwayHints: ["inflammatory_scalp_disease"],
  },
  {
    id: "mechanical_exposures",
    label: "Any mechanical or cosmetic stressors likely to affect hair integrity?",
    type: "multi_select",
    section: "mechanical",
    helpText: "Things that pull, rub, heat, or chemically treat the hair often.",
    explanation:
      "Tight styles and extensions can stress the hairline. Heat tools and bleach can weaken hair so it breaks. This helps tell breakage apart from shedding from the root.",
    options: [
      { value: "tight_styles", label: "Tight hairstyles/extensions/braids", description: "Styles that pull on the roots" },
      { value: "helmet_friction", label: "Helmet/headgear friction", description: "Often rubbing in the same place" },
      { value: "high_heat", label: "Frequent high heat", description: "Regular very hot styling" },
      {
        value: "chemical_processing",
        label: "Frequent bleach/chemical processing",
        description: "Relaxers, bleach, or strong dyes often",
      },
      { value: "none", label: "None/unsure" },
    ],
    allowSkip: true,
    visibleWhen: (answers) =>
      answers.presentation_pattern === "broken_hairs" ||
      answers.presentation_pattern === "frontal_temporal_recession" ||
      answers.presentation_pattern === "mixed_or_unsure",
    pathwayHints: ["traction_mechanical_damage"],
  },
  {
    id: "lifestyle_load",
    label: "Any recent lifestyle shifts that may contribute?",
    type: "multi_select",
    section: "lifestyle",
    helpText: "Recent changes matter more than habits from years ago.",
    explanation:
      "Big stress, poor sleep timing, fast weight loss, very strict eating, or heavy training can all affect hair. “Restrictive eating” means eating much less than your body needs, not simply choosing healthy food.",
    options: [
      { value: "major_stress", label: "Major stress period", description: "A hard time that lasted weeks or more" },
      { value: "shift_work", label: "Shift work/poor sleep timing", description: "Changing shifts or very irregular sleep" },
      { value: "rapid_weight_loss", label: "Rapid weight loss", description: "Losing weight quickly, on purpose or not" },
      {
        value: "restrictive_eating",
        label: "Restrictive eating",
        description: "Very low calories or cutting out many foods",
      },
      {
        value: "high_intensity_sport",
        label: "High-intensity sport/bodybuilding",
        description: "Very hard training with little recovery",
      },
      { value: "none", label: "None/unsure" },
    ],
    allowSkip: true,
    visibleWhen: () => true,
    pathwayHints: [
      "telogen_effluvium_diffuse_shedding",
      "nutritional_deficiency",
      "medication_androgen_exposure",
    ],
  },
  {
    id: "postpartum_recent_gate",
    label: "In the last 12 months, did you give birth?",
    type: "single_select",
    section: "sex_specific",
    helpText: "We only ask because birth and early postpartum can line up with shedding timing.",
    explanation:
      "If this does not apply, choose “No.” If you prefer not to answer, use “Prefer not to say.” This stays in your hormonal context — we do not repeat it in the timeline section.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => femaleHormonalYes(a),
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "months_since_delivery",
    label: "Roughly how long since delivery?",
    type: "single_select",
    section: "sex_specific",
    helpText: "Approximate is fine — it helps relate shedding to the postpartum window.",
    options: [
      { value: "under_3_months", label: "Under 3 months" },
      { value: "3_to_6_months", label: "3–6 months" },
      { value: "6_to_12_months", label: "6–12 months" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => femaleHormonalYes(a) && a.postpartum_recent_gate === "yes",
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "breastfeeding_status",
    label: "Breastfeeding status (if relevant)",
    type: "single_select",
    section: "sex_specific",
    helpText: "Skip if this does not apply to you.",
    explanation:
      "Feeding patterns can overlap with postpartum hormone shifts. Choose the closest option, or “Not applicable.”",
    options: [
      { value: "currently_breastfeeding", label: "Currently breastfeeding" },
      { value: "partially_weaning", label: "Partially weaning / mixed feeding" },
      { value: "stopped_within_3_months", label: "Stopped within the last ~3 months" },
      { value: "stopped_over_3_months", label: "Stopped more than ~3 months ago" },
      { value: "not_applicable", label: "Not applicable" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => femaleHormonalYes(a) && a.postpartum_recent_gate === "yes",
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "hormonal_contraception_change_gate",
    label: "In the last year, did you start, stop, or change hormonal birth control or HRT?",
    type: "single_select",
    section: "sex_specific",
    helpText: "Includes the pill, implant, hormonal IUD, injections, or menopause HRT.",
    explanation:
      "Hormone changes can track with hair shedding or thinning for some people. This is the only place we capture this timing in detail so it is not duplicated elsewhere.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => femaleHormonalYes(a),
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "hormonal_change_vs_hair_timing",
    label: "How did that hormone change line up with your hair change?",
    type: "single_select",
    section: "sex_specific",
    helpText: "Best guess is fine if you are not sure of exact dates.",
    options: [
      { value: "before_hair_change", label: "Before the hair change" },
      { value: "around_same_time", label: "Around the same time" },
      { value: "after_hair_change", label: "After the hair change" },
      { value: "unsure", label: "Unsure" },
    ],
    allowSkip: true,
    visibleWhen: (a) => femaleHormonalYes(a) && a.hormonal_contraception_change_gate === "yes",
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "stress_shedding_delay_pattern",
    label: "Did your shedding start 2-4 months after a major stress period, illness, surgery, or major life disruption?",
    type: "single_select",
    section: "trigger",
    helpText: "Best guess is fine if the timing is not exact.",
    explanation:
      "Hair shedding often lags behind a body-level stress or illness. That time gap can help separate a trigger-related shed from slower pattern change.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) =>
      femaleHormonalYes(a) &&
      sheddingOrDiffusePresentation(a) &&
      (a.acute_trigger_window === "yes" || hasLifestyleSignal(a, "major_stress")),
    pathwayHints: ["hormonal_endocrine_female_pattern", "telogen_effluvium_diffuse_shedding"],
  },
  {
    id: "pituitary_red_flag_followup",
    label:
      "Have you had absent periods when not pregnant, breastfeeding, or on hormonal suppression — or any milky nipple discharge, new severe headaches, or visual changes?",
    type: "single_select",
    section: "sex_specific",
    helpText: "Answer yes if any part of this applies.",
    explanation:
      "Most people will answer no. We ask because these symptoms deserve more direct clinician follow-up rather than being treated as routine shedding alone.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => femaleEndocrinePituitaryPromptVisible(a),
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "hirsutism_severity",
    label: "If facial or body hair change is part of the picture, how noticeable does it feel to you?",
    type: "single_select",
    section: "sex_specific",
    helpText: "If this is not really relevant, choose “Not really / not relevant.”",
    explanation:
      "This is a simple severity check only. It helps your clinician judge whether androgen-related follow-up is worth keeping in mind, without assuming a diagnosis.",
    options: [
      { value: "not_really", label: "Not really / not relevant" },
      { value: "mild", label: "Mild" },
      { value: "moderate", label: "Moderate" },
      { value: "marked", label: "Marked" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => femaleHirsutismPromptVisible(a),
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "hirsutism_structured_check_opt_in",
    label: "If you want, would you be comfortable doing a brief private self-check of a few areas to make this more specific?",
    type: "single_select",
    section: "sex_specific",
    helpText: "This is optional and only for extra detail if you want to give it.",
    explanation:
      "This uses a short body-area checklist inspired by medical hirsutism scoring, but in a lighter and more privacy-sensitive format.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => femaleHirsutismStructuredVisible(a),
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "hirsutism_structured_regions",
    label: "Which areas feel more noticeably affected by coarser or darker hair growth?",
    type: "multi_select",
    section: "sex_specific",
    helpText: "Select any that clearly feel relevant to you. Skip if you would rather not answer.",
    explanation:
      "This is not a diagnosis or a full body-hair score. It is just a structured self-check to help your clinician understand whether androgen-sensitive features deserve more attention.",
    options: [
      { value: "upper_lip", label: "Upper lip" },
      { value: "chin_jawline", label: "Chin / jawline" },
      { value: "chest", label: "Chest" },
      { value: "around_nipples", label: "Around the nipples" },
      { value: "lower_abdomen", label: "Lower abdomen" },
      { value: "inner_thighs", label: "Inner thighs" },
      { value: "none", label: "None of these / not sure" },
    ],
    allowSkip: true,
    visibleWhen: (a) =>
      femaleHirsutismStructuredVisible(a) &&
      a.hirsutism_structured_check_opt_in === "yes",
    pathwayHints: ["hormonal_endocrine_female_pattern"],
  },
  {
    id: "male_androgen_exposure_detail",
    label: "Which exposures apply (or applied) most recently?",
    type: "multi_select",
    section: "sex_specific",
    helpText: "Select any that fit. This stays in the androgen section only.",
    explanation:
      "Prescribed testosterone (TRT) is different from gym or online products. Peptides and some “boosters” can also affect hormone balance. Choose “Prefer not to detail” if you want to skip specifics.",
    options: [
      { value: "trt", label: "Testosterone therapy (TRT)", description: "Prescribed or supervised testosterone" },
      {
        value: "sarms_or_anabolics",
        label: "Anabolic steroids or SARMs",
        description: "Including non-prescribed or past use",
      },
      {
        value: "testosterone_booster_products",
        label: "Testosterone booster / prohormone products",
        description: "Over-the-counter or online products marketed for testosterone",
      },
      {
        value: "peptides_or_growth",
        label: "Peptides or growth-related injectables",
        description: "If relevant to your situation",
      },
      { value: "prefer_not_detail", label: "Prefer not to detail" },
    ],
    allowSkip: true,
    visibleWhen: (a) => maleAndrogenYes(a),
    pathwayHints: ["medication_androgen_exposure", "androgenic_pattern"],
  },
  {
    id: "exogenous_androgen_timing_vs_hair",
    label: "For the main exposure you selected, when did it start relative to your hair change?",
    type: "single_select",
    section: "sex_specific",
    helpText: "One timeline is enough if you had several exposures.",
    options: [
      { value: "before_hair_change", label: "Before the hair change" },
      { value: "around_same_time", label: "Around the same time" },
      { value: "after_hair_change", label: "After the hair change" },
      { value: "unsure", label: "Unsure" },
    ],
    allowSkip: true,
    visibleWhen: (a) => maleAndrogenYes(a) && maleExposureDetailChosen(a),
    pathwayHints: ["medication_androgen_exposure", "androgenic_pattern"],
  },
  {
    id: "scalp_symptom_duration",
    label: "How long have these scalp symptoms been going on?",
    type: "single_select",
    section: "trigger",
    helpText: "Approximate window is fine.",
    options: [
      { value: "under_6_weeks", label: "Under 6 weeks" },
      { value: "6_weeks_to_6_months", label: "6 weeks to 6 months" },
      { value: "more_than_6_months", label: "More than 6 months" },
      { value: "comes_and_goes", label: "Comes and goes" },
      { value: "unsure", label: "Unsure" },
    ],
    allowSkip: true,
    visibleWhen: (a) => hasMeaningfulScalpCluster(a),
    pathwayHints: ["inflammatory_scalp_disease"],
  },
  {
    id: "scalp_symptom_flare_pattern",
    label: "How would you describe the pattern?",
    type: "single_select",
    section: "trigger",
    helpText: "Pick the closest fit.",
    options: [
      { value: "steady", label: "Fairly steady" },
      { value: "flares_then_calm", label: "Flares then calms down" },
      { value: "worse_after_products_or_styling", label: "Worse after certain products or styling" },
      { value: "unsure", label: "Unsure" },
    ],
    allowSkip: true,
    visibleWhen: (a) => hasMeaningfulScalpCluster(a),
    pathwayHints: ["inflammatory_scalp_disease"],
  },
  {
    id: "scalp_symptom_treatments_tried",
    label: "What have you already tried for your scalp? (optional)",
    type: "multi_select",
    section: "trigger",
    helpText: "Skip if none, or select all that apply.",
    options: [
      { value: "medicated_shampoo", label: "Medicated or anti-dandruff shampoo" },
      { value: "prescription_topical", label: "Prescription scalp treatment" },
      { value: "otc_cream_or_oil", label: "Over-the-counter creams or oils" },
      { value: "saw_dermatologist", label: "Saw a dermatologist or GP for scalp" },
      { value: "none_or_not_yet", label: "None / not yet" },
    ],
    allowSkip: true,
    visibleWhen: (a) => hasMeaningfulScalpCluster(a),
    pathwayHints: ["inflammatory_scalp_disease"],
  },
  {
    id: "medication_hormone_change_recent",
    label: "In the last 6 months, did you start, stop, or change any prescription medicine or hormone treatment?",
    type: "single_select",
    section: "trigger",
    helpText: "We ask here for timing vs your hair — the timeline step stays for life events.",
    explanation:
      "If you already noted a medication change under timeline triggers, answer the same way here so your record lines up. This field is only for medicine or hormone treatments, not supplements unless prescribed.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => sheddingOrDiffusePresentation(a),
    pathwayHints: ["telogen_effluvium_diffuse_shedding", "mixed_unclear_pattern"],
  },
  {
    id: "med_change_timing_vs_hair",
    label: "How did that change line up with your hair symptoms?",
    type: "single_select",
    section: "trigger",
    helpText: "Approximate timing is enough.",
    options: [
      { value: "before_hair_change", label: "Before hair symptoms" },
      { value: "around_same_time", label: "Around the same time" },
      { value: "after_hair_change", label: "After hair symptoms" },
      { value: "unsure", label: "Unsure" },
    ],
    allowSkip: true,
    visibleWhen: (a) => sheddingOrDiffusePresentation(a) && a.medication_hormone_change_recent === "yes",
    pathwayHints: ["telogen_effluvium_diffuse_shedding", "mixed_unclear_pattern"],
  },
  {
    id: "protein_intake_level",
    label: "Roughly, how would you describe your usual protein intake?",
    type: "single_select",
    section: "lifestyle",
    helpText: "Compared with a typical balanced meal pattern for you.",
    explanation:
      "Protein supports hair structure; very low intake can matter when other risks are present. This is the structured protein question — we do not repeat it in other lifestyle fields.",
    options: [
      { value: "high", label: "Usually high (most meals include a good protein source)" },
      { value: "adequate", label: "Adequate most days" },
      { value: "below_average", label: "Often lower than I think I need" },
      { value: "low", label: "Usually low" },
      { value: "unsure", label: "Unsure" },
    ],
    allowSkip: true,
    visibleWhen: (a) => lifestyleLoadEngaged(a),
    pathwayHints: ["telogen_effluvium_diffuse_shedding", "nutritional_deficiency", "mixed_unclear_pattern"],
  },
  {
    id: "diet_pattern_intake",
    label: "Which eating pattern fits you best lately?",
    type: "multi_select",
    section: "lifestyle",
    helpText: "Select all that apply, or skip.",
    options: [
      { value: "omnivore", label: "Omnivore (no major restriction)" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "low_calorie_restriction", label: "Actively restricting calories" },
      { value: "omad_or_extended_fasting", label: "One meal a day or extended fasting often" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    allowSkip: true,
    visibleWhen: (a) => lifestyleLoadEngaged(a),
    pathwayHints: ["telogen_effluvium_diffuse_shedding", "nutritional_deficiency", "mixed_unclear_pattern"],
  },
];
