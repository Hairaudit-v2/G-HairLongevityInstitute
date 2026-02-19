"use client";

export default function FollicleSystemMap() {
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-[600px] h-[600px] max-w-full">

        <svg
          viewBox="0 0 600 600"
          className="w-full h-full"
        >
          {/* Outer connecting circle */}
          <circle
            cx="300"
            cy="300"
            r="220"
            fill="none"
            stroke="rgba(198,167,94,0.15)"
            strokeWidth="2"
          />

          {/* Connection lines */}
          {[
            [300, 300, 300, 80],
            [300, 300, 510, 200],
            [300, 300, 450, 470],
            [300, 300, 150, 470],
            [300, 300, 90, 200],
          ].map((line, i) => (
            <line
              key={i}
              x1={line[0]}
              y1={line[1]}
              x2={line[2]}
              y2={line[3]}
              stroke="rgba(198,167,94,0.3)"
              strokeWidth="1.5"
            />
          ))}

          {/* Central Node */}
          <circle
            cx="300"
            cy="300"
            r="90"
            fill="rgba(198,167,94,0.1)"
            stroke="rgb(198,167,94)"
            strokeWidth="2"
          />

          <text
            x="300"
            y="285"
            textAnchor="middle"
            fill="#D9D9D6"
            fontSize="18"
            fontWeight="600"
          >
            FOLLICLE
          </text>
          <text
            x="300"
            y="310"
            textAnchor="middle"
            fill="#D9D9D6"
            fontSize="18"
            fontWeight="600"
          >
            STABILITY
          </text>

          {/* Domain Nodes */}
          {[
            { x: 300, y: 80, label: "Androgen Exposure" },
            { x: 510, y: 200, label: "Inflammatory Load" },
            { x: 450, y: 470, label: "Thyroid & Metabolic" },
            { x: 150, y: 470, label: "Nutrient Sufficiency" },
            { x: 90, y: 200, label: "Stress & Cortisol" },
          ].map((node, i) => (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r="65"
                fill="rgba(79,107,99,0.08)"
                stroke="rgba(79,107,99,0.5)"
                strokeWidth="1.5"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                fill="#D9D9D6"
                fontSize="13"
                fontWeight="500"
              >
                {node.label.split(" ").map((line, idx) => (
                  <tspan
                    key={idx}
                    x={node.x}
                    dy={idx === 0 ? "-0.2em" : "1.2em"}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
