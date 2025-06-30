import type { Edge, Node } from "@xyflow/react";
import type { SchemaTable } from "@/lib/db/types";

type TargetTableName = string;
type RelatedTableName = string;
type EdgeMap = Map<TargetTableName, Set<RelatedTableName>>;

export interface TableNodeData extends SchemaTable, Record<string, unknown> {
  isHighlighted?: boolean;
  isActiveHighlighted?: boolean;
}

export interface EdgeData extends Record<string, unknown> {
  isHighlighted?: boolean;
}

const isTableNode = (node: Node): node is Node<TableNodeData> => {
  return node.type === "dbTable";
};

const isActiveNode = (
  activeTableName: string | undefined,
  node: Node<TableNodeData>,
): boolean => {
  return node.data.name === activeTableName;
};

const isRelatedNodeToTarget = (
  targetTableName: string | undefined,
  edgeMap: EdgeMap,
  node: Node<TableNodeData>,
): boolean => {
  if (!targetTableName) {
    return false;
  }
  return edgeMap.get(targetTableName)?.has(node.data.name) ?? false;
};

const isHoveredNode = (
  hoverTableName: string | undefined,
  node: Node<TableNodeData>,
): boolean => {
  return node.data.name === hoverTableName;
};

const isRelatedEdgeToTarget = (
  targetTableName: string | undefined,
  edge: Edge<EdgeData>,
): boolean => {
  return edge.source === targetTableName || edge.target === targetTableName;
};

const activeHighlightNode = (
  node: Node<TableNodeData>,
): Node<TableNodeData> => ({
  ...node,
  data: {
    ...node.data,
    isActiveHighlighted: true,
    isHighlighted: false,
  },
});

const highlightNode = (node: Node<TableNodeData>): Node<TableNodeData> => ({
  ...node,
  data: {
    ...node.data,
    isHighlighted: true,
    isActiveHighlighted: false,
  },
});

const unhighlightNode = (node: Node<TableNodeData>): Node<TableNodeData> => ({
  ...node,
  data: {
    ...node.data,
    isActiveHighlighted: false,
    isHighlighted: false,
  },
});

const highlightEdge = (edge: Edge<EdgeData>): Edge<EdgeData> => ({
  ...edge,
  animated: false,
  selectable: false,
  zIndex: 1000,
  data: { ...edge.data, isHighlighted: true },
  style: {
    ...edge.style,
    stroke: "hsl(var(--primary))",
    strokeWidth: 2,
  },
});

const unhighlightEdge = (edge: Edge<EdgeData>): Edge<EdgeData> => ({
  ...edge,
  animated: true,
  selectable: false,
  zIndex: 1,
  data: { ...edge.data, isHighlighted: false },
  style: {
    ...edge.style,
    stroke: "var(--foreground)",
    strokeWidth: 1,
  },
});

export const highlightNodesAndEdges = (
  nodes: Node<TableNodeData>[],
  edges: Edge<EdgeData>[],
  trigger: {
    activeTableName?: string;
    hoverTableName?: string;
  },
): { nodes: Node<TableNodeData>[]; edges: Edge<EdgeData>[] } => {
  const { activeTableName, hoverTableName } = trigger;
  const edgeMap: EdgeMap = new Map();

  for (const edge of edges) {
    const sourceTableName = edge.source;
    const targetTableName = edge.target;
    if (!edgeMap.has(sourceTableName)) {
      edgeMap.set(sourceTableName, new Set());
    }
    if (!edgeMap.has(targetTableName)) {
      edgeMap.set(targetTableName, new Set());
    }
    edgeMap.get(sourceTableName)?.add(targetTableName);
    edgeMap.get(targetTableName)?.add(sourceTableName);
  }

  const updatedNodes = nodes.map((node) => {
    if (!isTableNode(node)) {
      return node;
    }

    if (isActiveNode(activeTableName, node)) {
      return activeHighlightNode(node);
    }

    if (
      isRelatedNodeToTarget(activeTableName, edgeMap, node) ||
      isHoveredNode(hoverTableName, node) ||
      isRelatedNodeToTarget(hoverTableName, edgeMap, node)
    ) {
      return highlightNode(node);
    }

    return unhighlightNode(node);
  });

  const updatedEdges = edges.map((edge) => {
    if (
      isRelatedEdgeToTarget(activeTableName, edge) ||
      isRelatedEdgeToTarget(hoverTableName, edge)
    ) {
      return highlightEdge(edge);
    }

    return unhighlightEdge(edge);
  });

  return { nodes: updatedNodes, edges: updatedEdges };
};
