"use client";

import { useMemo, useState } from "react";

type QuadKey = "stabilise" | "optimise" | "monitor" | "candidate";

type Quad = {
  key: QuadKey;
  title: string;
  desc: string;
  exampleTitle: string;
  exampleBullets: string[];
  recommendedFocus: string[];
};

const GOLD = "rgb(198,167,94)";

export default function SurgicalReadinessMatrixInteractive() {
  const quads: Quad[] = useMemo(
    () => [
      {
        key: "stabilise",
        title: "Stabilise First",
        desc: "Low biological stability with fast progression. Surgery is delayed until control is achieved.",
        exampleTitle: "Case example",
        exampleBullets: [
          "Diffuse shedding + rapidly worsening density over 8–12 weeks",
          "Elevated inflammatory markers and stress load",
          "Low ferritin / vitamin D or thyroid conversion concerns",
        ],
        recommendedFocus: [
          "Stabilise biology first (inflammation, iron, thyroid, cortisol)",
          "Reassess Hair Longevity Score™ at 8–12 weeks",
          "Only consider surgery once progression is controlled",
        ],
      },
      {
        key: "optimise",
        title: "Medical Optimisation",
        desc: "Fast progression but stronger biological stability. Targeted optimisation recommended.",
        exampleTitle: "Case example",
        exampleBullets: [
          "Classic recession pattern accelerating over 6–12 months",
          "Hormones suggest higher androgen exposure risk",
          "Inflammation moderate but manageable",
        ],
        recommendedFocus: [
          "Target androgen exposure and scalp environment",
          "Add regenerative support if indicated",
          "Create a staged plan (stabilise → then consider surgery)",
        ],
      },
      {
        key: "monitor",
        title: "Monitor & Correct",
        desc: "Slow progression but biological weaknesses present. Focus on correction before intervention.",
        exampleTitle: "Case example",
        exampleBullets: [
          "Gradual thinning over 3+ years",
          "Low ferritin or suboptimal thyroid conversion",
          "Scalp symptoms (itch/flaking) suggesting barrier disruption",
        ],
        recommendedFocus: [
          "Correct deficiencies and scalp inflammation",
          "Monitor progression and stabilise long-term",
          "Reassess in 3–6 months before making irreversible decisions",
        ],
      },
      {
        key: "candidate",
        title: "Surgical Candidate",
        desc: "High stability and slow progression. Appropriate for strategic density correction.",
        exampleTitle: "Case example",
        exampleBullets: [
          "Stable pattern thinning with minimal recent progression",
          "Good nutrient sufficiency and controlled inflammation",
          "Realistic goals and donor preservation considered",
        ],
        recommendedFocus: [
          "Proceed strategically (density + natural design)",
          "Plan donor protection and long-term maintenance",
          "Use regenerative adjuncts to support healing as appropriate",
        ],
      },
    ],
    []
  );

  const [active, setActive] = useState<QuadKey | null>("candidate"); // default highlight

  const activeQuad = quads.find((q) => q.key === active) || quads[3];

  return (
    <div className="w-full">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Matrix */}
        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
          {/* Axes lines */}
          <div className="pointer-events-none absolute left-1/2 top-6 bottom-6 w-[1px] bg-[rgba(198,167,94,0.18)]" />
          <div className="pointer-events-none absolute top-1/2 left-6 right-6 h-[1px] bg-[rgba(198,167,94,0.18)]" />

          <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6">
            {/* top-left */}
            <QuadCard
              quad={quads[0]}
              isActive={active === quads[0].key}
              onActivate={() => setActive(quads[0].key)}
              onDeactivate={() => setActive((a) => (a === quads[0].key ? a : a))}
            />
            {/* top-right */}
            <QuadCard
              quad={quads[1]}
              isActive={active === quads[1].key}
              onActivate={() => setActive(quads[1].key)}
              onDeactivate={() => setActive((a) => (a === quads[1].key ? a : a))}
            />
            {/* bottom-left */}
            <QuadCard
              quad={quads[2]}
              isActive={active === quads[2].key}
              onActivate={() => setActive(quads[2].key)}
              onDeactivate={() => setActive((a) => (a === quads[2].key ? a : a))}
            />
            {/* bottom-right */}
            <QuadCard
              quad={quads[3]}
              isActive={active === quads[3].key}
              onActivate={() => setActive(quads[3].key)}
              onDeactivate={() => setActive((a) => (a === quads[3].key ? a : a))}
              highlight
            />
          </div>

          {/* X axis labels */}
          <div className="mt-6 flex justify-between text-xs sm:text-sm text-white/60">
            <span>Low Biological Stability</span>
            <span>High Biological Stability</span>
          </div>

          {/* Y axis label (desktop) */}
          <div className="hidden lg:block absolute left-[-88px] top-1/2 -translate-y-1/2 rotate-[-90deg] text-sm text-white/60">
            Slow Progression → Fast Progression
          </div>

          {/* Y axis label (mobile) */}
          <div className="mt-3 lg:hidden text-xs text-white/60">
            Slow Progression → Fast Progression
          </div>

          <div className="mt-4 text-xs text-white/50">
            Tip: Hover (desktop) or tap (mobile) a quadrant to see a real-world example.
          </div>
        </div>

        {/* Case Example Panel */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="text-xs tracking-widest text-[rgb(198,167,94)]">
            CLINICAL EXAMPLE
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">{activeQuad.title}</h3>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{activeQuad.desc}</p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
            <div className="text-sm font-semibold text-white">{activeQuad.exampleTitle}</div>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              {activeQuad.exampleBullets.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5">
            <div className="text-sm font-semibold text-white">Recommended focus</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeQuad.recommendedFocus.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-[rgba(198,167,94,0.22)] bg-[rgba(198,167,94,0.08)] px-3 py-1 text-xs text-white/90"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 text-xs text-white/55">
            This matrix supports decision-making and timing. It does not guarantee outcomes and does not replace
            medical diagnosis where required.
          </div>
        </div>
      </div>
    </div>
  );
}

function QuadCard({
  quad,
  isActive,
  onActivate,
  highlight,
}: {
  quad: Quad;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      className={[
        "text-left rounded-2xl border p-5 sm:p-6 transition",
        "bg-black/10",
        isActive
          ? `border-[rgba(198,167,94,0.9)] bg-[rgba(198,167,94,0.10)]`
          : "border-white/10 hover:bg-white/5",
        highlight && !isActive ? "ring-1 ring-[rgba(198,167,94,0.18)]" : "",
      ].join(" ")}
    >
      <div className="text-base font-semibold text-white">{quad.title}</div>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{quad.desc}</p>

      <div className="mt-4 text-xs text-white/55">
        {isActive ? (
          <span className="text-[rgb(198,167,94)]">Selected</span>
        ) : (
          <span>Hover or tap to view case example</span>
        )}
      </div>

      {/* subtle indicator */}
      <div
        className="mt-4 h-[2px] w-full rounded-full"
        style={{
          background: isActive ? GOLD : "rgba(255,255,255,0.08)",
        }}
      />
    </button>
  );
}
