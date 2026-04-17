// app/start/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createLongevitySupabaseBrowserClient } from "@/lib/longevity/supabaseBrowser";

type Sex = "male" | "female" | "other";
type PrimaryConcern = "hair_loss" | "scalp_condition" | "post_transplant" | "other";

type IntakeSelections = {
    sex?: Sex;
    primary_concern?: PrimaryConcern;

    trt?: boolean | "yes" | "no";
    dht_management?: boolean | "yes" | "no";

    // Hair loss branch
    hair_loss_type?: "receding_hairline" | "crown_thinning" | "diffuse_thinning" | "sudden_shedding" | "patchy" | "unsure";
    onset?: "0_3m" | "3_12m" | "1_3y" | "3y_plus";
    triggers?: Array<"stress" | "illness" | "postpartum" | "weight_loss" | "new_meds" | "trt" | "thyroid" | "unknown">;
    family_history?: "yes" | "no" | "unsure";

    // Scalp branch
    scalp_symptoms?: Array<"itch" | "burning" | "flaking_white" | "flaking_yellow" | "redness" | "pain" | "oozing" | "none">;

    // Post-transplant branch
    transplant_timing?: "0_1m" | "1_6m" | "6_12m" | "12m_plus";
    concerns_post_tx?: Array<"shock_loss" | "poor_growth" | "donor_thinning" | "scarring" | "density" | "hairline_design">;

    // Common
    meds?: Array<"finasteride" | "dutasteride" | "minoxidil_topical" | "minoxidil_oral" | "spironolactone" | "trt" | "none" | "other">;
    goals?: Array<"stop_shedding" | "regrow" | "thicken" | "stabilise" | "plan_transplant" | "fix_scalp">;
};

type StepId =
    | "intro"
    | "basics"
    | "sex"
    | "primary"
    | "branch"
    | "meds"
    | "goals"
    | "notes"
    | "uploads"
    | "review"
    | "done";

const LABELS = {
    sex: {
        male: "Male",
        female: "Female",
        other: "Other / Prefer not to say",
    } as Record<string, string>,

    primary_concern: {
        hair_loss: "Hair loss",
        scalp_condition: "Scalp condition",
        post_transplant: "Post-transplant support",
        other: "Other / unsure",
    } as Record<string, string>,

    hair_loss_type: {
        receding_hairline: "Receding hairline / temples",
        crown_thinning: "Crown thinning / vertex",
        diffuse_thinning: "Diffuse thinning (all over)",
        sudden_shedding: "Sudden shedding (weeks/months)",
        patchy: "Patchy loss",
        unsure: "Not sure",
    } as Record<string, string>,

    onset: {
        "0_3m": "0–3 months",
        "3_12m": "3–12 months",
        "1_3y": "1–3 years",
        "3y_plus": "3+ years",
    } as Record<string, string>,

    triggers: {
        stress: "High stress / burnout",
        illness: "Illness / infection / surgery",
        postpartum: "Postpartum / hormonal change",
        weight_loss: "Rapid weight loss / diet change",
        new_meds: "New medications",
        trt: "TRT / hormone optimisation",
        thyroid: "Thyroid concerns",
        unknown: "Not sure",
    } as Record<string, string>,

    family_history: {
        yes: "Yes",
        no: "No",
        unsure: "Unsure",
    } as Record<string, string>,

    scalp_symptoms: {
        itch: "Itch",
        burning: "Burning / tingling",
        flaking_white: "White flakes (dry scales)",
        flaking_yellow: "Yellow flakes (oily scales)",
        redness: "Redness",
        pain: "Pain / tenderness",
        oozing: "Oozing / weeping",
        none: "None / unsure",
    } as Record<string, string>,

    transplant_timing: {
        "0_1m": "0–1 month",
        "1_6m": "1–6 months",
        "6_12m": "6–12 months",
        "12m_plus": "12+ months",
    } as Record<string, string>,

    concerns_post_tx: {
        shock_loss: "Shock loss",
        poor_growth: "Poor growth / slow progress",
        donor_thinning: "Donor thinning / over-extraction worry",
        scarring: "Visible scarring",
        density: "Not enough density",
        hairline_design: "Hairline design / angles",
    } as Record<string, string>,

    meds: {
        finasteride: "Finasteride",
        dutasteride: "Dutasteride",
        minoxidil_topical: "Topical minoxidil",
        minoxidil_oral: "Oral minoxidil",
        spironolactone: "Spironolactone",
        trt: "TRT / testosterone optimisation",
        none: "None",
        other: "Other",
    } as Record<string, string>,

    goals: {
        stop_shedding: "Stop shedding",
        regrow: "Regrow",
        thicken: "Improve thickness/density",
        stabilise: "Stabilise long-term",
        plan_transplant: "Plan or optimise a transplant",
        fix_scalp: "Fix scalp symptoms",
    } as Record<string, string>,
};

function labelFrom(map: Record<string, string> | undefined, key?: string) {
    if (!key) return null;
    return map?.[key] ?? key;
}

function labelsFrom(map: Record<string, string> | undefined, keys?: string[]) {
    if (!keys?.length) return [];
    // If "none" is selected, prefer showing only "None"
    if (keys.includes("none")) return [map?.none ?? "None"];
    return keys.map((k) => map?.[k] ?? k);
}

function joinNice(items: string[]) {
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

type SummaryRow =
    | { kind: "text"; label: string; value: string }
    | { kind: "chips"; label: string; items: string[] };

function buildHumanSummary(selections: any): SummaryRow[] {
  const primary = selections.primary_concern as string | undefined;

  const rows: SummaryRow[] = [];

  const sex = labelFrom(LABELS.sex, selections.sex);
  if (sex) rows.push({ kind: "text", label: "Sex", value: sex });

  const pc = labelFrom(LABELS.primary_concern, selections.primary_concern);
  if (pc) rows.push({ kind: "text", label: "Primary concern", value: pc });

  if (primary === "hair_loss") {
    const type = labelFrom(LABELS.hair_loss_type, selections.hair_loss_type);
    const onset = labelFrom(LABELS.onset, selections.onset);
    const triggers = labelsFrom(LABELS.triggers, selections.triggers);
    const fam = labelFrom(LABELS.family_history, selections.family_history);

    if (type) rows.push({ kind: "text", label: "Hair loss pattern", value: type });
    if (onset) rows.push({ kind: "text", label: "Timeframe", value: onset });
    if (triggers.length) rows.push({ kind: "chips", label: "Likely triggers", items: triggers });
    if (fam) rows.push({ kind: "text", label: "Family history", value: fam });
  }

  if (primary === "scalp_condition") {
    const symptoms = labelsFrom(LABELS.scalp_symptoms, selections.scalp_symptoms);
    if (symptoms.length) rows.push({ kind: "chips", label: "Scalp symptoms", items: symptoms });
  }

  if (primary === "post_transplant") {
    const timing = labelFrom(LABELS.transplant_timing, selections.transplant_timing);
    const concerns = labelsFrom(LABELS.concerns_post_tx, selections.concerns_post_tx);
    if (timing) rows.push({ kind: "text", label: "Transplant timing", value: timing });
    if (concerns.length) rows.push({ kind: "chips", label: "Main concerns", items: concerns });
  }

  const meds = labelsFrom(LABELS.meds, selections.meds);
  if (meds.length) rows.push({ kind: "chips", label: "Current treatments", items: meds });

  if (selections.sex === "male") {
    const trtVal = selections.trt === true || selections.trt === "yes" ? "Yes" : selections.trt === false || selections.trt === "no" ? "No" : null;
    const dhtVal = selections.dht_management === true || selections.dht_management === "yes" ? "Yes" : selections.dht_management === false || selections.dht_management === "no" ? "No" : null;
    if (trtVal) rows.push({ kind: "text", label: "On TRT", value: trtVal });
    if (dhtVal) rows.push({ kind: "text", label: "DHT management", value: dhtVal });
  }

  const goals = labelsFrom(LABELS.goals, selections.goals);
  if (goals.length) rows.push({ kind: "chips", label: "Goals", items: goals });

  return rows;
}

const BRAND = {
    bg: "rgb(15 27 45)",
    gold: "rgb(198 167 94)",
};

function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
            {children}
        </div>
    );
}

function Button({
    children,
    onClick,
    variant = "primary",
    disabled,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
}) {
    const base =
        "inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition";
    const styles =
        variant === "primary"
            ? "bg-[rgb(198,167,94)] text-[rgb(15,27,45)] hover:opacity-90"
            : variant === "secondary"
                ? "border border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
                : "text-white/80 hover:text-white";
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`${base} ${styles} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        >
            {children}
        </button>
    );
}

function ChoiceGrid({
    title,
    subtitle,
    options,
    value,
    onChange,
}: {
    title: string;
    subtitle?: string;
    options: Array<{ key: string; label: string; help?: string }>;
    value?: string | string[];
    onChange: (key: string) => void;
}) {
    return (
        <div>
            <div className="text-sm tracking-widest text-[rgb(198,167,94)]">STEP</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
            {subtitle ? <p className="mt-3 text-white/70">{subtitle}</p> : null}
            <div className="mt-6 grid gap-3 md:grid-cols-2">
                {options.map((o) => {
                    const isSelected = Array.isArray(value) ? value.includes(o.key) : value === o.key;
                    return (
                        <button
                            key={o.key}
                            type="button"
                            onClick={() => onChange(o.key)}
                            className={`rounded-2xl border p-5 text-left transition ${isSelected
                                ? "border-[rgb(198,167,94)] bg-[rgba(198,167,94,0.10)]"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <div className="text-base font-semibold text-white">{o.label}</div>
                            {o.help ? <div className="mt-1 text-sm text-white/65">{o.help}</div> : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded-full border border-[rgba(198,167,94,0.25)] bg-[rgba(198,167,94,0.08)] px-3 py-1 text-xs text-white/90"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function StartPage() {
    const [step, setStep] = useState<StepId>("intro");

    // minimal typing
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState(""); // YYYY-MM-DD
    const [country, setCountry] = useState("");

    const [selections, setSelections] = useState<IntakeSelections>({});
    const [notes, setNotes] = useState("");

    const [bloodFiles, setBloodFiles] = useState<File[]>([]);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [uploadFilesErr, setUploadFilesErr] = useState<string | null>(null);

    const MAX_IMAGE_MB = 5;
    const MAX_PDF_MB = 15;
    const validateFiles = (files: File[], kind: "blood" | "photo") => {
        const maxImage = MAX_IMAGE_MB * 1024 * 1024;
        const maxPdf = MAX_PDF_MB * 1024 * 1024;
        const isPdf = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
        for (const f of files) {
            const max = isPdf(f) ? maxPdf : maxImage;
            if (f.size > max) {
                const limit = isPdf(f) ? MAX_PDF_MB : MAX_IMAGE_MB;
                return `${isPdf(f) ? "PDF" : "Image"} "${f.name}" exceeds ${limit} MB limit.`;
            }
        }
        return null;
    };

    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState<string | null>(null);
    const [intakeId, setIntakeId] = useState<string | null>(null);
    const [submitWarning, setSubmitWarning] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const supabase = createLongevitySupabaseBrowserClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) setIsAuthenticated(!!session);
            } catch {
                if (mounted) setIsAuthenticated(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const progress = useMemo(() => {
        const order: StepId[] = ["intro", "basics", "sex", "primary", "branch", "meds", "goals", "notes", "uploads", "review"];
        const idx = order.indexOf(step);
        if (idx < 0) return 0;
        return Math.round(((idx + 1) / order.length) * 100);
    }, [step]);

    const primary = selections.primary_concern;

    function toggleArray<K extends keyof IntakeSelections>(key: K, value: any) {
        const arr = (selections[key] as any[]) || [];
        const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
        setSelections((s) => ({ ...s, [key]: next }));
    }

    function nextAfterPrimary() {
        setStep("branch");
    }

    async function submit() {
        setSubmitting(true);
        setSubmitErr(null);
        setSubmitWarning(null);

        try {
            const fd = new FormData();
            fd.set("full_name", fullName);
            fd.set("email", email);
            fd.set("dob", dob);
            fd.set("sex", selections.sex || "");
            fd.set("country", country);
            fd.set("primary_concern", selections.primary_concern || "");
            fd.set("selections", JSON.stringify(selections));
            fd.set("notes", notes);

            bloodFiles.forEach((f) => fd.append("blood_files", f));
            photoFiles.forEach((f) => fd.append("photo_files", f));

            const res = await fetch("/api/intakes", { method: "POST", body: fd });
            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.error || "Submission failed.");
            }
            setIntakeId(json.intakeId);
            setSubmitWarning(json.warning || null);
            setStep("done");
        } catch (e: any) {
            setSubmitErr(e?.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    const canContinueBasics = fullName.trim() && email.trim() && dob.trim();
    const canContinueSex = !!selections.sex;
    const canContinuePrimary = !!selections.primary_concern;

    return (
        <main className="min-h-screen bg-[rgb(15,27,45)] text-white">
            <div className="mx-auto max-w-4xl px-6 py-10">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <div className="text-sm tracking-widest text-[rgb(198,167,94)]">
                            Hair Longevity Institute™
                        </div>
                        <h1 className="mt-2 text-3xl font-semibold">Start your diagnostic review</h1>
                        <p className="mt-2 text-white/70">
                            Fast, click-through intake. Minimal typing. Clear summary before you submit.
                        </p>
                        <p className="mt-2 text-white/70">
                            You selected{" "}
                            <span className="text-white">
                                {labelFrom(LABELS.primary_concern, selections.primary_concern) || "—"}
                            </span>
                            . Please confirm below before submitting.
                        </p>
                    </div>
                    <Link className="text-sm text-white/70 hover:text-white" href="/">
                        ← Back to home
                    </Link>
                </div>

                {/* Progress */}
                <div className="mt-8">
                    <div className="flex items-center justify-between text-xs text-white/60">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-[rgb(198,167,94)]" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="mt-8 grid gap-6">
                    {step === "intro" && (
                        <Card>
                            <h2 className="text-2xl font-semibold">Let’s get you clarity.</h2>
                            <p className="mt-3 text-white/70">
                                This takes ~2–4 minutes. You’ll answer by tapping options, then upload bloods/photos.
                            </p>
                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                <Button onClick={() => setStep("basics")}>Begin</Button>
                                <Button variant="secondary" onClick={() => setStep("basics")}>
                                    I have my blood tests ready
                                </Button>
                            </div>
                            <p className="mt-5 text-xs text-white/55">
                                We provide structured biological interpretation and strategy. Prescriptions, where required,
                                must be obtained via your local doctor or a partnered prescriber.
                            </p>
                        </Card>
                    )}

                    {step === "basics" && (
                        <Card>
                            <div className="text-sm tracking-widest text-[rgb(198,167,94)]">STEP</div>
                            <h2 className="mt-2 text-2xl font-semibold">Your details</h2>
                            <p className="mt-2 text-white/70">Just the essentials. Everything else is tap-to-select.</p>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm text-white/75">Full name *</label>
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-white outline-none focus:border-[rgb(198,167,94)]"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g., John Smith"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-white/75">Email *</label>
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-white outline-none focus:border-[rgb(198,167,94)]"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        type="email"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-white/75">Date of birth *</label>
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-white outline-none focus:border-[rgb(198,167,94)]"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        type="date"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-white/75">Country (optional)</label>
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-white outline-none focus:border-[rgb(198,167,94)]"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        placeholder="e.g., Australia"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("intro")}>
                                    Back
                                </Button>
                                <Button disabled={!canContinueBasics} onClick={() => setStep("sex")}>
                                    Continue
                                </Button>
                            </div>
                        </Card>
                    )}

                    {step === "sex" && (
                        <Card>
                            <ChoiceGrid
                                title="Select sex"
                                subtitle="This helps us interpret hormone patterns and reference ranges."
                                value={selections.sex}
                                options={[
                                    { key: "male", label: "Male" },
                                    { key: "female", label: "Female" },
                                    { key: "other", label: "Other / Prefer not to say" },
                                ]}
                                onChange={(k) => setSelections((s) => ({ ...s, sex: k as Sex }))}
                            />

                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("basics")}>
                                    Back
                                </Button>
                                <Button disabled={!canContinueSex} onClick={() => setStep("primary")}>
                                    Continue
                                </Button>
                            </div>
                        </Card>
                    )}

                    {step === "primary" && (
                        <Card>
                            <ChoiceGrid
                                title="What brings you in today?"
                                subtitle="Pick the closest match — we’ll tailor the next questions."
                                value={selections.primary_concern}
                                options={[
                                    { key: "hair_loss", label: "Hair Loss", help: "Recession, thinning, shedding, patches" },
                                    { key: "scalp_condition", label: "Scalp Condition", help: "Itch, flaking, redness, pain" },
                                    { key: "post_transplant", label: "Post-Transplant Support", help: "Growth, density, donor concerns" },
                                    { key: "other", label: "Other / Unsure", help: "We’ll clarify with a few taps" },
                                ]}
                                onChange={(k) =>
                                    setSelections((s) => ({ ...s, primary_concern: k as PrimaryConcern }))
                                }
                            />
                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("sex")}>
                                    Back
                                </Button>
                                <Button disabled={!canContinuePrimary} onClick={nextAfterPrimary}>
                                    Continue
                                </Button>
                            </div>
                        </Card>
                    )}

                    {step === "branch" && (
                        <Card>
                            {primary === "hair_loss" && (
                                <>
                                    <ChoiceGrid
                                        title="Which best describes your hair loss?"
                                        subtitle="This helps separate androgenic patterns vs shedding-driven patterns."
                                        value={selections.hair_loss_type}
                                        options={[
                                            { key: "receding_hairline", label: "Receding hairline / temples" },
                                            { key: "crown_thinning", label: "Crown thinning / vertex" },
                                            { key: "diffuse_thinning", label: "Diffuse thinning (all over)" },
                                            { key: "sudden_shedding", label: "Sudden shedding (weeks/months)" },
                                            { key: "patchy", label: "Patchy loss" },
                                            { key: "unsure", label: "Not sure" },
                                        ]}
                                        onChange={(k) => setSelections((s) => ({ ...s, hair_loss_type: k as any }))}
                                    />

                                    <div className="mt-8">
                                        <ChoiceGrid
                                            title="When did it begin?"
                                            value={selections.onset}
                                            options={[
                                                { key: "0_3m", label: "0–3 months" },
                                                { key: "3_12m", label: "3–12 months" },
                                                { key: "1_3y", label: "1–3 years" },
                                                { key: "3y_plus", label: "3+ years" },
                                            ]}
                                            onChange={(k) => setSelections((s) => ({ ...s, onset: k as any }))}
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <ChoiceGrid
                                            title="Any likely triggers? (tap all that apply)"
                                            subtitle="This helps identify TE, inflammatory drivers, medication or hormone acceleration."
                                            value={selections.triggers || []}
                                            options={[
                                                { key: "stress", label: "High stress / burnout" },
                                                { key: "illness", label: "Illness / infection / surgery" },
                                                { key: "postpartum", label: "Postpartum / hormonal change" },
                                                { key: "weight_loss", label: "Rapid weight loss / diet change" },
                                                { key: "new_meds", label: "New medications" },
                                                { key: "trt", label: "TRT / hormone optimisation" },
                                                { key: "thyroid", label: "Thyroid concerns" },
                                                { key: "unknown", label: "Not sure" },
                                            ]}
                                            onChange={(k) => toggleArray("triggers", k)}
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <ChoiceGrid
                                            title="Family history of thinning?"
                                            value={selections.family_history}
                                            options={[
                                                { key: "yes", label: "Yes" },
                                                { key: "no", label: "No" },
                                                { key: "unsure", label: "Unsure" },
                                            ]}
                                            onChange={(k) => setSelections((s) => ({ ...s, family_history: k as any }))}
                                        />
                                    </div>
                                </>
                            )}

                            {primary === "scalp_condition" && (
                                <>
                                    <ChoiceGrid
                                        title="What symptoms do you have? (tap all that apply)"
                                        subtitle="This guides likely diagnoses and what blood markers matter most."
                                        value={selections.scalp_symptoms || []}
                                        options={[
                                            { key: "itch", label: "Itch" },
                                            { key: "burning", label: "Burning / tingling" },
                                            { key: "flaking_white", label: "White flakes (dry scales)" },
                                            { key: "flaking_yellow", label: "Yellow flakes (oily scales)" },
                                            { key: "redness", label: "Redness" },
                                            { key: "pain", label: "Pain / tenderness" },
                                            { key: "oozing", label: "Oozing / weeping" },
                                            { key: "none", label: "None of these / unsure" },
                                        ]}
                                        onChange={(k) => toggleArray("scalp_symptoms", k)}
                                    />
                                </>
                            )}

                            {primary === "post_transplant" && (
                                <>
                                    <ChoiceGrid
                                        title="When was your transplant?"
                                        value={selections.transplant_timing}
                                        options={[
                                            { key: "0_1m", label: "0–1 month" },
                                            { key: "1_6m", label: "1–6 months" },
                                            { key: "6_12m", label: "6–12 months" },
                                            { key: "12m_plus", label: "12+ months" },
                                        ]}
                                        onChange={(k) => setSelections((s) => ({ ...s, transplant_timing: k as any }))}
                                    />

                                    <div className="mt-8">
                                        <ChoiceGrid
                                            title="Main concerns? (tap all that apply)"
                                            value={selections.concerns_post_tx || []}
                                            options={[
                                                { key: "shock_loss", label: "Shock loss" },
                                                { key: "poor_growth", label: "Poor growth / slow progress" },
                                                { key: "donor_thinning", label: "Donor thinning / over-extraction worry" },
                                                { key: "scarring", label: "Visible scarring" },
                                                { key: "density", label: "Not enough density" },
                                                { key: "hairline_design", label: "Hairline design / angles" },
                                            ]}
                                            onChange={(k) => toggleArray("concerns_post_tx", k)}
                                        />
                                    </div>
                                </>
                            )}

                            {primary === "other" && (
                                <p className="text-white/75">
                                    No problem — we’ll capture essentials in the next steps and you can add a note at the end.
                                </p>
                            )}

                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("primary")}>
                                    Back
                                </Button>
                                <Button onClick={() => setStep("meds")}>Continue</Button>
                            </div>
                        </Card>
                    )}

                    {step === "meds" && (
                        <Card>
                            <ChoiceGrid
                                title="Are you using any of these? (tap all that apply)"
                                subtitle="This helps interpret results and avoid duplicated recommendations."
                                value={selections.meds || []}
                                options={[
                                    { key: "finasteride", label: "Finasteride" },
                                    { key: "dutasteride", label: "Dutasteride" },
                                    { key: "minoxidil_topical", label: "Topical Minoxidil" },
                                    { key: "minoxidil_oral", label: "Oral Minoxidil" },
                                    { key: "spironolactone", label: "Spironolactone" },
                                    { key: "trt", label: "TRT / Testosterone optimisation" },
                                    { key: "none", label: "None" },
                                    { key: "other", label: "Other" },
                                ]}
                                onChange={(k) => toggleArray("meds", k)}
                            />

                            {selections.sex === "male" && (
                                <div className="mt-8 space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-white/85">On TRT? (yes/no)</div>
                                        <div className="mt-2 flex gap-2">
                                            {(["yes", "no"] as const).map((v) => {
                                                const sel = selections.trt;
                                                const on =
                                                    (v === "yes" && (sel === true || sel === "yes")) ||
                                                    (v === "no" && (sel === false || sel === "no"));
                                                return (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelections((s) => ({
                                                                ...s,
                                                                trt: v === "yes" ? true : false,
                                                            }))
                                                        }
                                                        className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                                                            on
                                                                ? "border-[rgb(198,167,94)] bg-[rgba(198,167,94,0.15)] text-white"
                                                                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                                                        }`}
                                                    >
                                                        {v === "yes" ? "Yes" : "No"}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white/85">DHT management (finasteride/dutasteride)? (yes/no)</div>
                                        <div className="mt-2 flex gap-2">
                                            {(["yes", "no"] as const).map((v) => {
                                                const sel = selections.dht_management;
                                                const on =
                                                    (v === "yes" && (sel === true || sel === "yes")) ||
                                                    (v === "no" && (sel === false || sel === "no"));
                                                return (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelections((s) => ({
                                                                ...s,
                                                                dht_management: v === "yes" ? true : false,
                                                            }))
                                                        }
                                                        className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                                                            on
                                                                ? "border-[rgb(198,167,94)] bg-[rgba(198,167,94,0.15)] text-white"
                                                                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                                                        }`}
                                                    >
                                                        {v === "yes" ? "Yes" : "No"}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("branch")}>
                                    Back
                                </Button>
                                <Button onClick={() => setStep("goals")}>Continue</Button>
                            </div>
                        </Card>
                    )}

                    {step === "goals" && (
                        <Card>
                            <ChoiceGrid
                                title="What outcome matters most right now?"
                                subtitle="Tap all that apply."
                                value={selections.goals || []}
                                options={[
                                    { key: "stop_shedding", label: "Stop shedding" },
                                    { key: "regrow", label: "Regrow" },
                                    { key: "thicken", label: "Improve thickness/density" },
                                    { key: "stabilise", label: "Stabilise long-term" },
                                    { key: "plan_transplant", label: "Plan or optimise a transplant" },
                                    { key: "fix_scalp", label: "Fix scalp symptoms" },
                                ]}
                                onChange={(k) => toggleArray("goals", k)}
                            />
                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("meds")}>
                                    Back
                                </Button>
                                <Button onClick={() => setStep("notes")}>Continue</Button>
                            </div>
                        </Card>
                    )}

                    {step === "notes" && (
                        <Card>
                            <div className="text-sm tracking-widest text-[rgb(198,167,94)]">STEP</div>
                            <h2 className="mt-2 text-2xl font-semibold">Anything else we should know?</h2>
                            <p className="mt-2 text-white/70">
                                Optional. Add key details like scalp sensitivity, dermatitis history, recent medication changes,
                                menstrual concerns, or anything you feel is relevant.
                            </p>

                            <textarea
                                className="mt-6 min-h-[140px] w-full rounded-3xl border border-white/10 bg-black/10 px-5 py-4 text-white outline-none focus:border-[rgb(198,167,94)]"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes..."
                            />

                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("goals")}>
                                    Back
                                </Button>
                                <Button onClick={() => setStep("uploads")}>Continue</Button>
                            </div>
                        </Card>
                    )}

                    {step === "uploads" && (
                        <Card>
                            <div className="text-sm tracking-widest text-[rgb(198,167,94)]">STEP</div>
                            <h2 className="mt-2 text-2xl font-semibold">Upload blood tests & photos</h2>
                            <p className="mt-2 text-white/70">
                                Bloods can be PDF or images. Photos: front hairline, temples, crown, and donor (if post-transplant).
                            </p>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">
                                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                                    <div className="text-base font-semibold">Blood tests</div>
                                    <p className="mt-1 text-sm text-white/65">
                                        PDF preferred. Max 15 MB per PDF, 5 MB per image.
                                    </p>
                                    <input
                                        className="mt-4 w-full text-sm text-white/80 file:mr-4 file:rounded-xl file:border-0 file:bg-[rgb(198,167,94)] file:px-4 file:py-2 file:text-[rgb(15,27,45)] file:font-semibold"
                                        type="file"
                                        accept="application/pdf,image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            const err = validateFiles(files, "blood");
                                            setUploadFilesErr(err);
                                            if (!err) {
                                                setBloodFiles(files);
                                                setUploadFilesErr(null);
                                            }
                                            e.target.value = "";
                                        }}
                                    />
                                    {bloodFiles.length ? (
                                        <div className="mt-3 text-xs text-white/60">
                                            Selected: {bloodFiles.length} file(s)
                                        </div>
                                    ) : null}
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                                    <div className="text-base font-semibold">Hair photos</div>
                                    <p className="mt-1 text-sm text-white/65">
                                        Max 5 MB per image. Good lighting, no filters.
                                    </p>
                                    <input
                                        className="mt-4 w-full text-sm text-white/80 file:mr-4 file:rounded-xl file:border-0 file:bg-[rgb(198,167,94)] file:px-4 file:py-2 file:text-[rgb(15,27,45)] file:font-semibold"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            const err = validateFiles(files, "photo");
                                            setUploadFilesErr(err);
                                            if (!err) {
                                                setPhotoFiles(files);
                                                setUploadFilesErr(null);
                                            }
                                            e.target.value = "";
                                        }}
                                    />
                                    {photoFiles.length ? (
                                        <div className="mt-3 text-xs text-white/60">
                                            Selected: {photoFiles.length} photo(s)
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {uploadFilesErr ? (
                                <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                                    {uploadFilesErr}
                                </div>
                            ) : null}

                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("notes")}>
                                    Back
                                </Button>
                                <Button onClick={() => setStep("review")}>Review summary</Button>
                            </div>
                        </Card>
                    )}

                    {step === "review" && (
                        <Card>
                            <div className="text-sm tracking-widest text-[rgb(198,167,94)]">REVIEW</div>
                            <h2 className="mt-2 text-2xl font-semibold">Confirm your summary</h2>
                            <p className="mt-2 text-white/70">
                                This is what we’ll use to generate your diagnostic review.
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                                    <div className="text-sm text-white/60">Name</div>
                                    <div className="mt-1">{fullName}</div>
                                    <div className="mt-4 text-sm text-white/60">Email</div>
                                    <div className="mt-1">{email}</div>
                                    <div className="mt-4 text-sm text-white/60">DOB</div>
                                    <div className="mt-1">{dob}</div>
                                    {country ? (
                                        <>
                                            <div className="mt-4 text-sm text-white/60">Country</div>
                                            <div className="mt-1">{country}</div>
                                        </>
                                    ) : null}
                                </div>

                                <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                                    <div className="text-sm text-white/60">Your clinical summary</div>

                                    <div className="mt-3 space-y-3">
                                        {buildHumanSummary(selections).map((row) => (
                                            <div key={row.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <div className="text-xs tracking-widest text-white/55">{row.label.toUpperCase()}</div>

                                                {row.kind === "text" ? (
                                                    <div className="mt-1 text-sm text-white/85">{row.value}</div>
                                                ) : (
                                                    <Chips items={row.items} />
                                                )}
                                            </div>
                                        ))}

                                        {!buildHumanSummary(selections).length ? (
                                            <div className="text-sm text-white/70">No selections captured yet.</div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-3xl border border-white/10 bg-black/10 p-5">
                                <div className="text-sm text-white/60">Uploads</div>
                                <div className="mt-2 text-sm text-white/80">
                                    Blood tests: {bloodFiles.length} file(s) • Photos: {photoFiles.length} file(s)
                                </div>
                            </div>

                            {notes ? (
                                <div className="mt-4 rounded-3xl border border-white/10 bg-black/10 p-5">
                                    <div className="text-sm text-white/60">Notes</div>
                                    <div className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{notes}</div>
                                </div>
                            ) : null}

                            {submitErr ? (
                                <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                                    {submitErr}
                                </div>
                            ) : null}

                            <div className="mt-8 grid gap-3 md:grid-cols-2">
                                <Button variant="secondary" onClick={() => setStep("uploads")}>
                                    Back
                                </Button>
                                <Button onClick={submit} disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit & Create Intake"}
                                </Button>
                            </div>

                            <p className="mt-5 text-xs text-white/55">
                                By submitting, you confirm the information is accurate to the best of your knowledge.
                            </p>
                        </Card>
                    )}

                    {step === "done" && (
                        <Card>
                            <div className="text-sm tracking-widest text-[rgb(198,167,94)]">SUBMITTED</div>
                            <h2 className="mt-2 text-2xl font-semibold">You’re in.</h2>
                            <p className="mt-3 text-white/70">
                                Your intake has been received and your diagnostic review is now underway. We’ll review your bloods/photos and update your case as it progresses.
                            </p>
                            {email ? (
                                <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-white/80">
                                    <strong className="text-white">Report delivery:</strong> We&apos;ll send your diagnostic report to{" "}
                                    <span className="text-[rgb(198,167,94)]">{email}</span> typically within 12–24 hours, depending on completeness and case complexity.
                                </div>
                            ) : null}
                            {intakeId ? (
                                <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-white/80">
                                    Reference ID: <span className="text-white">{intakeId}</span>
                                </div>
                            ) : null}
                            {submitWarning ? (
                                <div className="mt-4 rounded-2xl border border-[rgb(198,167,94)]/40 bg-[rgba(198,167,94,0.08)] p-4 text-sm text-white/85">
                                    {submitWarning}
                                </div>
                            ) : null}

                            <div className="mt-8 rounded-2xl border border-white/10 bg-black/10 p-5">
                                <h3 className="text-base font-semibold text-white">Your account</h3>
                                <p className="mt-2 text-sm text-white/75">
                                    Your submission is linked to your email address and can be accessed again through your patient portal.
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                {isAuthenticated === true ? (
                                    <Link href="/portal" className="block">
                                        <Button>Go to My Portal</Button>
                                    </Link>
                                ) : (
                                    <Link href="/portal/login" className="block">
                                        <Button>Sign in to View My Portal</Button>
                                    </Link>
                                )}
                                <Link href="/book" className="block">
                                    <Button variant="secondary">Book a specialist consult</Button>
                                </Link>
                                <Link href="/" className="block">
                                    <Button variant="secondary">Return to homepage</Button>
                                </Link>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    );
}
