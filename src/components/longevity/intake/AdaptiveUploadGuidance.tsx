"use client";

import * as React from "react";
import { ADAPTIVE_UPLOAD_GUIDANCE_LABELS, type UploadGuideId } from "@/lib/longevity/intake";

type Props = {
  guidance: UploadGuideId[];
};

export function AdaptiveUploadGuidance({ guidance }: Props) {
  if (!guidance.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-2 text-base font-medium text-white">Helpful photo guidance</div>
      <div className="mb-3 text-sm text-white/70">
        These images can help your clinician review possible contributing patterns more clearly.
      </div>
      <ul className="space-y-2 text-sm text-white/80">
        {guidance.map((item) => (
          <li key={item}>• {ADAPTIVE_UPLOAD_GUIDANCE_LABELS[item]}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdaptiveUploadGuidance;
