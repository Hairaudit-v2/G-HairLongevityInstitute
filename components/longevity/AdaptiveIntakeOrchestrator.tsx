"use client";

import { useMemo } from "react";
import {
  buildIntakeTriageOutput,
  estimateAdaptiveProgress,
  getNextAdaptiveQuestions,
  type IntakeAnswerMap,
  type IntakeEngineContext,
} from "@/lib/longevity/intake";

import { IntakeHelpBlock } from "./IntakeHelpBlock";

type Props = {
  answers: IntakeAnswerMap;
  context: IntakeEngineContext;
  onChange: (questionId: string, value: string | string[] | boolean | null) => void;
  mode: "intake" | "review";
};

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function optionAriaLabel(label: string, description?: string): string {
  return description ? `${label}. ${description}` : label;
}

export function AdaptiveIntakeOrchestrator({ answers, context, onChange, mode }: Props) {
  const questions = useMemo(() => getNextAdaptiveQuestions(answers, context), [answers, context]);
  const progress = useMemo(() => estimateAdaptiveProgress(answers, context), [answers, context]);
  const triage = useMemo(() => buildIntakeTriageOutput(answers, context), [answers, context]);

  if (mode === "review") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-white/70">
          Internal triage summary (clinician-oriented): helps the team prioritise possible contributors.
        </p>
        <dl className="mt-3 space-y-1 text-sm text-white/80">
          <div><span className="text-white/60">Primary pathway:</span> {triage.primary_pathway}</div>
          <div><span className="text-white/60">Secondary pathways:</span> {triage.secondary_pathways.join(", ") || "—"}</div>
          <div><span className="text-white/60">Confidence:</span> {triage.confidence_summary}</div>
        </dl>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Adaptive interview progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-[rgb(198,167,94)]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {questions.map((q) => {
        const shortHelp = q.helpText ?? q.safeHelperText;
        return (
          <div key={q.id} className="space-y-2">
            <div className="text-sm font-medium text-white/90">{q.label}</div>
            <IntakeHelpBlock helpText={shortHelp} explanation={q.explanation} />

            {q.type === "single_select" && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => onChange(q.id, opt.value)}
                    title={opt.description}
                    aria-label={optionAriaLabel(opt.label, opt.description)}
                    className={`max-w-full rounded-xl border px-3 py-2 text-left text-sm ${
                      answers[q.id] === opt.value
                        ? "border-[rgb(198,167,94)] bg-[rgb(198,167,94)]/10 text-white"
                        : "border-white/10 bg-white/5 text-white/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {q.type === "multi_select" && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const selected = asArray(answers[q.id]).includes(opt.value);
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      title={opt.description}
                      aria-label={optionAriaLabel(opt.label, opt.description)}
                      aria-pressed={selected}
                      onClick={() => {
                        const arr = asArray(answers[q.id]);
                        const next = selected ? arr.filter((v) => v !== opt.value) : [...arr, opt.value];
                        onChange(q.id, next);
                      }}
                      className={`max-w-full rounded-xl border px-3 py-2 text-left text-sm ${
                        selected
                          ? "border-[rgb(198,167,94)] bg-[rgb(198,167,94)]/10 text-white"
                          : "border-white/10 bg-white/5 text-white/80"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
