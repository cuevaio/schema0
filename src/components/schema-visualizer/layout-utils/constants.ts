import { Position } from "@xyflow/react";

export const TABLE_NODE_WIDTH = 800;
export const TABLE_NODE_ROW_HEIGHT = 80;

export const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

export const LAYOUT_THRESHOLDS = {
  LARGE_COMPONENT: 8,
  VERY_LARGE_COMPONENT: 12,
  MODERATE_COMPONENT: 6,
  HIGH_DENSITY: 1.5,
  MODERATE_DENSITY: 1.2,
  MAX_ROW_WIDTH: 2400,
  COMPONENT_SPACING: 180,
  ROW_SPACING: 200,
};

export const BASE_SPACING = {
  ranksep: 80,
  nodesep: 50,
  marginx: 25,
  marginy: 25,
};
