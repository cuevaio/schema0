"use client";

import {
  Background,
  type Edge,
  MiniMap,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import "./enhanced-styles.css";
import { LayoutGroup, motion } from "motion/react";
import type { SchemaRelation, SchemaTable } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { FullScreenButton } from "../full-screen-button";
import { getLayoutedElements, nodeDefaults } from "./layout-utils";
import { RelationshipEdge } from "./relationship-edge";
import { DBTableNode } from "./table-node";
import {
  type EdgeData,
  highlightNodesAndEdges,
  type TableNodeData,
} from "./utils";

export const SchemaVisualizer = ({
  tables,
  relations,
}: {
  tables: SchemaTable[];
  relations: SchemaRelation[];
}) => {
  const flowInstance = useReactFlow();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const nodeTypes = useMemo(
    () => ({
      dbTable: DBTableNode,
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      default: RelationshipEdge,
      smoothstep: RelationshipEdge,
    }),
    [],
  );

  const initialElements = useMemo(() => {
    return getLayoutedElements(
      tables.map((table) => {
        return {
          id: table.name,
          type: "dbTable",
          data: table as TableNodeData,
          ...nodeDefaults,
        } as Node<TableNodeData>;
      }),
      relations.map(
        ({
          referencing_table,
          referencing_column,
          referenced_table,
          referenced_column,
        }) => {
          return {
            id: `${referencing_table}_${referencing_column}_${referenced_table}_${referenced_column}`,
            source: referencing_table,
            target: referenced_table,
            sourceHandle: referencing_column,
            targetHandle: referenced_column,
            type: "smoothstep",
            data: { isHighlighted: false },
          } as Edge<EdgeData>;
        },
      ),
    );
  }, [tables, relations]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TableNodeData>>(
    initialElements.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>(
    initialElements.edges as Edge<EdgeData>[],
  );

  useEffect(() => {
    setNodes(initialElements.nodes);
    setEdges(initialElements.edges as Edge<EdgeData>[]);
    setTimeout(() => {
      flowInstance.fitView({});
      flowInstance.zoomTo(0.8);
    });
  }, [flowInstance, initialElements, setNodes, setEdges]);

  const handleMouseEnterNode: NodeMouseHandler<Node<TableNodeData>> =
    useCallback(
      (_, { id }) => {
        const { nodes: updatedNodes, edges: updatedEdges } =
          highlightNodesAndEdges(nodes, edges, {
            hoverTableName: id,
          });
        setNodes(updatedNodes);
        setEdges(updatedEdges);
      },
      [nodes, edges, setNodes, setEdges],
    );

  const handleMouseLeaveNode: NodeMouseHandler<Node<TableNodeData>> =
    useCallback(() => {
      const { nodes: updatedNodes, edges: updatedEdges } =
        highlightNodesAndEdges(nodes, edges, {
          hoverTableName: undefined,
        });
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }, [nodes, edges, setNodes, setEdges]);

  return (
    <LayoutGroup>
      <motion.div
        className={cn("relative w-full border")}
        layout
        transition={{ duration: 0.3 }}
        style={{
          height: isFullScreen ? "100vh" : "84vh",
          position: isFullScreen ? "fixed" : "relative",
          top: 0,
          left: 0,
          zIndex: isFullScreen ? 50 : 0,
        }}
      >
        <FullScreenButton
          isFullScreen={isFullScreen}
          onClick={toggleFullScreen}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={handleMouseEnterNode}
          onNodeMouseLeave={handleMouseLeaveNode}
          className="size-full"
          nodeTypes={nodeTypes as unknown as NodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.8}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
            deletable: false,
            style: {
              stroke: "var(--foreground)",
              strokeWidth: 1,
            },
          }}
        >
          <div className="react-flow__attribution hidden" />
          <MiniMap
            className="!m-0 border-t border-l"
            nodeColor={"var(--muted)"}
            nodeStrokeColor="var(--border)"
            nodeStrokeWidth={4}
            maskColor={"var(--background)"}
            bgColor="var(--background)"
            maskStrokeColor="hsl(var(--border))"
            maskStrokeWidth={1}
          />
          <Background />
        </ReactFlow>
      </motion.div>
    </LayoutGroup>
  );
};
