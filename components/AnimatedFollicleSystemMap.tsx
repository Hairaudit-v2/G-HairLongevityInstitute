"use client";

import { motion } from "framer-motion";

const gold = "rgb(198,167,94)";
const platinum = "#D9D9D6";
const sage = "rgba(79,107,99,0.6)";

export default function AnimatedFollicleSystemMap() {
  const lines = [
    [300, 300, 300, 80],
    [300, 300, 510, 200],
    [300, 300, 450, 470],
    [300, 300, 150, 470],
    [300, 300, 90, 200],
  ];

  const domains = [
    { x: 300, y: 80, label: "Androgen Exposure" },
    { x: 510, y: 200, label: "Inflammatory Load" },
    { x: 450, y: 470, label: "Thyroid & Metabolic" },
    { x: 150, y: 470, label: "Nutrient Sufficiency" },
    { x: 90, y: 200, label: "Stress & Cortisol" },
  ];

  return (
    <div className="flex justify-center">
      <div className="relative w-[600px] h-[600px] max-w-full">

        <svg viewBox="0 0 600 600" className="w-full h-full">

          {/* Outer Circle */}
          <motion.circle
            cx="300"
            cy="300"
            r="220"
            fill="none"
            stroke="rgba(198,167,94,0.15)"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Lines animate sequentially */}
          {lines.map((line, i) => (
            <motion.line
              key={i}
              x1={line[0]}
              y1={line[1]}
              x2={line[2]}
              y2={line[3]}
              stroke="rgba(198,167,94,0.3)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.4 + i * 0.2 }}
            />
          ))}

          {/* Central Node Pulse */}
          <motion.circle
            cx="300"
            cy="300"
            r="90"
            fill="rgba(198,167,94,0.1)"
            stroke={gold}
            strokeWidth="2"
            animate={{
              boxShadow: [
                "0 0 0px rgba(198,167,94,0.3)",
                "0 0 25px rgba(198,167,94,0.4)",
                "0 0 0px rgba(198,167,94,0.3)",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }}
          />

          <text
            x="300"
            y="285"
            textAnchor="middle"
            fill={platinum}
            fontSize="18"
            fontWeight="600"
          >
            FOLLICLE
          </text>
          <text
            x="300"
            y="310"
            textAnchor="middle"
            fill={platinum}
            fontSize="18"
            fontWeight="600"
          >
            STABILITY
          </text>

          {/* Domain Nodes with Hover Glow */}
          {domains.map((node, i) => (
            <motion.g
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="65"
                fill="rgba(79,107,99,0.08)"
                stroke={sage}
                strokeWidth="1.5"
                whileHover={{ stroke: gold, fill: "rgba(198,167,94,0.08)" }}
              />

              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                fill={platinum}
                fontSize="13"
                fontWeight="500"
              >
                {node.label.split(" ").map((line, idx) => (
                  <tspan key={idx} x={node.x} dy={idx === 0 ? "-0.2em" : "1.2em"}>
                    {line}
                  </tspan>
                ))}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}
