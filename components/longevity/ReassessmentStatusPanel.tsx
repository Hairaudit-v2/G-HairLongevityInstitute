"use client";

import { REVIEW_OUTCOME } from "@/lib/longevity/reviewConstants";
import type { ReassessmentSummary } from "@/lib/longevity/reassessmentSummary";

type Props = {
  summary: ReassessmentSummary;
  onSelectOutcome?: (value: string) => void;
};

export function ReassessmentStatusPanel({ summary, onSelectOutcome }: Props) {
  return (
    <div className="mt-4 rounded-lg border border-violet-500/30 bg-violet-500/10 p-4">
      <h4 className="text-sm font-medium text-violet-100">Follow-up reassessment status (internal)</h4>
      <p className="mt-1 text-xs text-violet-200/80">{summary.operational_summary}</p>
      <p className="mt-2 text-xs text-violet-100/90">
        {summary.ready_for_reassessment ? "Ready for reassessment." : "Reassessment pending."}{" "}
        {summary.next_step}
      </p>
      {summary.comparison_anchor_at && (
        <p className="mt-1 text-[11px] text-violet-200/70">
          Comparison anchor: {new Date(summary.comparison_anchor_at).toLocaleString()}
        </p>
      )}

      <div className="mt-3 grid gap-2">
        {summary.signals.map((signal) => (
          <div
            key={signal.id}
            className={`rounded border px-2.5 py-2 text-xs ${
              signal.active
                ? "border-violet-300/35 bg-violet-300/10 text-violet-100"
                : "border-white/15 bg-black/20 text-white/65"
            }`}
          >
            <p className="font-medium">{signal.label}</p>
            <p className="mt-0.5">{signal.detail}</p>
          </div>
        ))}
      </div>

      {onSelectOutcome && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelectOutcome(REVIEW_OUTCOME.AWAITING_PATIENT_DOCUMENTS)}
            className="rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            Mark reassessment pending
          </button>
          <button
            type="button"
            onClick={() => onSelectOutcome(REVIEW_OUTCOME.REVIEW_COMPLETE)}
            className="rounded border border-violet-200/30 bg-violet-300/10 px-2.5 py-1 text-xs text-violet-100 hover:bg-violet-300/20"
          >
            Mark reassessment completed
          </button>
        </div>
      )}
    </div>
  );
}

