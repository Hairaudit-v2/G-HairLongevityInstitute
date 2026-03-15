"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  LongevityQuestionnaireResponses,
  AboutYou,
  MainConcern,
  TimelineTriggers,
  MedicalHistory,
  FemaleHistory,
  MaleHistory,
  LifestyleTreatments,
  UploadsNextSteps,
  SexAtBirth,
} from "@/lib/longevity/schema";

const GOLD = "rgb(198,167,94)";
const BG = "rgb(15,27,45)";

type StepId =
  | "welcome"
  | "identify"
  | "aboutYou"
  | "mainConcern"
  | "timelineTriggers"
  | "medicalHistory"
  | "sexSpecific"
  | "lifestyleTreatments"
  | "uploadsNextSteps"
  | "review"
  | "done";

const STEP_ORDER: StepId[] = [
  "welcome",
  "identify",
  "aboutYou",
  "mainConcern",
  "timelineTriggers",
  "medicalHistory",
  "sexSpecific",
  "lifestyleTreatments",
  "uploadsNextSteps",
  "review",
  "done",
];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition disabled:opacity-50";
  return (
    <button
      type="button"
      className={
        variant === "primary"
          ? `${base} bg-[rgb(198,167,94)] text-[rgb(15,27,45)]`
          : `${base} border border-white/15 bg-white/5 text-white/90 hover:bg-white/10`
      }
      style={variant === "primary" ? { backgroundColor: GOLD, color: BG } : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-white/75">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-white outline-none focus:border-[rgb(198,167,94)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
      />
    </div>
  );
}

function MultiSelect({
  label,
  subtitle,
  options,
  value,
  onChange,
}: {
  label: string;
  subtitle?: string;
  options: { key: string; label: string }[];
  value: string[];
  onChange: (keys: string[]) => void;
}) {
  const toggle = (key: string) => {
    if (value.includes(key)) onChange(value.filter((k) => k !== key));
    else onChange([...value, key]);
  };
  return (
    <div>
      <div className="text-sm font-medium text-white/90">{label}</div>
      {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            className={`rounded-xl border px-3 py-2 text-sm transition ${
              value.includes(opt.key)
                ? "border-[rgb(198,167,94)] bg-[rgb(198,167,94)]/10 text-white"
                : "border-white/10 bg-white/5 text-white/80 hover:border-white/20"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SingleSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string }[];
  value?: T;
  onChange: (k: T) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-white/90">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`rounded-xl border px-3 py-2 text-sm transition ${
              value === opt.key
                ? "border-[rgb(198,167,94)] bg-[rgb(198,167,94)]/10 text-white"
                : "border-white/10 bg-white/5 text-white/80 hover:border-white/20"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const PRIMARY_CONCERNS = [
  { key: "increased_shedding", label: "Increased shedding" },
  { key: "diffuse_thinning", label: "Diffuse thinning" },
  { key: "frontal_hairline_recession", label: "Frontal hairline recession" },
  { key: "temple_recession", label: "Temple recession" },
  { key: "crown_thinning", label: "Crown thinning" },
  { key: "widening_part", label: "Widening part" },
  { key: "patchy_hair_loss", label: "Patchy hair loss" },
  { key: "eyebrow_thinning", label: "Eyebrow thinning" },
  { key: "eyelash_thinning", label: "Eyelash thinning" },
  { key: "scalp_irritation_or_inflammation", label: "Scalp irritation or inflammation" },
  { key: "other", label: "Other" },
];

const FIRST_NOTICED = [
  { key: "less_than_3_months", label: "Less than 3 months" },
  { key: "three_to_six_months", label: "3–6 months" },
  { key: "six_to_twelve_months", label: "6–12 months" },
  { key: "one_to_two_years", label: "1–2 years" },
  { key: "more_than_two_years", label: "More than 2 years" },
  { key: "unsure", label: "Unsure" },
];

const ONSET_PATTERN = [
  { key: "sudden", label: "Sudden" },
  { key: "gradual", label: "Gradual" },
  { key: "fluctuating", label: "Fluctuating" },
  { key: "unsure", label: "Unsure" },
];

const AFFECTED_AREAS = [
  { key: "frontal_hairline", label: "Frontal hairline" },
  { key: "temples", label: "Temples" },
  { key: "crown", label: "Crown" },
  { key: "mid_scalp", label: "Mid scalp" },
  { key: "whole_scalp", label: "Whole scalp" },
  { key: "part_line", label: "Part line" },
  { key: "eyebrows", label: "Eyebrows" },
  { key: "eyelashes", label: "Eyelashes" },
  { key: "beard", label: "Beard" },
  { key: "body_hair", label: "Body hair" },
];

const SYMPTOMS = [
  { key: "increased_daily_shedding", label: "Increased daily shedding" },
  { key: "reduced_ponytail_thickness", label: "Reduced ponytail thickness" },
  { key: "hair_becoming_finer", label: "Hair becoming finer" },
  { key: "hair_not_growing_as_long", label: "Hair not growing as long" },
  { key: "itch", label: "Itch" },
  { key: "burning", label: "Burning" },
  { key: "tenderness", label: "Tenderness" },
  { key: "flaking", label: "Flaking" },
  { key: "greasiness", label: "Greasiness" },
  { key: "none", label: "None" },
];

const TRIGGERS = [
  { key: "major_stress", label: "Major stress" },
  { key: "recent_illness_or_infection", label: "Recent illness or infection" },
  { key: "fever", label: "Fever" },
  { key: "surgery_or_anaesthetic", label: "Surgery or anaesthetic" },
  { key: "childbirth_postpartum", label: "Childbirth / postpartum" },
  { key: "stopping_contraception", label: "Stopping contraception" },
  { key: "starting_contraception", label: "Starting contraception" },
  { key: "menopause_perimenopause", label: "Menopause / perimenopause" },
  { key: "rapid_weight_loss", label: "Rapid weight loss" },
  { key: "dietary_change", label: "Dietary change" },
  { key: "new_medication", label: "New medication" },
  { key: "stopping_medication", label: "Stopping medication" },
  { key: "none", label: "None" },
];

const PAST_YEAR_EVENTS = [
  { key: "covid_or_major_viral_illness", label: "COVID or major viral illness" },
  { key: "hospital_admission", label: "Hospital admission" },
  { key: "significant_emotional_stress", label: "Significant emotional stress" },
  { key: "crash_dieting", label: "Crash dieting" },
  { key: "major_change_in_exercise_load", label: "Major change in exercise load" },
  { key: "none", label: "None" },
];

const DIAGNOSES = [
  { key: "iron_deficiency", label: "Iron deficiency" },
  { key: "low_ferritin", label: "Low ferritin" },
  { key: "anaemia", label: "Anaemia" },
  { key: "thyroid_disorder", label: "Thyroid disorder" },
  { key: "pcos", label: "PCOS" },
  { key: "endometriosis", label: "Endometriosis" },
  { key: "autoimmune_condition", label: "Autoimmune condition" },
  { key: "diabetes_or_insulin_resistance", label: "Diabetes or insulin resistance" },
  { key: "vitamin_d_deficiency", label: "Vitamin D deficiency" },
  { key: "scalp_psoriasis", label: "Scalp psoriasis" },
  { key: "seborrhoeic_dermatitis", label: "Seborrhoeic dermatitis" },
  { key: "eczema", label: "Eczema" },
  { key: "none", label: "None" },
];

const CURRENT_SYMPTOMS = [
  { key: "fatigue", label: "Fatigue" },
  { key: "brain_fog", label: "Brain fog" },
  { key: "cold_intolerance", label: "Cold intolerance" },
  { key: "weight_change", label: "Weight change" },
  { key: "palpitations", label: "Palpitations" },
  { key: "poor_sleep", label: "Poor sleep" },
  { key: "anxiety_or_stress_overload", label: "Anxiety or stress overload" },
  { key: "change_in_appetite", label: "Change in appetite" },
  { key: "none", label: "None" },
];

const FAMILY_HISTORY = [
  { key: "male_pattern_hair_loss", label: "Male pattern hair loss" },
  { key: "female_pattern_thinning", label: "Female pattern thinning" },
  { key: "thyroid_disease", label: "Thyroid disease" },
  { key: "autoimmune_disease", label: "Autoimmune disease" },
  { key: "none_known", label: "None known" },
];

const FEMALE_FEATURES = [
  { key: "heavy_periods", label: "Heavy periods" },
  { key: "painful_periods", label: "Painful periods" },
  { key: "missed_periods", label: "Missed periods" },
  { key: "acne", label: "Acne" },
  { key: "increased_facial_or_body_hair", label: "Increased facial or body hair" },
  { key: "fertility_issues", label: "Fertility issues" },
  { key: "none", label: "None" },
];

const FEMALE_LIFE_STAGE = [
  { key: "pregnant", label: "Pregnant" },
  { key: "postpartum", label: "Postpartum" },
  { key: "perimenopausal", label: "Perimenopausal" },
  { key: "menopausal", label: "Menopausal" },
  { key: "hormonal_contraception", label: "Hormonal contraception" },
  { key: "hrt", label: "HRT" },
  { key: "none", label: "None" },
];

const MALE_THERAPIES = [
  { key: "finasteride", label: "Finasteride" },
  { key: "dutasteride", label: "Dutasteride" },
  { key: "oral_minoxidil", label: "Oral minoxidil" },
  { key: "topical_minoxidil", label: "Topical minoxidil" },
  { key: "testosterone_replacement_therapy", label: "Testosterone replacement therapy" },
  { key: "anabolic_steroids_or_sarms", label: "Anabolic steroids or SARMs" },
  { key: "none", label: "None" },
];

const MALE_ASSOCIATED_CHANGES = [
  { key: "fatigue", label: "Fatigue" },
  { key: "reduced_libido", label: "Reduced libido" },
  { key: "mood_changes", label: "Mood changes" },
  { key: "beard_density_change", label: "Beard density change" },
  { key: "body_hair_change", label: "Body hair change" },
  { key: "none", label: "None" },
];

const DIET_PATTERN = [
  { key: "omnivore", label: "Omnivore" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "high_protein", label: "High protein" },
  { key: "restrictive_dieting", label: "Restrictive dieting" },
  { key: "unsure", label: "Unsure" },
];

const CURRENT_TREATMENTS = [
  { key: "topical_minoxidil", label: "Topical minoxidil" },
  { key: "oral_minoxidil", label: "Oral minoxidil" },
  { key: "finasteride", label: "Finasteride" },
  { key: "dutasteride", label: "Dutasteride" },
  { key: "spironolactone", label: "Spironolactone" },
  { key: "saw_palmetto", label: "Saw palmetto" },
  { key: "prp", label: "PRP" },
  { key: "exosomes", label: "Exosomes" },
  { key: "microneedling", label: "Microneedling" },
  { key: "ketoconazole_shampoo", label: "Ketoconazole shampoo" },
  { key: "led_or_laser_cap", label: "LED or laser cap" },
  { key: "iron_supplement", label: "Iron supplement" },
  { key: "vitamin_d", label: "Vitamin D" },
  { key: "zinc", label: "Zinc" },
  { key: "biotin", label: "Biotin" },
  { key: "none", label: "None" },
];

const AVAILABLE_UPLOADS = [
  { key: "recent_blood_test_results", label: "Recent blood test results" },
  { key: "scalp_photographs", label: "Scalp photographs" },
  { key: "specialist_letters", label: "Specialist letters" },
  { key: "prior_treatment_plans", label: "Prior treatment plans" },
];

export function LongevityStartFlow() {
  const [step, setStep] = useState<StepId>("welcome");
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [identifyEmail, setIdentifyEmail] = useState("");
  const [identifyName, setIdentifyName] = useState("");
  const [responses, setResponses] = useState<LongevityQuestionnaireResponses>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [stepDocuments, setStepDocuments] = useState<Array<{ id: string; doc_type: string; filename: string | null; size_bytes: number | null; created_at: string }>>([]);

  const progress = useMemo(() => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx <= 0 || step === "done") return step === "done" ? 100 : 0;
    return Math.round((idx / (STEP_ORDER.length - 1)) * 100);
  }, [step]);

  const loadResume = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/longevity/intakes/${id}`);
      const json = await res.json();
      if (res.status === 401 && json.requiresAuth === true && typeof json.redirectTo === "string") {
        setError(json.message ?? "Please sign in to resume your assessment.");
        window.location.href = json.redirectTo;
        return;
      }
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to load intake.");
        return;
      }
      setIntakeId(json.intake.id);
      const r = (json.questionnaire?.responses ?? {}) as LongevityQuestionnaireResponses;
      setResponses(r);
      setIdentifyEmail(r.aboutYou?.email ?? "");
      setIdentifyName([r.aboutYou?.firstName, r.aboutYou?.lastName].filter(Boolean).join(" ") || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const id = q.get("resume") ?? q.get("intakeId");
    if (id) loadResume(id);
  }, [loadResume]);

  const createDraft = useCallback(async () => {
    if (!identifyEmail.trim()) {
      setError("Email is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/longevity/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifyEmail.trim(),
          full_name: identifyName.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Failed to create intake.");
        return;
      }
      setIntakeId(json.intakeId);
      setResponses((prev) => ({
        ...prev,
        aboutYou: {
          ...prev.aboutYou,
          email: identifyEmail.trim(),
          firstName: identifyName.trim() ? identifyName.trim().split(" ")[0] : undefined,
          lastName: identifyName.trim() ? identifyName.trim().split(" ").slice(1).join(" ") : undefined,
        },
      }));
      setStep("aboutYou");
      window.history.replaceState(null, "", `/longevity/start?intakeId=${json.intakeId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create.");
    } finally {
      setSaving(false);
    }
  }, [identifyEmail, identifyName]);

  const saveProgress = useCallback(
    async (): Promise<{ ok: true } | { ok: false; error: unknown }> => {
      if (!intakeId) return { ok: false, error: new Error("No intakeId") };
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`/api/longevity/intakes/${intakeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionnaire: responses }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          const err = json.error ?? "Save failed.";
          setError(typeof err === "string" ? err : "Save failed.");
          return { ok: false, error: err };
        }
        setSavedAt(Date.now());
        return { ok: true };
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed.");
        return { ok: false, error: e };
      } finally {
        setSaving(false);
      }
    },
    [intakeId, responses]
  );

  const SAVE_FAILED_MESSAGE = "We couldn't save your progress. Please try again.";

  const goNext = useCallback(
    async (nextStep: StepId) => {
      try {
        const result = await saveProgress();
        if (result.ok) {
          setStep(nextStep);
        } else {
          setError(SAVE_FAILED_MESSAGE);
          if (typeof console !== "undefined" && console.error) {
            console.error("[LongevityStartFlow] goNext: save failed", result.error);
          }
        }
      } catch (e) {
        setError(SAVE_FAILED_MESSAGE);
        if (typeof console !== "undefined" && console.error) {
          console.error("[LongevityStartFlow] goNext: save error", e);
        }
      }
    },
    [saveProgress]
  );

  const fetchStepDocuments = useCallback(async () => {
    if (!intakeId) return;
    try {
      const res = await fetch(`/api/longevity/documents?intakeId=${intakeId}`);
      const json = await res.json();
      if (res.ok && json.ok && Array.isArray(json.documents)) {
        setStepDocuments(json.documents);
      }
    } catch {
      // ignore
    }
  }, [intakeId]);

  const handleDocumentUpload = useCallback(
    async (docType: string, file: File) => {
      if (!intakeId) return;
      setUploading(true);
      setUploadError(null);
      try {
        const formData = new FormData();
        formData.set("intakeId", intakeId);
        formData.set("docType", docType);
        formData.set("file", file);
        const res = await fetch("/api/longevity/documents/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setUploadError(json.error ?? "Upload failed.");
          return;
        }
        await fetchStepDocuments();
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [intakeId, fetchStepDocuments]
  );

  useEffect(() => {
    if (step === "uploadsNextSteps" && intakeId) fetchStepDocuments();
  }, [step, intakeId, fetchStepDocuments]);

  const submitIntake = useCallback(async () => {
    if (!intakeId) return;
    setSubmitting(true);
    setError(null);
    try {
      await saveProgress();
      const res = await fetch(`/api/longevity/intakes/${intakeId}/submit`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Submission failed.");
        return;
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }, [intakeId, saveProgress]);

  const a = responses.aboutYou ?? {};
  const mc = responses.mainConcern ?? {};
  const tt = responses.timelineTriggers ?? {};
  const mh = responses.medicalHistory ?? {};
  const fh = responses.femaleHistory ?? {};
  const mhMale = responses.maleHistory ?? {};
  const lt = responses.lifestyleTreatments ?? {};
  const un = responses.uploadsNextSteps ?? {};

  const setAboutYou = (next: Partial<AboutYou>) =>
    setResponses((r) => ({ ...r, aboutYou: { ...r.aboutYou, ...next } }));
  const setMainConcern = (next: Partial<MainConcern>) =>
    setResponses((r) => ({ ...r, mainConcern: { ...r.mainConcern, ...next } }));
  const setTimelineTriggers = (next: Partial<TimelineTriggers>) =>
    setResponses((r) => ({ ...r, timelineTriggers: { ...r.timelineTriggers, ...next } }));
  const setMedicalHistory = (next: Partial<MedicalHistory>) =>
    setResponses((r) => ({ ...r, medicalHistory: { ...r.medicalHistory, ...next } }));
  const setFemaleHistory = (next: Partial<FemaleHistory>) =>
    setResponses((r) => ({ ...r, femaleHistory: { ...r.femaleHistory, ...next } }));
  const setMaleHistory = (next: Partial<MaleHistory>) =>
    setResponses((r) => ({ ...r, maleHistory: { ...r.maleHistory, ...next } }));
  const setLifestyleTreatments = (next: Partial<LifestyleTreatments>) =>
    setResponses((r) => ({ ...r, lifestyleTreatments: { ...r.lifestyleTreatments, ...next } }));
  const setUploadsNextSteps = (next: Partial<UploadsNextSteps>) =>
    setResponses((r) => ({ ...r, uploadsNextSteps: { ...r.uploadsNextSteps, ...next } }));

  const sexAtBirth = a.sexAtBirth;
  const showFemale = sexAtBirth === "female";
  const showMale = sexAtBirth === "male";

  return (
    <main className="min-h-screen text-white" style={{ background: BG }}>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-sm tracking-widest text-[rgb(198,167,94)]">
              Hair Longevity Institute™ — Longevity
            </div>
            <h1 className="mt-2 text-3xl font-semibold">Longevity intake</h1>
            <p className="mt-2 text-white/70">
              Structured intake for your care pathway. Save progress and return anytime.
            </p>
          </div>
          <Link className="text-sm text-white/70 hover:text-white" href="/longevity">
            ← Back
          </Link>
        </div>

        {step !== "welcome" && step !== "identify" && step !== "done" && (
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[rgb(198,167,94)]" style={{ width: `${progress}%` }} />
            </div>
            {savedAt && Date.now() - savedAt < 3000 && (
              <p className="mt-2 text-xs text-emerald-400">Saved</p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6">
          {step === "welcome" && (
            <Card>
              <h2 className="text-2xl font-semibold">Welcome</h2>
              <p className="mt-3 text-white/70">
                This intake helps us understand your history and goals. You can save and resume later.
                Your information is kept confidential and used only for your care pathway.
              </p>
              <div className="mt-6 flex gap-3">
                <Button onClick={() => setStep("identify")}>Begin</Button>
                <Link href="/longevity/dashboard">
                  <Button variant="secondary">I have a draft</Button>
                </Link>
              </div>
            </Card>
          )}

          {step === "identify" && (
            <Card>
              <h2 className="text-2xl font-semibold">Get started</h2>
              <p className="mt-2 text-white/70">
                We’ll create a draft linked to your email so you can save and resume.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Input
                  label="Email"
                  value={identifyEmail}
                  onChange={setIdentifyEmail}
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <Input
                  label="Full name (optional for now)"
                  value={identifyName}
                  onChange={setIdentifyName}
                  placeholder="e.g. Jane Smith"
                />
              </div>
              <div className="mt-8 flex gap-3">
                <Button variant="secondary" onClick={() => setStep("welcome")}>
                  Back
                </Button>
                <Button onClick={createDraft} disabled={saving}>
                  {saving ? "Creating…" : "Create draft & continue"}
                </Button>
              </div>
            </Card>
          )}

          {step === "aboutYou" && (
            <Card>
              <div className="text-sm tracking-widest text-[rgb(198,167,94)]">Step 1</div>
              <h2 className="mt-2 text-2xl font-semibold">About you</h2>
              <p className="mt-2 text-white/70">Basic details and how we can contact you.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Input label="First name" value={a.firstName ?? ""} onChange={(v) => setAboutYou({ firstName: v })} placeholder="First name" />
                <Input label="Last name" value={a.lastName ?? ""} onChange={(v) => setAboutYou({ lastName: v })} placeholder="Last name" />
                <Input label="Email" value={a.email ?? identifyEmail} onChange={(v) => setAboutYou({ email: v })} type="email" required />
                <Input label="Mobile" value={a.mobile ?? ""} onChange={(v) => setAboutYou({ mobile: v })} placeholder="+61 400 000 000" />
                <Input label="Date of birth" value={a.dateOfBirth ?? ""} onChange={(v) => setAboutYou({ dateOfBirth: v })} type="date" />
                <SingleSelect<SexAtBirth>
                  label="Sex at birth"
                  value={a.sexAtBirth}
                  options={[
                    { key: "female", label: "Female" },
                    { key: "male", label: "Male" },
                    { key: "intersex", label: "Intersex" },
                    { key: "prefer_not_to_say", label: "Prefer not to say" },
                  ]}
                  onChange={(k) => setAboutYou({ sexAtBirth: k })}
                />
                <Input label="Country" value={a.country ?? ""} onChange={(v) => setAboutYou({ country: v })} placeholder="e.g. Australia" />
                <Input label="State / Region" value={a.stateRegion ?? ""} onChange={(v) => setAboutYou({ stateRegion: v })} placeholder="e.g. NSW" />
                <Input label="City" value={a.city ?? ""} onChange={(v) => setAboutYou({ city: v })} placeholder="City" />
                <Input label="Postcode" value={a.postcode ?? ""} onChange={(v) => setAboutYou({ postcode: v })} placeholder="Postcode" />
              </div>
              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="text-sm font-medium text-white/90">GP (optional)</div>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Input label="GP name" value={a.gp?.name ?? ""} onChange={(v) => setAboutYou({ gp: { ...a.gp, name: v } })} />
                  <Input label="Clinic" value={a.gp?.clinic ?? ""} onChange={(v) => setAboutYou({ gp: { ...a.gp, clinic: v } })} />
                  <Input label="GP email" value={a.gp?.email ?? ""} onChange={(v) => setAboutYou({ gp: { ...a.gp, email: v } })} type="email" />
                  <Input label="GP phone" value={a.gp?.phone ?? ""} onChange={(v) => setAboutYou({ gp: { ...a.gp, phone: v } })} />
                </div>
              </div>
              <div className="mt-6 border-t border-white/10 pt-6 space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={a.consents?.healthData ?? false} onChange={(e) => setAboutYou({ consents: { ...a.consents, healthData: e.target.checked } })} className="rounded border-white/20" />
                  <span className="text-sm text-white/80">I consent to my health data being used for this intake and care pathway.</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={a.consents?.aiAssist ?? false} onChange={(e) => setAboutYou({ consents: { ...a.consents, aiAssist: e.target.checked } })} className="rounded border-white/20" />
                  <span className="text-sm text-white/80">I consent to AI-assisted analysis where used to support my care.</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={a.consents?.documentGeneration ?? false} onChange={(e) => setAboutYou({ consents: { ...a.consents, documentGeneration: e.target.checked } })} className="rounded border-white/20" />
                  <span className="text-sm text-white/80">I consent to document generation (e.g. summaries or letters) where part of my pathway.</span>
                </label>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep("identify")}>Back</Button>
                <Button onClick={() => goNext("mainConcern")} disabled={saving}>Save & continue</Button>
              </div>
            </Card>
          )}

          {step === "mainConcern" && (
            <Card>
              <div className="text-sm tracking-widest text-[rgb(198,167,94)]">Step 2</div>
              <h2 className="mt-2 text-2xl font-semibold">Main concern</h2>
              <p className="mt-2 text-white/70">What brings you in? Select all that apply.</p>
              <div className="mt-6 space-y-6">
                <MultiSelect label="Primary concerns" options={PRIMARY_CONCERNS} value={mc.primaryConcerns ?? []} onChange={(v) => setMainConcern({ primaryConcerns: v })} />
                <SingleSelect label="When did you first notice?" value={mc.firstNoticed} options={FIRST_NOTICED} onChange={(k) => setMainConcern({ firstNoticed: k as MainConcern["firstNoticed"] })} />
                <SingleSelect label="Onset pattern" value={mc.onsetPattern} options={ONSET_PATTERN} onChange={(k) => setMainConcern({ onsetPattern: k as MainConcern["onsetPattern"] })} />
                <MultiSelect label="Affected areas" options={AFFECTED_AREAS} value={mc.affectedAreas ?? []} onChange={(v) => setMainConcern({ affectedAreas: v })} />
                <MultiSelect label="Symptoms" options={SYMPTOMS} value={mc.symptoms ?? []} onChange={(v) => setMainConcern({ symptoms: v })} />
                <div>
                  <label className="text-sm text-white/75">Anything else? (optional)</label>
                  <textarea className="mt-2 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-white outline-none focus:border-[rgb(198,167,94)]" rows={3} value={mc.freeText ?? ""} onChange={(e) => setMainConcern({ freeText: e.target.value })} placeholder="Free text…" />
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep("aboutYou")}>Back</Button>
                <Button onClick={() => goNext("timelineTriggers")} disabled={saving}>Save & continue</Button>
              </div>
            </Card>
          )}

          {step === "timelineTriggers" && (
            <Card>
              <div className="text-sm tracking-widest text-[rgb(198,167,94)]">Step 3</div>
              <h2 className="mt-2 text-2xl font-semibold">Timeline and triggers</h2>
              <p className="mt-2 text-white/70">Events that may relate to changes in your hair.</p>
              <div className="mt-6 space-y-6">
                <MultiSelect label="Triggers around the time of change" options={TRIGGERS} value={tt.triggers ?? []} onChange={(v) => setTimelineTriggers({ triggers: v })} />
                <MultiSelect label="Past year events" options={PAST_YEAR_EVENTS} value={tt.pastYearEvents ?? []} onChange={(v) => setTimelineTriggers({ pastYearEvents: v })} />
                <SingleSelect label="Shedding trend" value={tt.sheddingTrend} options={[{ key: "stable", label: "Stable" }, { key: "improved", label: "Improved" }, { key: "worsened", label: "Worsened" }, { key: "comes_and_goes", label: "Comes and goes" }]} onChange={(k) => setTimelineTriggers({ sheddingTrend: k })} />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep("mainConcern")}>Back</Button>
                <Button onClick={() => goNext("medicalHistory")} disabled={saving}>Save & continue</Button>
              </div>
            </Card>
          )}

          {step === "medicalHistory" && (
            <Card>
              <div className="text-sm tracking-widest text-[rgb(198,167,94)]">Step 4</div>
              <h2 className="mt-2 text-2xl font-semibold">Medical history</h2>
              <p className="mt-2 text-white/70">Relevant diagnoses and blood work.</p>
              <div className="mt-6 space-y-6">
                <MultiSelect label="Diagnoses (select any that apply)" options={DIAGNOSES} value={mh.diagnoses ?? []} onChange={(v) => setMedicalHistory({ diagnoses: v })} />
                <MultiSelect label="Current symptoms" options={CURRENT_SYMPTOMS} value={mh.currentSymptoms ?? []} onChange={(v) => setMedicalHistory({ currentSymptoms: v })} />
                <MultiSelect label="Family history" options={FAMILY_HISTORY} value={mh.familyHistory ?? []} onChange={(v) => setMedicalHistory({ familyHistory: v })} />
                <SingleSelect
                  label="Prior blood tests"
                  value={mh.priorBloodTests}
                  options={[
                    { key: "last_3_months", label: "In the last 3 months" },
                    { key: "older_than_3_months", label: "Older than 3 months" },
                    { key: "no", label: "No" },
                    { key: "unsure", label: "Unsure" },
                  ]}
                  onChange={(k) => setMedicalHistory({ priorBloodTests: k })}
                />
                <SingleSelect
                  label="Do you want to upload blood results in this intake?"
                  value={mh.wantsToUploadBloodsNow === true ? "yes" : mh.wantsToUploadBloodsNow === false ? "no" : "skip"}
                  options={[
                    { key: "yes", label: "Yes" },
                    { key: "no", label: "No" },
                    { key: "skip", label: "Skip" },
                  ]}
                  onChange={(k) => setMedicalHistory({ wantsToUploadBloodsNow: k === "yes" ? true : k === "no" ? false : null })}
                />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep("timelineTriggers")}>Back</Button>
                <Button onClick={() => goNext("sexSpecific")} disabled={saving}>Save & continue</Button>
              </div>
            </Card>
          )}

          {step === "sexSpecific" && (
            <Card>
              <div className="text-sm tracking-widest text-[rgb(198,167,94)]">Step 5</div>
              <h2 className="mt-2 text-2xl font-semibold">Sex-specific history</h2>
              <p className="mt-2 text-white/70">
                Optional. This helps tailor interpretation where relevant.
              </p>
              {showFemale && (
                <div className="mt-6 space-y-6">
                  <SingleSelect
                    label="Cycles"
                    value={fh.cycles}
                    options={[
                      { key: "regular", label: "Regular" },
                      { key: "irregular", label: "Irregular" },
                      { key: "not_occurring", label: "Not occurring" },
                      { key: "prefer_not_to_say", label: "Prefer not to say" },
                    ]}
                    onChange={(k) => setFemaleHistory({ cycles: k })}
                  />
                  <MultiSelect label="Features" options={FEMALE_FEATURES} value={fh.features ?? []} onChange={(v) => setFemaleHistory({ features: v })} />
                  <MultiSelect label="Life stage" options={FEMALE_LIFE_STAGE} value={fh.lifeStage ?? []} onChange={(v) => setFemaleHistory({ lifeStage: v })} />
                </div>
              )}
              {showMale && (
                <div className="mt-6 space-y-6">
                  <MultiSelect label="Therapies or medications" options={MALE_THERAPIES} value={mhMale.therapies ?? []} onChange={(v) => setMaleHistory({ therapies: v })} />
                  <MultiSelect label="Associated changes" options={MALE_ASSOCIATED_CHANGES} value={mhMale.associatedChanges ?? []} onChange={(v) => setMaleHistory({ associatedChanges: v })} />
                </div>
              )}
              {(sexAtBirth === "intersex" || sexAtBirth === "prefer_not_to_say" || !sexAtBirth) && (
                <p className="mt-6 text-white/60">You can skip this step.</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep("medicalHistory")}>Back</Button>
                <Button onClick={() => goNext("lifestyleTreatments")} disabled={saving}>Save & continue</Button>
              </div>
            </Card>
          )}

          {step === "lifestyleTreatments" && (
            <Card>
              <div className="text-sm tracking-widest text-[rgb(198,167,94)]">Step 6</div>
              <h2 className="mt-2 text-2xl font-semibold">Lifestyle and treatments</h2>
              <p className="mt-2 text-white/70">Diet, sleep, stress and current treatments.</p>
              <div className="mt-6 space-y-6">
                <MultiSelect label="Diet pattern" options={DIET_PATTERN} value={lt.dietPattern ?? []} onChange={(v) => setLifestyleTreatments({ dietPattern: v })} />
                <SingleSelect label="Enough protein?" value={lt.enoughProtein} options={[{ key: "yes", label: "Yes" }, { key: "no", label: "No" }, { key: "unsure", label: "Unsure" }]} onChange={(k) => setLifestyleTreatments({ enoughProtein: k })} />
                <div>
                  <label className="text-sm text-white/75">Stress level (1–10)</label>
                  <input type="range" min={1} max={10} value={lt.stressScore ?? 5} onChange={(e) => setLifestyleTreatments({ stressScore: parseInt(e.target.value, 10) })} className="mt-2 w-full" />
                  <span className="ml-2 text-sm text-white/70">{lt.stressScore ?? 5}</span>
                </div>
                <SingleSelect label="Sleep quality" value={lt.sleepQuality} options={[{ key: "good", label: "Good" }, { key: "average", label: "Average" }, { key: "poor", label: "Poor" }]} onChange={(k) => setLifestyleTreatments({ sleepQuality: k })} />
                <MultiSelect label="Current treatments or supplements" options={CURRENT_TREATMENTS} value={lt.currentTreatments ?? []} onChange={(v) => setLifestyleTreatments({ currentTreatments: v })} />
                <SingleSelect label="Have current treatments been helpful?" value={lt.treatmentHelpfulness} options={[{ key: "yes", label: "Yes" }, { key: "no", label: "No" }, { key: "unsure", label: "Unsure" }]} onChange={(k) => setLifestyleTreatments({ treatmentHelpfulness: k })} />
                <SingleSelect
                  label="Overall treatment response so far"
                  value={lt.treatmentResponse}
                  options={[
                    { key: "improved", label: "Improved" },
                    { key: "no_change", label: "No clear change" },
                    { key: "worsened", label: "Worsened" },
                    { key: "uncertain", label: "Uncertain / too early to tell" },
                  ]}
                  onChange={(k) => setLifestyleTreatments({ treatmentResponse: k })}
                />
                <div>
                  <label className="text-sm text-white/75">Medications or supplements (free text, optional)</label>
                  <textarea className="mt-2 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-white outline-none focus:border-[rgb(198,167,94)]" rows={2} value={lt.medicationsSupplementsFreeText ?? ""} onChange={(e) => setLifestyleTreatments({ medicationsSupplementsFreeText: e.target.value })} />
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep("sexSpecific")}>Back</Button>
                <Button onClick={() => goNext("uploadsNextSteps")} disabled={saving}>Save & continue</Button>
              </div>
            </Card>
          )}

          {step === "uploadsNextSteps" && (
            <Card>
              <div className="text-sm tracking-widest text-[rgb(198,167,94)]">Step 7</div>
              <h2 className="mt-2 text-2xl font-semibold">Uploads and next steps</h2>
              <p className="mt-2 text-white/70">
                Upload blood test results, scalp photos, or medical letters. PDF or image, max 10 MB per file.
              </p>
              {!intakeId ? (
                <p className="mt-4 text-sm text-amber-200">Save your intake first to upload documents.</p>
              ) : (
                <>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white/90">Blood test results (PDF or image)</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="mt-2 block w-full text-sm text-white/80 file:mr-3 file:rounded-xl file:border-0 file:bg-[rgb(198,167,94)]/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleDocumentUpload("blood_test_upload", f);
                          e.target.value = "";
                        }}
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/90">Scalp photographs (image)</label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="mt-2 block w-full text-sm text-white/80 file:mr-3 file:rounded-xl file:border-0 file:bg-[rgb(198,167,94)]/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleDocumentUpload("scalp_photo", f);
                          e.target.value = "";
                        }}
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/90">Medical / specialist letters (PDF or image)</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="mt-2 block w-full text-sm text-white/80 file:mr-3 file:rounded-xl file:border-0 file:bg-[rgb(198,167,94)]/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleDocumentUpload("medical_letter", f);
                          e.target.value = "";
                        }}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  {uploading && <p className="mt-2 text-sm text-[rgb(198,167,94)]">Uploading…</p>}
                  {uploadError && (
                    <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {uploadError}
                    </div>
                  )}
                  {stepDocuments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-white/80">Uploaded for this intake</p>
                      <ul className="mt-2 space-y-1 text-sm text-white/60">
                        {stepDocuments.map((d) => (
                          <li key={d.id}>
                            {d.filename ?? "File"} ({d.doc_type.replace(/_/g, " ")})
                            {d.size_bytes != null && ` · ${(d.size_bytes / 1024).toFixed(1)} KB`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              <div className="mt-6 space-y-4">
                <MultiSelect label="What do you have available?" options={AVAILABLE_UPLOADS} value={un.availableUploads ?? []} onChange={(v) => setUploadsNextSteps({ availableUploads: v })} />
                <SingleSelect
                  label="Current blood work status"
                  value={un.currentBloodStatus}
                  options={[
                    { key: "uploading_now", label: "Uploading now" },
                    { key: "upload_later", label: "I’ll upload later" },
                    { key: "not_done", label: "Not done" },
                    { key: "unsure", label: "Unsure" },
                  ]}
                  onChange={(k) => setUploadsNextSteps({ currentBloodStatus: k })}
                />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep("lifestyleTreatments")}>Back</Button>
                <Button onClick={() => goNext("review")} disabled={saving}>Save & continue</Button>
              </div>
            </Card>
          )}

          {step === "review" && (
            <Card>
              <div className="text-sm tracking-widest text-[rgb(198,167,94)]">Step 8</div>
              <h2 className="mt-2 text-2xl font-semibold">Review and submit</h2>
              <p className="mt-2 text-white/70">
                Confirm your details. You can go back to edit any step before submitting.
              </p>
              <dl className="mt-6 space-y-2 text-sm">
                <div><span className="text-white/60">Name:</span> {(a.firstName || a.lastName) ? [a.firstName, a.lastName].filter(Boolean).join(" ") : "—"}</div>
                <div><span className="text-white/60">Email:</span> {a.email || "—"}</div>
                <div><span className="text-white/60">Primary concerns:</span> {(mc.primaryConcerns?.length) ? mc.primaryConcerns.join(", ") : "—"}</div>
                <div><span className="text-white/60">Prior blood tests:</span> {mh.priorBloodTests ?? "—"}</div>
                <div><span className="text-white/60">Current blood status:</span> {un.currentBloodStatus ?? "—"}</div>
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setStep("uploadsNextSteps")}>Back</Button>
                <Button onClick={submitIntake} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit intake"}
                </Button>
              </div>
            </Card>
          )}

          {step === "done" && (
            <Card>
              <h2 className="text-2xl font-semibold">Submitted</h2>
              <p className="mt-3 text-white/70">
                Your longevity intake has been submitted. You can view status on your dashboard. If
                blood work or further steps are part of your pathway, we’ll guide you through those
                next.
              </p>
              <Link href="/longevity/dashboard" className="mt-6 inline-block">
                <Button>Go to dashboard</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
