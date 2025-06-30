import type { Edge, Node } from "@xyflow/react";
import type { SchemaTable } from "@/lib/db/types";
import { TABLE_NODE_ROW_HEIGHT, TABLE_NODE_WIDTH } from "./constants";
import type { HierarchicalLayers, TableType } from "./types";

export const optimizeComponentLayout = (
  componentNodes: Node<SchemaTable>[],
  _componentEdges: Edge[],
  tableTypes: Map<string, TableType>,
  connectionCount: Map<string, number>,
): Node<SchemaTable>[] => {
  const layers = createHierarchicalLayers(componentNodes, tableTypes);

  return [
    ...sortNodesByImportance(layers.core, connectionCount),
    ...sortNodesByImportance(layers.junction, connectionCount),
    ...layers.lookup,
    ...layers.log,
  ];
};

export const calculateNodeHeight = (node: Node<SchemaTable>): number => {
  const scaledRowHeight = (TABLE_NODE_ROW_HEIGHT / 2) * 0.75;
  const headerHeight = scaledRowHeight;
  const columnsHeight = scaledRowHeight * node.data.columns.length;
  return headerHeight + columnsHeight;
};

export const calculateNodeWidth = (): number => {
  return (TABLE_NODE_WIDTH / 2) * 0.75;
};

const createHierarchicalLayers = (
  nodes: Node<SchemaTable>[],
  tableTypes: Map<string, TableType>,
): HierarchicalLayers => {
  const layers: HierarchicalLayers = {
    core: [],
    junction: [],
    lookup: [],
    log: [],
  };

  nodes.forEach((node) => {
    const type = tableTypes.get(node.id) || "core";
    layers[type].push(node);
  });

  return layers;
};

const sortNodesByImportance = (
  nodes: Node<SchemaTable>[],
  connectionCount: Map<string, number>,
): Node<SchemaTable>[] => {
  return nodes.sort(
    (a, b) =>
      (connectionCount.get(b.id) || 0) - (connectionCount.get(a.id) || 0),
  );
};
