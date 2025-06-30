"use client";

import { BaseEdge, type EdgeProps, getBezierPath } from "@xyflow/react";
import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { EdgeData } from "./utils/highlight-nodes-edges";

const PARTICLE_COUNT = 6;
const ANIMATE_DURATION = 2.5;
const GLOW_PARTICLES = 3;

export const RelationshipEdge: FC<EdgeProps> = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  id,
  data,
  style,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isHighlighted = (data as EdgeData)?.isHighlighted;

  const baseStyle = {
    stroke: isHighlighted ? "#00D9FF" : "var(--foreground)",
    strokeWidth: isHighlighted ? 2.5 : 1,
    transition: "stroke 0.3s ease, stroke-width 0.3s ease",
    filter: isHighlighted ? "drop-shadow(0 0 8px #00D9FF80)" : "none",
    ...style,
  };

  const particleColors = [
    "#00D9FF", // Electric cyan
    "#1DD8A6", // Teal
    "#4A9EFF", // Bright blue
    "#32D74B", // Green
    "#FF0080", // Magenta
    "#FFD700", // Gold
  ];

  const mainParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: `${id}-main-${particleColors[i % particleColors.length]}-${i * ANIMATE_DURATION}`,
    color: particleColors[i % particleColors.length],
    beginOffset: -i * (ANIMATE_DURATION / PARTICLE_COUNT),
    index: i,
  }));

  const glowParticles = Array.from({ length: GLOW_PARTICLES }, (_, i) => ({
    id: `${id}-glow-${i * ANIMATE_DURATION * 1.5}`,
    beginOffset: -i * (ANIMATE_DURATION / GLOW_PARTICLES) - 0.5,
    index: i,
  }));

  const pulseParticles = Array.from({ length: 2 }, (_, i) => ({
    id: `${id}-pulse-${i * ANIMATE_DURATION * 0.8}`,
    beginOffset: -i * 1.5,
    index: i,
  }));

  return (
    <>
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D9FF" stopOpacity="1" />
          <stop offset="70%" stopColor="#1DD8A6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4A9EFF" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id={`pulse-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
          <stop offset="50%" stopColor="#FF0080" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        style={baseStyle}
        className={cn(
          "transition-all duration-300",
          isHighlighted && "animate-pulse",
        )}
      />

      {isHighlighted && (
        <>
          {/* Main flowing particles */}
          {mainParticles.map((particle) => (
            <ellipse
              key={particle.id}
              rx="3"
              ry="1.5"
              fill={particle.color}
              opacity="0.9"
              filter={`drop-shadow(0 0 6px ${particle.color})`}
            >
              <animateMotion
                begin={`${particle.beginOffset}s`}
                dur={`${ANIMATE_DURATION}s`}
                repeatCount="indefinite"
                rotate="auto"
                path={edgePath}
                calcMode="spline"
                keySplines="0.25, 0.46, 0.45, 0.94"
              />
            </ellipse>
          ))}

          {/* Glow trail particles */}
          {glowParticles.map((particle) => (
            <circle
              key={particle.id}
              r="5"
              fill={`url(#glow-${id})`}
              opacity="0.4"
            >
              <animateMotion
                begin={`${particle.beginOffset}s`}
                dur={`${ANIMATE_DURATION * 1.5}s`}
                repeatCount="indefinite"
                path={edgePath}
                calcMode="spline"
                keySplines="0.25, 0.46, 0.45, 0.94"
              />
              <animate
                attributeName="opacity"
                values="0.1;0.6;0.1"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* Pulse particles */}
          {pulseParticles.map((particle) => (
            <circle
              key={particle.id}
              r="2"
              fill={`url(#pulse-${id})`}
              opacity="0.8"
            >
              <animateMotion
                begin={`${particle.beginOffset}s`}
                dur={`${ANIMATE_DURATION * 0.8}s`}
                repeatCount="indefinite"
                path={edgePath}
                calcMode="spline"
                keySplines="0.68, -0.55, 0.265, 1.55"
              />
              <animate
                attributeName="r"
                values="2;4;2"
                dur="0.8s"
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </>
      )}
    </>
  );
};
