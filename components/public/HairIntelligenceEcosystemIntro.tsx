"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/public/PublicCTA";

export interface HairIntelligenceEcosystemIntroProps {
  startHref: string;
  exploreHref?: string;
}

function DiagramWithHLIHint() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <figure className="relative mx-auto w-full max-w-[min(100%,1100px)]">
      <div className="relative aspect-square w-full">
        <Image
          src="/diagrams/ecosystem-diagram.svg"
          alt="Hair Intelligence Ecosystem: Follicle Intelligence at centre; Hair Longevity Institute, HairAudit, and IIOHR around it."
          width={1000}
          height={1000}
          className="h-auto w-full"
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, min(1100px, 90vw)"
        />
        {/* Hover zone over HLI node (bottom-left in diagram) — optional highlight + tooltip */}
        <span
          className="absolute left-[10%] bottom-[22%] z-10 h-[22%] w-[24%] cursor-default rounded-full"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label="Hair Longevity Institute: Your diagnosis and treatment pathway"
        >
          {showTooltip && (
            <span
              className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-[rgb(var(--gold))]/30 bg-[#2C2A26] px-3 py-2 text-xs font-medium text-white shadow-lg"
              role="tooltip"
            >
              Your diagnosis and treatment pathway
            </span>
          )}
        </span>
      </div>
      <figcaption className="mt-4 text-center text-xs text-[#8A8884]">
        Hair Longevity Institute™ — Your diagnosis and treatment pathway
      </figcaption>
    </figure>
  );
}

export function HairIntelligenceEcosystemIntro({
  startHref,
  exploreHref = "#full-ecosystem",
}: HairIntelligenceEcosystemIntroProps) {
  return (
    <section
      id="hair-intelligence-ecosystem"
      className="scroll-mt-20 bg-[#F9F9F7] py-16 sm:py-20 md:py-24"
      aria-labelledby="hair-intelligence-ecosystem-heading"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Text block */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">
              Connected system
            </p>
            <h2
              id="hair-intelligence-ecosystem-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-[#2C2A26] sm:text-4xl"
            >
              The Hair Intelligence Ecosystem
            </h2>
            <p className="mt-4 text-lg font-medium text-[#5C5A56]">
              Hair Longevity is part of a unified system connecting diagnosis,
              treatment, surgical audit, and clinical intelligence.
            </p>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-[#2C2A26]">
              <p>
                Your journey doesn&apos;t exist in isolation. Every diagnosis,
                treatment response, and surgical outcome feeds into a larger
                intelligence network — improving accuracy, predicting outcomes,
                and continuously refining results.
              </p>
              <p>
                This is where Hair Longevity connects with surgical audit and
                advanced analysis to deliver a truly personalised pathway.
              </p>
            </div>
          </div>

          {/* Diagram */}
          <div className="flex flex-col items-center justify-center">
            <DiagramWithHLIHint />
          </div>
        </div>

        {/* CTAs below diagram on mobile; below content on desktop when side-by-side */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
          <PrimaryButton href={startHref}>Start My Hair Analysis</PrimaryButton>
          <SecondaryButton
            href={exploreHref}
            className="border-[#2C2A26]/20 bg-white/90 text-[#2C2A26] hover:bg-white focus:ring-[#2C2A26]/30 focus:ring-offset-[#F9F9F7]"
          >
            Explore the Full Ecosystem
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}
