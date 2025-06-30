import type { Node } from "@xyflow/react";
import type { TableNodeData } from "./highlight-nodes-edges";

export const isTableNode = (node: Node): node is Node<TableNodeData> => {
  return node.type === "dbTable";
};
