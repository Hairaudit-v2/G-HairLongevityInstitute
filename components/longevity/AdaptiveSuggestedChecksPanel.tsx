"use client";

import type { AdaptiveClinicianSuggestion } from "@/lib/longevity/intake";

type Props = {
  suggestions: AdaptiveClinicianSuggestion[];
};

export function AdaptiveSuggestedChecksPanel({ suggestions }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
      <h4 className="text-sm font-medium text-white/90">Suggested next checks</h4>
      <p className="mt-1 text-xs text-white/55">
        Internal operational prompts only. Final clinical judgment remains with the trichologist.
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-white/80">
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>• {suggestion.message}</li>
        ))}
      </ul>
    </div>
  );
}

