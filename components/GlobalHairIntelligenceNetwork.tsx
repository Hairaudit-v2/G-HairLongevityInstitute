"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const VIEW_SIZE = 1000;
const CX = 500;
const CY = 500;
const CENTER_R = 100;
const ORBIT_R = 320;
const OUTER_NODE_R = 72;

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export type GlobalNetworkVariant = "hli" | "hairaudit" | "fi";
export type GlobalNetworkTheme = "light" | "dark";

export interface NodeData {
  id: string;
  name: string;
  oneLiner: string;
  angle: number; // degrees
  placeholder?: boolean;
}

const CENTER_NODE: NodeData = {
  id: "fi",
  name: "Follicle Intelligence™",
  oneLiner: "AI analysis engine for hair biology and outcomes",
  angle: 0,
};

const OUTER_NODES: NodeData[] = [
  {
    id: "hli",
    name: "Hair Longevity Institute™",
    oneLiner: "Biological treatment pathway and diagnosis",
    angle: 150,
  },
  {
    id: "hairaudit",
    name: "HairAudit™",
    oneLiner: "Surgical audit and transparency",
    angle: 30,
  },
  {
    id: "future1",
    name: "Coming soon",
    oneLiner: "More of the ecosystem",
    angle: 270,
    placeholder: true,
  },
];

export interface GlobalHairIntelligenceNetworkProps {
  /** Which platform is rendering: used to emphasise current platform if highlightNode not set. */
  variant?: GlobalNetworkVariant;
  /** Node id to highlight (fi | hli | hairaudit | future1). */
  highlightNode?: string;
  /** Enable mouse parallax and hover tooltips. */
  interactive?: boolean;
  /** Light (default) or dark background. */
  theme?: GlobalNetworkTheme;
  /** Optional className for the wrapper. */
  className?: string;
  /** Accessibility: diagram title. */
  title?: string;
}

const LIGHT = {
  bg: "#F9F9F7",
  ringStroke: "#E8E6E0",
  lineStroke: "#D4D2CC",
  centerFill: "url(#ghin-gold-center)",
  centerStroke: "#A68B4B",
  outerFill: "#FFFFFF",
  outerStroke: "#E0DED8",
  outerDimmedFill: "rgba(255,255,255,0.5)",
  outerDimmedStroke: "#D4D2CC",
  textPrimary: "#2C2A26",
  textSecondary: "#5C5A56",
  textMuted: "#8A8884",
  networkLabel: "#8A8884",
  tooltipBg: "#2C2A26",
  tooltipText: "#F9F9F7",
};

const DARK = {
  bg: "#0F1B2D",
  ringStroke: "rgba(255,255,255,0.08)",
  lineStroke: "rgba(255,255,255,0.12)",
  centerFill: "url(#ghin-gold-center)",
  centerStroke: "#B8984A",
  outerFill: "rgba(255,255,255,0.06)",
  outerStroke: "rgba(255,255,255,0.12)",
  outerDimmedFill: "rgba(255,255,255,0.02)",
  outerDimmedStroke: "rgba(255,255,255,0.06)",
  textPrimary: "#D9D9D6",
  textSecondary: "rgba(255,255,255,0.7)",
  textMuted: "rgba(255,255,255,0.5)",
  networkLabel: "rgba(255,255,255,0.4)",
  tooltipBg: "#1a2332",
  tooltipText: "#E8E6E0",
};

export function GlobalHairIntelligenceNetwork({
  variant = "hli",
  highlightNode: highlightNodeProp,
  interactive = true,
  theme = "light",
  className = "",
  title = "Global Hair Intelligence Network",
}: GlobalHairIntelligenceNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (!mq) return;
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const highlightNode = highlightNodeProp ?? (variant === "fi" ? "fi" : variant === "hairaudit" ? "hairaudit" : "hli");
  const colors = theme === "dark" ? DARK : LIGHT;
  const parallaxEnabled = interactive && !reduceMotion;

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!parallaxEnabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      setParallax({ x: y * 4, y: -x * 4 }); // subtle tilt: max ~±4deg
    },
    [parallaxEnabled]
  );

  const onMouseLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 });
    setHoveredId(null);
  }, []);

  const transform = useMemo(() => {
    if (!parallaxEnabled || (parallax.x === 0 && parallax.y === 0)) return undefined;
    return `perspective(800px) rotateX(${parallax.x}deg) rotateY(${parallax.y}deg)`;
  }, [parallaxEnabled, parallax.x, parallax.y]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ aspectRatio: "1" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      role="img"
      aria-label={title}
    >
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        className="h-full w-full select-none transition-transform duration-150 ease-out"
        style={{ transform, transformOrigin: "50% 50%" }}
      >
        <defs>
          <linearGradient id="ghin-gold-center" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C6A75E" />
            <stop offset="100%" stopColor="#A68B4B" />
          </linearGradient>
          <filter id="ghin-center-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={VIEW_SIZE} height={VIEW_SIZE} fill={colors.bg} />

        {/* Outer ring */}
        <circle
          cx={CX}
          cy={CY}
          r={420}
          fill="none"
          stroke={colors.ringStroke}
          strokeWidth={1.5}
          opacity={0.9}
        />
        <text
          x={CX}
          y={945}
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
          fontSize={12}
          fontWeight={500}
          letterSpacing="0.2em"
          fill={colors.networkLabel}
        >
          GLOBAL HAIR INTELLIGENCE NETWORK
        </text>

        {/* Connector lines: center edge to each outer node */}
        {OUTER_NODES.map((node) => {
          const pos = polarToCartesian(CX, CY, ORBIT_R, node.angle);
          const start = polarToCartesian(CX, CY, CENTER_R, node.angle);
          return (
            <line
              key={node.id}
              x1={start.x}
              y1={start.y}
              x2={pos.x}
              y2={pos.y}
              stroke={node.placeholder ? colors.lineStroke : colors.lineStroke}
              strokeWidth={1.2}
              opacity={node.placeholder ? 0.5 : 1}
            />
          );
        })}

        {/* Center node — Follicle Intelligence */}
        <g filter="url(#ghin-center-glow)">
          <circle
            cx={CX}
            cy={CY}
            r={CENTER_R}
            fill={colors.centerFill}
            stroke={colors.centerStroke}
            strokeWidth={1.5}
          />
          <text
            x={CX}
            y={485}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
            fontSize={18}
            fontWeight={600}
            fill={colors.textPrimary}
          >
            Follicle Intelligence™
          </text>
          <text
            x={CX}
            y={508}
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontSize={12}
            fontWeight={500}
            fill={colors.textPrimary}
            opacity={0.9}
          >
            AI Analysis Engine
          </text>
          <text
            x={CX}
            y={532}
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontSize={10}
            fill={colors.textPrimary}
            opacity={0.7}
          >
            Data · Pattern Recognition · Prediction
          </text>
          {/* Invisible larger hit area for hover */}
          {interactive && (
            <circle
              cx={CX}
              cy={CY}
              r={CENTER_R}
              fill="transparent"
              onMouseEnter={() => setHoveredId("fi")}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: "pointer" }}
            />
          )}
        </g>

        {/* Outer nodes */}
        {OUTER_NODES.map((node) => {
          const pos = polarToCartesian(CX, CY, ORBIT_R, node.angle);
          const isDimmed = node.placeholder;
          const isHighlight = highlightNode === node.id;
          const isHovered = hoveredId === node.id;
          const fill = isDimmed ? colors.outerDimmedFill : colors.outerFill;
          const stroke = isDimmed ? colors.outerDimmedStroke : colors.outerStroke;
          const textOpacity = isDimmed ? 0.6 : 1;
          const scale = isHighlight || isHovered ? 1.06 : 1;

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y}) scale(${scale})`}
              style={{ cursor: interactive ? "pointer" : "default" }}
              onMouseEnter={() => interactive && setHoveredId(node.id)}
              onMouseLeave={() => interactive && setHoveredId(null)}
            >
              <circle
                r={OUTER_NODE_R}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.5}
              />
              {node.placeholder ? (
                <>
                  <text y={-5} textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize={14} fontWeight={600} fill={colors.textPrimary} opacity={textOpacity}>
                    Coming soon
                  </text>
                  <text y={12} textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize={10} fill={colors.textMuted} opacity={textOpacity}>
                    {node.oneLiner}
                  </text>
                </>
              ) : (
                <>
                  <text
                    y={node.id === "hli" ? -18 : -5}
                    textAnchor="middle"
                    fontFamily="system-ui, sans-serif"
                    fontSize={node.id === "hli" ? 13 : 15}
                    fontWeight={600}
                    fill={colors.textPrimary}
                    opacity={textOpacity}
                  >
                    {node.id === "hli" ? (
                      <>
                        <tspan x={0} dy={0}>Hair Longevity</tspan>
                        <tspan x={0} dy={16}>Institute™</tspan>
                      </>
                    ) : (
                      node.name
                    )}
                  </text>
                  <text
                    y={node.id === "hli" ? 14 : 18}
                    textAnchor="middle"
                    fontFamily="system-ui, sans-serif"
                    fontSize={10}
                    fontWeight={500}
                    fill={colors.textSecondary}
                    opacity={textOpacity}
                  >
                    {node.id === "hli" ? "Biological Treatment Pathway" : (node.id === "hairaudit" ? "Surgical Audit System" : node.oneLiner)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip: position near hovered node (percent from viewBox) */}
      {interactive && hoveredId && (() => {
        let xPct = 50;
        let yPct = 50;
        if (hoveredId === "fi") {
          xPct = 50;
          yPct = 50;
        } else {
          const node = OUTER_NODES.find((n) => n.id === hoveredId);
          if (node) {
            const pos = polarToCartesian(CX, CY, ORBIT_R, node.angle);
            xPct = (pos.x / VIEW_SIZE) * 100;
            yPct = (pos.y / VIEW_SIZE) * 100;
          }
        }
        const tooltipNode = hoveredId === "fi" ? CENTER_NODE : OUTER_NODES.find((n) => n.id === hoveredId);
        const name = tooltipNode?.name ?? hoveredId;
        const oneLiner = hoveredId === "fi" ? CENTER_NODE.oneLiner : OUTER_NODES.find((n) => n.id === hoveredId)?.oneLiner ?? "";
        return (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-neutral-200 bg-[#2C2A26] px-4 py-3 shadow-xl"
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: "translate(-50%, -100%)",
              marginTop: "-12px",
              maxWidth: "280px",
              ...(theme === "dark" && { borderColor: "rgba(255,255,255,0.15)", background: DARK.tooltipBg }),
            }}
            role="tooltip"
          >
            <p className="font-semibold text-white">{name}</p>
            <p className="mt-1 text-sm text-neutral-300">{oneLiner}</p>
          </div>
        );
      })()}
    </div>
  );
}

export default GlobalHairIntelligenceNetwork;
