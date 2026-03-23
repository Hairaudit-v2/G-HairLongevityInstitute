"use client";

import type { AdaptiveRescoreComparison } from "@/lib/longevity/intake";

type Props = {
  comparison: AdaptiveRescoreComparison;
};

function pretty(value: string): string {
  return value.replace(/_/g, " ");
}

export function AdaptiveRescoreComparisonPanel({ comparison }: Props) {
  if (!comparison.changed) return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
      <h4 className="text-sm font-medium text-amber-100">
        Adaptive re-score delta (current engine vs stored)
      </h4>
      <p className="mt-1 text-xs text-amber-200/80">{comparison.summary_note}</p>

      <div className="mt-3 grid gap-2 text-xs text-amber-100/90">
        <p>
          <span className="text-amber-200/70">Stored schema:</span>{" "}
          {comparison.stored_schema_version ?? "unknown"}{" "}
          <span className="text-amber-200/50">| Current schema:</span>{" "}
          {comparison.current_schema_version}
        </p>
        <p>
          <span className="text-amber-200/70">Stored primary:</span>{" "}
          {comparison.stored_primary_pathway
            ? pretty(comparison.stored_primary_pathway)
            : "—"}{" "}
          <span className="text-amber-200/50">| Current primary:</span>{" "}
          {pretty(comparison.current_primary_pathway)}
        </p>
        {comparison.changed_fields.length > 0 && (
          <p>
            <span className="text-amber-200/70">Changed fields:</span>{" "}
            {comparison.changed_fields.map(pretty).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

