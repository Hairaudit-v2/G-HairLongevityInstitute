"use client";

import { useId, useState } from "react";

const TOGGLE_CLASS =
  "text-xs font-medium text-[rgb(198,167,94)]/95 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(198,167,94)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(15,27,45)] rounded";

/**
 * Short inline help plus optional “What does this mean?” expandable text.
 * Keeps the default view light; deeper wording only on request.
 */
export function IntakeHelpBlock({
  helpText,
  explanation,
}: {
  helpText?: string;
  explanation?: string;
}) {
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const panelId = `${baseId}-intake-explain`;

  if (!helpText && !explanation) return null;

  return (
    <div className="space-y-1.5">
      {helpText ? <p className="text-xs text-white/60">{helpText}</p> : null}
      {explanation ? (
        <div>
          <button
            type="button"
            className={TOGGLE_CLASS}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
          >
            What does this mean?
          </button>
          {open ? (
            <p
              id={panelId}
              role="region"
              className="mt-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 text-xs leading-relaxed text-white/78"
            >
              {explanation}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
