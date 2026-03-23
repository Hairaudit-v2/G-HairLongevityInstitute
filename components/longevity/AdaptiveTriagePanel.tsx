"use client";

import type { AdaptiveDerivedSummary } from "@/lib/longevity/schema";

type Props = {
  triage: AdaptiveDerivedSummary;
  uploadGuidance: string[];
  clinicianAttentionFlags: string[];
  redFlags: string[];
};

function formatToken(token: string): string {
  return token.replace(/_/g, " ");
}

export function AdaptiveTriagePanel({
  triage,
  uploadGuidance,
  clinicianAttentionFlags,
  redFlags,
}: Props) {
  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-medium text-white/90">Adaptive triage (internal)</h3>
      <p className="mt-1 text-xs text-white/55">
        Clinician-oriented pathway signal from adaptive intake responses.
      </p>
      <div className="mt-3 grid gap-2 text-sm text-white/80">
        <p>
          <span className="text-white/60">Primary pathway:</span>{" "}
          {triage.primary_pathway ? formatToken(triage.primary_pathway) : "—"}
        </p>
        <p>
          <span className="text-white/60">Secondary pathways:</span>{" "}
          {triage.secondary_pathways?.length
            ? triage.secondary_pathways.map(formatToken).join(", ")
            : "—"}
        </p>
        {triage.confidence_summary ? (
          <p>
            <span className="text-white/60">Confidence summary:</span>{" "}
            {triage.confidence_summary}
          </p>
        ) : null}
      </div>

      {clinicianAttentionFlags.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/55">Clinician attention flags</p>
          <ul className="mt-1 space-y-1 text-xs text-amber-200/90">
            {clinicianAttentionFlags.map((flag) => (
              <li key={flag}>• {formatToken(flag)}</li>
            ))}
          </ul>
        </div>
      )}

      {redFlags.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/55">Red flags</p>
          <ul className="mt-1 space-y-1 text-xs text-red-200/90">
            {redFlags.map((flag) => (
              <li key={flag}>• {formatToken(flag)}</li>
            ))}
          </ul>
        </div>
      )}

      {uploadGuidance.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/55">Suggested upload guidance</p>
          <ul className="mt-1 space-y-1 text-xs text-white/75">
            {uploadGuidance.map((item) => (
              <li key={item}>• {formatToken(item)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

