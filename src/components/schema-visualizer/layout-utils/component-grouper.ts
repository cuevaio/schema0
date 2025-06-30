import type { Edge, Node } from "@xyflow/react";
import type { SchemaTable } from "@/lib/db/types";

export const groupNodesByComponents = (
  nodes: Node<SchemaTable>[],
  edges: Edge[],
): string[][] => {
  const adjacencyList = buildAdjacencyList(nodes, edges);
  const visited = new Set<string>();
  const components: string[][] = [];

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const component: string[] = [];
      depthFirstSearch(node.id, component, adjacencyList, visited);
      components.push(component);
    }
  });

  return components.sort((a, b) => b.length - a.length);
};

const buildAdjacencyList = (
  nodes: Node<SchemaTable>[],
  edges: Edge[],
): Map<string, Set<string>> => {
  const adjacencyList = new Map<string, Set<string>>();

  nodes.forEach((node) => {
    adjacencyList.set(node.id, new Set());
  });

  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source);
  });

  return adjacencyList;
};

const depthFirstSearch = (
  nodeId: string,
  component: string[],
  adjacencyList: Map<string, Set<string>>,
  visited: Set<string>,
): void => {
  visited.add(nodeId);
  component.push(nodeId);

  adjacencyList.get(nodeId)?.forEach((neighbor) => {
    if (!visited.has(neighbor)) {
      depthFirstSearch(neighbor, component, adjacencyList, visited);
    }
  });
};
