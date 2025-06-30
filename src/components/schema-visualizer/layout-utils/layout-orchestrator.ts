import dagre from "@dagrejs/dagre";
import { type Edge, type Node, Position } from "@xyflow/react";
import type { SchemaTable } from "@/lib/db/types";
import { groupNodesByComponents } from "./component-grouper";
import { LAYOUT_THRESHOLDS } from "./constants";
import {
  calculateOptimalSpacing,
  getOptimalLayoutConfig,
} from "./layout-configurator";
import {
  calculateNodeHeight,
  calculateNodeWidth,
  optimizeComponentLayout,
} from "./node-optimizer";
import { analyzeTableImportance } from "./table-analyzer";
import type { TableType } from "./types";

export const getLayoutedElements = (
  nodes: Node<SchemaTable>[],
  edges: Edge[],
) => {
  if (nodes.length === 0) return { nodes, edges };

  const { connectionCount, tableTypes } = analyzeTableImportance(nodes, edges);
  const components = groupNodesByComponents(nodes, edges);

  const layoutState = initializeLayoutState();
  const layoutedNodes: Node<SchemaTable>[] = [];

  components.forEach((componentNodeIds, componentIndex) => {
    const componentData = extractComponentData(nodes, edges, componentNodeIds);
    const processedComponent = processComponent(
      componentData,
      tableTypes,
      connectionCount,
      nodes.length,
      edges.length,
    );

    updateLayoutState(layoutState, processedComponent, componentIndex > 0);
    layoutedNodes.push(...processedComponent.nodes);
  });

  return { nodes: layoutedNodes, edges };
};

const initializeLayoutState = () => ({
  globalOffsetX: 0,
  globalOffsetY: 0,
  maxRowHeight: 0,
  currentRowWidth: 0,
});

const extractComponentData = (
  nodes: Node<SchemaTable>[],
  edges: Edge[],
  componentNodeIds: string[],
) => ({
  nodes: nodes.filter((node) => componentNodeIds.includes(node.id)),
  edges: edges.filter(
    (edge) =>
      componentNodeIds.includes(edge.source) &&
      componentNodeIds.includes(edge.target),
  ),
});

const processComponent = (
  componentData: { nodes: Node<SchemaTable>[]; edges: Edge[] },
  tableTypes: Map<string, TableType>,
  connectionCount: Map<string, number>,
  totalNodes: number,
  totalEdges: number,
) => {
  const { nodes: componentNodes, edges: componentEdges } = componentData;

  const optimizedNodes = optimizeComponentLayout(
    componentNodes,
    componentEdges,
    tableTypes,
    connectionCount,
  );

  const layoutConfig = createFinalLayoutConfig(
    optimizedNodes,
    componentEdges,
    totalNodes,
    totalEdges,
  );

  const positionedNodes = layoutNodesWithDagre(
    optimizedNodes,
    componentEdges,
    layoutConfig,
  );
  const bounds = calculateComponentBounds(positionedNodes);

  return { nodes: positionedNodes, bounds };
};

const createFinalLayoutConfig = (
  componentNodes: Node<SchemaTable>[],
  componentEdges: Edge[],
  totalNodes: number,
  totalEdges: number,
) => {
  const optimalSpacing = calculateOptimalSpacing(
    componentNodes,
    componentEdges,
  );
  const layoutConfig = getOptimalLayoutConfig(
    totalNodes,
    totalEdges,
    componentNodes.length,
  );

  const finalConfig = {
    ...layoutConfig,
    ranksep: Math.max(optimalSpacing.ranksep, layoutConfig.ranksep),
    nodesep: Math.max(optimalSpacing.nodesep, layoutConfig.nodesep),
    rankSep: 100,
    edgeSep: 20,
    nodeSep: optimalSpacing.nodesep,
  };

  if (componentNodes.length > LAYOUT_THRESHOLDS.VERY_LARGE_COMPONENT) {
    finalConfig.rankdir = "TB";
    finalConfig.align = "DL";
  } else if (componentNodes.length > LAYOUT_THRESHOLDS.MODERATE_COMPONENT) {
    finalConfig.align = "UL";
  }

  return finalConfig;
};

const layoutNodesWithDagre = (
  optimizedNodes: Node<SchemaTable>[],
  componentEdges: Edge[],
  layoutConfig: any,
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph(layoutConfig);

  optimizedNodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: calculateNodeWidth(),
      height: calculateNodeHeight(node),
    });
  });

  componentEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return optimizedNodes.map((node) => {
    const layoutNode = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: {
        x: layoutNode.x - layoutNode.width / 2,
        y: layoutNode.y - layoutNode.height / 2,
      },
    };
  });
};

const calculateComponentBounds = (nodes: Node<SchemaTable>[]) => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    const width = calculateNodeWidth();
    const height = calculateNodeHeight(node);

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return {
    width: maxX - minX,
    height: maxY - minY,
    minX,
    minY,
  };
};

const updateLayoutState = (
  layoutState: any,
  processedComponent: any,
  hasOffsetCheck: boolean,
) => {
  const { bounds } = processedComponent;

  if (
    hasOffsetCheck &&
    layoutState.currentRowWidth + bounds.width > LAYOUT_THRESHOLDS.MAX_ROW_WIDTH
  ) {
    layoutState.globalOffsetX = 0;
    layoutState.globalOffsetY +=
      layoutState.maxRowHeight + LAYOUT_THRESHOLDS.ROW_SPACING;
    layoutState.currentRowWidth = 0;
    layoutState.maxRowHeight = 0;
  }

  processedComponent.nodes.forEach((node: Node<SchemaTable>) => {
    node.position.x =
      layoutState.globalOffsetX + (node.position.x - bounds.minX);
    node.position.y =
      layoutState.globalOffsetY + (node.position.y - bounds.minY);
  });

  layoutState.maxRowHeight = Math.max(layoutState.maxRowHeight, bounds.height);
  layoutState.currentRowWidth +=
    bounds.width + LAYOUT_THRESHOLDS.COMPONENT_SPACING;
  layoutState.globalOffsetX +=
    bounds.width + LAYOUT_THRESHOLDS.COMPONENT_SPACING;
};
