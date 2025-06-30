import type { Edge, Node } from "@xyflow/react";
import type { SchemaTable } from "@/lib/db/types";

export type TableType = "core" | "junction" | "lookup" | "log";

export type LayoutConfig = {
  rankdir: string;
  ranksep: number;
  nodesep: number;
  marginx: number;
  marginy: number;
  align: string;
};

export type TableAnalysis = {
  connectionCount: Map<string, number>;
  tableTypes: Map<string, TableType>;
};

export type ComponentGroup = {
  nodes: Node<SchemaTable>[];
  edges: Edge[];
  bounds: {
    width: number;
    height: number;
  };
};

export type HierarchicalLayers = {
  core: Node<SchemaTable>[];
  junction: Node<SchemaTable>[];
  lookup: Node<SchemaTable>[];
  log: Node<SchemaTable>[];
};

export type SpacingConfig = {
  ranksep: number;
  nodesep: number;
};
