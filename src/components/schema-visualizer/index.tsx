"use client";

import {
  Background,
  type Edge,
  MiniMap,
  type Node,
  type NodeTypes,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { LayoutGroup, motion } from "motion/react";
import type { SchemaRelation, SchemaTable } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { FullScreenButton } from "../full-screen-button";
import { getLayoutedElements, nodeDefaults } from "./layout-utils";
import { DBTableNode } from "./table-node";

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

  useEffect(() => {
    const { nodes, edges } = getLayoutedElements(
      tables.map((table) => {
        return {
          id: table.name,
          type: "dbTable",
          data: table,
          ...nodeDefaults,
        } as Node<SchemaTable>;
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
          } as Edge;
        },
      ),
    );

    flowInstance?.setNodes(nodes);
    flowInstance?.setEdges(edges);
    setTimeout(() => {
      flowInstance.fitView({});
      flowInstance.zoomTo(0.8);
    });
  }, [flowInstance, relations, tables]);

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

        {/* @ts-ignore */}
        <ReactFlow
          defaultNodes={[]}
          className="size-full"
          nodeTypes={nodeTypes as unknown as NodeTypes}
          defaultEdges={[]}
          fitView
          // minZoom={0.8}
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
