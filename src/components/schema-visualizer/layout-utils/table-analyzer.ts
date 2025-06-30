import type { Edge, Node } from "@xyflow/react";
import type { SchemaTable } from "@/lib/db/types";
import type { TableAnalysis, TableType } from "./types";

export const analyzeTableImportance = (
  nodes: Node<SchemaTable>[],
  edges: Edge[],
): TableAnalysis => {
  const connectionCount = new Map<string, number>();
  const tableTypes = new Map<string, TableType>();

  nodes.forEach((node) => {
    connectionCount.set(node.id, 0);
    tableTypes.set(node.id, categorizeTable(node));
  });

  edges.forEach((edge) => {
    connectionCount.set(
      edge.source,
      (connectionCount.get(edge.source) || 0) + 1,
    );
    connectionCount.set(
      edge.target,
      (connectionCount.get(edge.target) || 0) + 1,
    );
  });

  return { connectionCount, tableTypes };
};

const categorizeTable = (node: Node<SchemaTable>): TableType => {
  const tableName = node.data.name.toLowerCase();
  const columnCount = node.data.columns.length;
  const hasTimestamps = node.data.columns.some(
    (col) => col.name.includes("created_at") || col.name.includes("updated_at"),
  );
  const foreignKeyCount = node.data.columns.filter(
    (col) => col.isForeignKey,
  ).length;

  if (isJunctionTable(tableName, columnCount, foreignKeyCount)) {
    return "junction";
  }

  if (isLogTable(tableName)) {
    return "log";
  }

  if (isLookupTable(columnCount, hasTimestamps)) {
    return "lookup";
  }

  return "core";
};

const isJunctionTable = (
  name: string,
  columnCount: number,
  foreignKeyCount: number,
): boolean => {
  return name.includes("_") && columnCount <= 4 && foreignKeyCount > 2;
};

const isLogTable = (name: string): boolean => {
  return (
    name.includes("log") || name.includes("history") || name.includes("audit")
  );
};

const isLookupTable = (
  columnCount: number,
  hasTimestamps: boolean,
): boolean => {
  return columnCount <= 5 && !hasTimestamps;
};
