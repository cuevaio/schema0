import dagre from "@dagrejs/dagre";
import { type Edge, type Node, Position } from "@xyflow/react";
import type { SchemaTable } from "@/lib/db/types";

export const TABLE_NODE_WIDTH = 800;
export const TABLE_NODE_ROW_HEIGHT = 80;

export const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

export const getLayoutedElements = (
  nodes: Node<SchemaTable>[],
  edges: Edge[],
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "LR",
    align: "UR",
    nodesep: 40,
    ranksep: 80,
    marginx: 20,
    marginy: 20,
  });

  nodes.forEach((node) => {
    const scaledWidth = (TABLE_NODE_WIDTH / 2) * 0.75;
    const scaledRowHeight = (TABLE_NODE_ROW_HEIGHT / 2) * 0.75;
    const nodeHeight = scaledRowHeight * (node.data.columns.length + 1); // columns + header

    dagreGraph.setNode(node.id, {
      width: scaledWidth,
      height: nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const layoutNode = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;

    node.position = {
      x: layoutNode.x - layoutNode.width / 2,
      y: layoutNode.y - layoutNode.height / 2,
    };

    return node;
  });

  return { nodes, edges };
};
