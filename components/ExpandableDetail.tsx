"use client";

import { useState, useEffect } from "react";

export interface ExpandableDetailProps {
  /** Always-visible simple explanation. */
  children: React.ReactNode;
  /** Content shown when expanded (clinical / advanced detail). */
  detail: React.ReactNode;
  /** Button label when closed. Default "Learn more". */
  labelOpen?: string;
  /** Button label when open. Default "Show less". */
  labelClosed?: string;
  /** Use "Clinical detail" instead of "Learn more" for clinician-facing sections. */
  variant?: "learn" | "clinical";
  /** Optional className for the wrapper. */
  className?: string;
  /** Optional id for the expandable (accessibility). */
  id?: string;
}

const LABELS = {
  learn: { open: "Learn more", closed: "Show less" },
  clinical: { open: "Clinical detail", closed: "Hide detail" },
};

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (!mq) return;
    setReduce(mq.matches);
    const h = () => setReduce(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduce;
}

export function ExpandableDetail({
  children,
  detail,
  labelOpen: labelOpenProp,
  labelClosed: labelClosedProp,
  variant = "learn",
  className = "",
  id,
}: ExpandableDetailProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReduceMotion();
  const labels = LABELS[variant];
  const labelOpen = labelOpenProp ?? labels.open;
  const labelClosed = labelClosedProp ?? labels.closed;
  const transitionClass = reduceMotion ? "duration-0" : "duration-300 ease-out";

  return (
    <div className={className} id={id}>
      <div className="text-neutral-700">{children}</div>
      <div className={`mt-4 grid transition-[grid-template-rows] ${transitionClass}`} style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="rounded-card border border-[rgb(var(--border-soft))] bg-subtle/80 px-4 py-4 text-sm text-[rgb(var(--text-secondary))] shadow-soft sm:px-5 sm:py-5">
            {detail}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id ? `${id}-detail` : undefined}
        id={id ? `${id}-button` : undefined}
        className="mt-3 inline-flex items-center gap-1.5 rounded text-sm font-medium text-[rgb(var(--gold))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
      >
        {open ? labelClosed : labelOpen}
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Inline variant: simple line + one expandable "Clinical detail" panel.
 * Use for section-level disclosure without wrapping existing layout.
 */
export interface ExpandableDetailPanelProps {
  /** Label for the trigger. */
  label?: string;
  /** Clinical / advanced content. */
  children: React.ReactNode;
  className?: string;
  variant?: "learn" | "clinical";
}

export function ExpandableDetailPanel({
  label,
  children,
  className = "",
  variant = "clinical",
}: ExpandableDetailPanelProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReduceMotion();
  const labels = LABELS[variant];
  const triggerLabel = open ? labels.closed : (label ?? labels.open);
  const transitionClass = reduceMotion ? "duration-0" : "duration-300 ease-out";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-[rgb(var(--gold))] hover:underline focus:outline-none focus:ring-2 focus:ring-[rgb(var(--gold))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-page))]"
      >
        {triggerLabel}
        <svg className={`h-4 w-4 transition-transform ${reduceMotion ? "" : "duration-200"} ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`mt-3 grid transition-[grid-template-rows] ${transitionClass}`} style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="rounded-card border border-[rgb(var(--border-soft))] bg-subtle/80 px-4 py-4 text-sm text-[rgb(var(--text-secondary))] shadow-soft sm:px-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpandableDetail;
