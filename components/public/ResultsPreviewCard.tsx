"use client";

import Image from "next/image";

/**
 * Results Preview — dashboard-style preview of analysis output.
 * Static/mock data by default; pass `data` prop to show real data when wired up.
 * Purpose: show value before signup, increase conversion.
 */

export interface ProgressionPoint {
  /** Label (e.g. 0 = "Now", 5 = "5 yr"). */
  year: number;
  /** Score 0–100. */
  value: number;
}

export interface ResultsPreviewData {
  hairRiskScore: number;
  scoreLabel?: string;
  progressionPoints?: ProgressionPoint[];
  treatmentPlanItems: string[];
}

const MOCK_DATA: ResultsPreviewData = {
  hairRiskScore: 68,
  scoreLabel: "Stable range",
  progressionPoints: [
    { year: 0, value: 52 },
    { year: 1, value: 55 },
    { year: 2, value: 58 },
    { year: 3, value: 62 },
    { year: 4, value: 65 },
    { year: 5, value: 68 },
  ],
  treatmentPlanItems: [
    "Optimise ferritin (target 70+ ng/mL) — recheck in 3 months",
    "Review thyroid panel with your GP; maintain TSH in optimal range",
    "Consider topical support; we'll recommend based on your profile",
    "Reassess in 6 months with follow-up bloods and photos",
  ],
};

const CHART_WIDTH = 280;
const CHART_HEIGHT = 80;
const PADDING = { top: 8, right: 8, bottom: 24, left: 32 };

function ProgressionCurve({ points }: { points: ProgressionPoint[] }) {
  if (!points.length) return null;
  const values = points.map((p) => p.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const scaleX = (i: number) => PADDING.left + (i / (points.length - 1)) * innerWidth;
  const scaleY = (v: number) => PADDING.top + innerHeight - ((v - minV) / range) * innerHeight;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(p.value)}`)
    .join(" ");

  return (
    <figure className="rounded-lg bg-[rgb(var(--bg-page))]/80 p-3" aria-hidden>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-[72px] w-full max-w-[280px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="results-preview-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--gold))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="rgb(var(--gold))" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <path
          d={`${pathD} L ${scaleX(points.length - 1)} ${innerHeight + PADDING.top} L ${PADDING.left} ${innerHeight + PADDING.top} Z`}
          fill="url(#results-preview-gradient)"
        />
        <path
          d={pathD}
          fill="none"
          stroke="rgb(var(--gold))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={PADDING.left}
          y={CHART_HEIGHT - 4}
          className="fill-[rgb(var(--text-muted))]"
          style={{ fontSize: 9, fontFamily: "inherit" }}
        >
          Now
        </text>
        <text
          x={CHART_WIDTH - PADDING.right}
          y={CHART_HEIGHT - 4}
          textAnchor="end"
          className="fill-[rgb(var(--text-muted))]"
          style={{ fontSize: 9, fontFamily: "inherit" }}
        >
          5 yr
        </text>
      </svg>
      <figcaption className="sr-only">
        Progression curve: risk score from now to 5 years
      </figcaption>
    </figure>
  );
}

export interface ResultsPreviewCardProps {
  /** When provided, replaces mock data. Omit for static preview. */
  data?: ResultsPreviewData | null;
  /** Optional className for the card wrapper. */
  className?: string;
}

export function ResultsPreviewCard({ data, className = "" }: ResultsPreviewCardProps) {
  const resolved = data ?? MOCK_DATA;
  const points = resolved.progressionPoints ?? MOCK_DATA.progressionPoints!;

  return (
    <article
      className={`overflow-hidden rounded-card border border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,244,239,0.98)_100%)] shadow-[0_20px_48px_rgba(0,0,0,0.08)] ${className}`}
      aria-labelledby="results-preview-title"
    >
      <div className="border-b border-[rgb(var(--border-soft))] bg-[linear-gradient(180deg,rgba(245,240,235,0.96)_0%,rgba(255,255,255,1)_100%)] px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/hli-mark.png"
            alt="Hair Longevity Institute"
            width={40}
            height={40}
            className="h-12 w-12 object-contain opacity-90"
            sizes="3rem"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--gold))]">
              Example output
            </p>
            <h2 id="results-preview-title" className="font-semibold text-[rgb(var(--text-primary))]">
              Hair Risk Score & plan
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {/* Hair Risk Score — prominent */}
        <div className="grid gap-4 rounded-card border border-[rgb(var(--border-soft))] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold text-[rgb(var(--text-secondary))]">Hair Risk Score</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-[rgb(var(--text-primary))]">
              {resolved.hairRiskScore}
              <span className="ml-1 text-lg font-normal text-[rgb(var(--text-muted))]">/ 100</span>
            </p>
            {resolved.scoreLabel && (
              <p className="mt-0.5 text-sm text-[rgb(var(--text-secondary))]">
                {resolved.scoreLabel}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <ProgressionCurve points={points} />
          </div>
        </div>

        <p className="text-xs font-medium text-[rgb(var(--text-secondary))]">
          Projected progression (interpretive; your report includes full context).
        </p>

        {/* Example treatment plan */}
        <div>
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Example treatment plan</h3>
          <ul className="mt-3 space-y-2 rounded-card border border-[rgb(var(--border-soft))] bg-white p-4">
            {resolved.treatmentPlanItems.map((item, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-[rgb(var(--text-secondary))] leading-relaxed"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--gold))]/60" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
