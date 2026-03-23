"use client";

import * as React from "react";
import {
  evaluateAdaptiveIntake,
  getAdaptiveQuestionBank,
  type AdaptiveAnswers,
  type AdaptiveQuestion,
} from "@/lib/longevity/intake";

type Props = {
  initialAnswers?: AdaptiveAnswers;
  onChange?: (payload: { answers: AdaptiveAnswers; triage: ReturnType<typeof evaluateAdaptiveIntake>["triage"] }) => void;
  showInternalTriagePreview?: boolean;
};

function renderInput(
  question: AdaptiveQuestion,
  value: unknown,
  onValueChange: (value: unknown) => void,
) {
  switch (question.answerType) {
    case "boolean":
      return (
        <div className="flex gap-3">
          <button
            type="button"
            className={`rounded-xl border px-4 py-2 ${value === true ? "border-white bg-white/10" : "border-white/15"}`}
            onClick={() => onValueChange(true)}
          >
            Yes
          </button>
          <button
            type="button"
            className={`rounded-xl border px-4 py-2 ${value === false ? "border-white bg-white/10" : "border-white/15"}`}
            onClick={() => onValueChange(false)}
          >
            No
          </button>
        </div>
      );

    case "single_select":
      return (
        <div className="grid gap-2">
          {question.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-xl border px-4 py-3 text-left ${
                value === option.value ? "border-white bg-white/10" : "border-white/15"
              }`}
              onClick={() => onValueChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      );

    case "multi_select": {
      const current = Array.isArray(value) ? value : [];
      return (
        <div className="grid gap-2">
          {question.options?.map((option) => {
            const active = current.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={`rounded-xl border px-4 py-3 text-left ${
                  active ? "border-white bg-white/10" : "border-white/15"
                }`}
                onClick={() => {
                  const next = active
                    ? current.filter((v: string) => v !== option.value)
                    : [...current, option.value];
                  onValueChange(next);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }

    case "date":
      return (
        <input
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3"
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onValueChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3"
        />
      );

    case "text":
    default:
      return (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3"
          rows={4}
        />
      );
  }
}

export function AdaptiveIntakeFlow({ initialAnswers, onChange, showInternalTriagePreview = false }: Props) {
  const [answers, setAnswers] = React.useState<AdaptiveAnswers>(initialAnswers ?? {});
  const questionBank = React.useMemo(() => getAdaptiveQuestionBank(), []);
  const result = React.useMemo(() => evaluateAdaptiveIntake(answers), [answers]);

  const visibleQuestions = React.useMemo(
    () => questionBank.filter((q) => result.visibleQuestionIds.includes(q.id)),
    [questionBank, result.visibleQuestionIds],
  );

  React.useEffect(() => {
    onChange?.({ answers, triage: result.triage });
  }, [answers, result.triage, onChange]);

  const completed = visibleQuestions.filter((q) => {
    const value = answers[q.id];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  }).length;

  const progress = visibleQuestions.length > 0 ? Math.round((completed / visibleQuestions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-sm text-white/70">Progress</div>
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-white" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 text-sm text-white/70">{progress}% complete</div>
      </div>

      <div className="space-y-6">
        {visibleQuestions.map((question) => (
          <div key={question.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="mb-2 text-base font-medium text-white">{question.prompt}</div>
            {question.helpText ? <div className="mb-3 text-sm text-white/65">{question.helpText}</div> : null}
            {question.sensitive ? (
              <div className="mb-3 text-xs text-white/50">
                This helps your clinician understand possible contributors. You may skip where appropriate.
              </div>
            ) : null}

            {renderInput(question, answers[question.id], (nextValue) => {
              setAnswers((prev) => ({ ...prev, [question.id]: nextValue as never }));
            })}
          </div>
        ))}
      </div>

      {showInternalTriagePreview ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-2 text-sm font-medium text-white">Internal triage preview</div>
          <div className="text-sm text-white/70">
            This should remain clinician-facing unless you already have a safe patient-approved display layer.
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-black/30 p-4 text-xs text-white/80">
            {JSON.stringify(result.triage, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export default AdaptiveIntakeFlow;
