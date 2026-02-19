"use client";

export default function SurgicalReadinessMatrix() {
  return (
    <div className="flex justify-center">
      <div className="w-[650px] max-w-full relative">

        <div className="relative border border-white/10 bg-white/5 rounded-3xl p-10">

          {/* Axes */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[rgba(198,167,94,0.2)]" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[rgba(198,167,94,0.2)]" />

          {/* Quadrants */}
          <div className="grid grid-cols-2 grid-rows-2 gap-6">

            <Quadrant
              title="Stabilise First"
              desc="Low biological stability and fast progression. Surgery is delayed until control is achieved."
            />

            <Quadrant
              title="Medical Optimisation"
              desc="Fast progression but strong biological markers. Targeted stabilisation recommended."
            />

            <Quadrant
              title="Monitor & Correct"
              desc="Slow progression but biological weaknesses present. Focus on correction before intervention."
            />

            <Quadrant
              title="Surgical Candidate"
              desc="High stability and slow progression. Appropriate for strategic density correction."
              highlight
            />

          </div>
        </div>

        {/* Axis Labels */}
        <div className="mt-6 flex justify-between text-sm text-white/60">
          <span>Low Biological Stability</span>
          <span>High Biological Stability</span>
        </div>

        <div className="absolute left-[-80px] top-1/2 -translate-y-1/2 rotate-[-90deg] text-sm text-white/60 whitespace-nowrap">
          Slow Progression → Fast Progression
        </div>

      </div>
    </div>
  );
}

function Quadrant({
  title,
  desc,
  highlight = false,
}: {
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 transition ${
        highlight
          ? "border-[rgb(198,167,94)] bg-[rgba(198,167,94,0.08)]"
          : "border-white/10 bg-black/10"
      }`}
    >
      <div className="text-base font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{desc}</p>
    </div>
  );
}
