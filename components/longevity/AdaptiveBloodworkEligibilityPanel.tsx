"use client";

import { REVIEW_OUTCOME } from "@/lib/longevity/reviewConstants";
import type { AdaptiveBloodworkEligibilitySupport } from "@/lib/longevity/intake";

type Props = {
  eligibility: AdaptiveBloodworkEligibilitySupport;
  onSelectOutcome?: (value: string) => void;
};

function pretty(value: string): string {
  return value.replace(/_/g, " ");
}

export function AdaptiveBloodworkEligibilityPanel({
  eligibility,
  onSelectOutcome,
}: Props) {
  if (!eligibility.eligible) return null;

  return (
    <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-500/10 p-4">
      <h4 className="text-sm font-medium text-sky-100">
        Bloodwork consideration support (internal)
      </h4>
      <p className="mt-1 text-xs text-sky-200/80">
        Conservative workflow signal only. No auto-ordering. Clinician judgment required.
      </p>
      <p className="mt-2 text-xs text-sky-100/90">
        Confidence: <span className="font-medium">{pretty(eligibility.confidence_band)}</span>
      </p>

      {eligibility.reasons.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-sky-200/70">Why this surfaced</p>
          <ul className="mt-1 space-y-1 text-xs text-sky-100/90">
            {eligibility.reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
      )}

      {eligibility.suggested_bloodwork_domains.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-sky-200/70">Suggested domains</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {eligibility.suggested_bloodwork_domains.map((domain) => (
              <span
                key={domain}
                className="rounded-full border border-sky-300/30 bg-sky-400/10 px-2 py-0.5 text-xs text-sky-100/90"
              >
                {pretty(domain)}
              </span>
            ))}
          </div>
        </div>
      )}

      {eligibility.caution_notes.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-sky-200/70">Cautions</p>
          <ul className="mt-1 space-y-1 text-xs text-sky-100/85">
            {eligibility.caution_notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>
      )}

      {onSelectOutcome && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelectOutcome(REVIEW_OUTCOME.BLOODS_RECOMMENDED)}
            className="rounded border border-sky-200/30 bg-sky-300/10 px-2.5 py-1 text-xs text-sky-100 hover:bg-sky-300/20"
          >
            Consider bloodwork
          </button>
          <button
            type="button"
            onClick={() => onSelectOutcome(REVIEW_OUTCOME.STANDARD_PATHWAY)}
            className="rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            Not needed now
          </button>
          <button
            type="button"
            onClick={() => onSelectOutcome(REVIEW_OUTCOME.AWAITING_PATIENT_DOCUMENTS)}
            className="rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            Defer pending info
          </button>
        </div>
      )}
    </div>
  );
}

