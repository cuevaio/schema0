import type { Edge, Node } from "@xyflow/react";
import type { SchemaTable } from "@/lib/db/types";
import { BASE_SPACING, LAYOUT_THRESHOLDS } from "./constants";
import type { LayoutConfig, SpacingConfig } from "./types";

export const getOptimalLayoutConfig = (
  nodeCount: number,
  edgeCount: number,
  componentSize: number,
): LayoutConfig => {
  const density = edgeCount / Math.max(nodeCount, 1);
  const isLargeComponent = componentSize > LAYOUT_THRESHOLDS.LARGE_COMPONENT;
  const isHighDensity = density > LAYOUT_THRESHOLDS.HIGH_DENSITY;

  if (isLargeComponent && isHighDensity) {
    return createLargeHighDensityConfig();
  }

  if (isLargeComponent || density > 2) {
    return createLargeComponentConfig();
  }

  if (nodeCount > 15 || density > LAYOUT_THRESHOLDS.MODERATE_DENSITY) {
    return createModerateConfig();
  }

  return createDefaultConfig();
};

export const calculateOptimalSpacing = (
  componentNodes: Node<SchemaTable>[],
  edges: Edge[],
): SpacingConfig => {
  const totalColumns = componentNodes.reduce(
    (sum, node) => sum + node.data.columns.length,
    0,
  );
  const avgColumns = totalColumns / componentNodes.length;
  const edgeDensity = edges.length / Math.max(componentNodes.length, 1);

  const spacingMultiplier = Math.min(
    2,
    Math.max(0.8, (avgColumns / 5) * (1 + edgeDensity)),
  );

  return {
    ranksep: Math.round(BASE_SPACING.ranksep * spacingMultiplier),
    nodesep: Math.round(BASE_SPACING.nodesep * spacingMultiplier),
  };
};

const createLargeHighDensityConfig = (): LayoutConfig => ({
  rankdir: "TB",
  ranksep: 140,
  nodesep: 90,
  marginx: 50,
  marginy: 50,
  align: "DL",
});

const createLargeComponentConfig = (): LayoutConfig => ({
  rankdir: "LR",
  ranksep: 120,
  nodesep: 80,
  marginx: 40,
  marginy: 40,
  align: "UR",
});

const createModerateConfig = (): LayoutConfig => ({
  rankdir: "LR",
  ranksep: 100,
  nodesep: 70,
  marginx: 35,
  marginy: 35,
  align: "UL",
});

const createDefaultConfig = (): LayoutConfig => ({
  rankdir: "LR",
  ranksep: 80,
  nodesep: 50,
  marginx: 25,
  marginy: 25,
  align: "UR",
});
