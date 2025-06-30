"use client";

import { Handle, type Node } from "@xyflow/react";
import {
  CircleIcon,
  DiamondIcon,
  FingerprintIcon,
  InfoIcon,
  KeyIcon,
  TableIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBadgeColor } from "@/lib/schema-utils";
import { cn } from "@/lib/utils";
import { TABLE_NODE_ROW_HEIGHT, TABLE_NODE_WIDTH } from "./layout-utils";
import { getDisplayType } from "./utils";
import type { TableNodeData } from "./utils/highlight-nodes-edges";

const DBTableNode = ({
  data: { name, columns, isHighlighted, isActiveHighlighted },
  targetPosition,
  sourcePosition,
}: Node<TableNodeData>) => {
  const getConnectorClasses = (isVisible: boolean) =>
    cn(
      "!h-px !w-px !min-w-0 !min-h-0 !cursor-grab !border-0 transition-opacity duration-300",
      isVisible ? "!opacity-100" : "!opacity-0",
    );

  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [_isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openDialog = (key: string) => {
    setOpenDrawer(key);
  };

  const closeDialog = () => {
    setOpenDrawer(null);
  };

  // Helper function to determine if enum should be collapsed based on value count and estimated width
  const shouldCollapseEnum = (column: (typeof columns)[0]) => {
    if (!column.dataType?.includes("|")) return false;

    const enumValues = column.dataType.split("|");
    const valueCount = enumValues.length;

    // Always collapse if more than 3 values to prevent overflow
    if (valueCount > 3) return true;

    // For 2-3 values, check if any individual value is too long
    const hasLongValues = enumValues.some((value) => value.length > 8);
    if (hasLongValues) return true;

    // Calculate estimated width: each badge is roughly value.length * 8px + 24px padding
    const estimatedWidth = enumValues.reduce(
      (sum, value) => sum + value.length * 8 + 32,
      0,
    );
    return estimatedWidth > 120; // Leave room for other UI elements
  };

  const tableWrapperClasses = cn(
    "text-card-foreground transition-all duration-500 ease-out rounded-lg relative",
    {
      "ring-2 shadow-lg": isHighlighted,
      "ring-4 shadow-xl": isActiveHighlighted,
    },
  );

  const ringStyle =
    isHighlighted || isActiveHighlighted
      ? {
          boxShadow: `
      0 0 0 ${isActiveHighlighted ? "4px" : "2px"} #00D9FF,
      0 0 20px #00D9FF60,
      0 0 40px #1DD8A630,
      0 4px 25px -5px rgba(0, 0, 0, 0.25)
    `,
        }
      : {};

  return (
    <div
      className={tableWrapperClasses}
      style={{
        width: (TABLE_NODE_WIDTH / 2) * 0.75,
        ...ringStyle,
      }}
      data-table-highlighted={isHighlighted || isActiveHighlighted}
    >
      <div
        className="flex items-center gap-2 overflow-hidden rounded-t-lg border-x border-t bg-background px-2"
        style={{
          height: (TABLE_NODE_ROW_HEIGHT / 2) * 0.75,
        }}
      >
        <TableIcon className="size-5 text-muted-foreground" />
        <p className="w-full truncate font-bold text-sm">{name}</p>
      </div>
      {columns.map((column) => (
        <div
          key={column.name}
          className={cn(
            "relative flex items-center justify-between border-x border-t bg-muted px-3 transition-all duration-200 last:rounded-b last:border-b",
            {
              "bg-primary/10":
                (isHighlighted || isActiveHighlighted) &&
                (column.isPrimaryKey || column.isForeignKey),
              "hover:bg-primary/5": isHighlighted || isActiveHighlighted,
            },
          )}
          style={{
            height: (TABLE_NODE_ROW_HEIGHT / 2) * 0.75,
          }}
        >
          {/* Left side: Icons + Column name */}
          <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
            {/* Constraint icons */}
            <div className="flex flex-shrink-0 items-center gap-1">
              {column.isPrimaryKey && (
                <Tooltip>
                  <TooltipTrigger>
                    <KeyIcon className="size-3.5 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Primary Key</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {!column.isPrimaryKey && column.isForeignKey && (
                <Tooltip>
                  <TooltipTrigger>
                    <KeyIcon className="size-3.5 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Foreign Key</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {column.isUnique && !column.isPrimaryKey && (
                <Tooltip>
                  <TooltipTrigger>
                    <FingerprintIcon className="size-3.5 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unique</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Column name */}
            <div className="flex-1 truncate font-semibold text-xs">
              {column.name}
            </div>
          </div>

          {/* Right side: Data type + Additional constraints */}
          <div className="flex max-w-[45%] flex-shrink-0 items-center gap-2">
            {/* Data type */}
            <div className="flex flex-wrap items-center justify-end gap-1">
              {column.defaultValue && (
                <Tooltip>
                  <TooltipTrigger>
                    <CircleIcon className="size-3.5 text-purple-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Default: {column.defaultValue}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Enum handling with improved overflow logic */}
              {column.dataType?.includes("|") ? (
                shouldCollapseEnum(column) ? (
                  <>
                    {/* Drawer trigger for mobile */}
                    <div className="flex md:hidden">
                      <Badge
                        variant="outline"
                        onClick={() => openDialog(column.name)}
                        className={cn(
                          getBadgeColor("enum-raw"),
                          "cursor-pointer whitespace-nowrap text-xs",
                        )}
                      >
                        <span className="mr-1">
                          enum ({column.dataType.split("|").length}){" "}
                        </span>
                        <InfoIcon className="size-3" />
                      </Badge>
                    </div>
                    {/* Tooltip trigger for desktop */}
                    <div className="hidden md:flex">
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className={cn(
                              getBadgeColor("enum-raw"),
                              "cursor-pointer whitespace-nowrap text-xs",
                            )}
                          >
                            <span className="mr-1">
                              enum ({column.dataType.split("|").length})
                            </span>
                            <InfoIcon className="size-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md border bg-background p-3">
                          <div className="flex flex-wrap gap-2">
                            {column.dataType.split("|").map((type) => (
                              <Badge
                                key={type}
                                variant="outline"
                                className={getBadgeColor("enum-value")}
                              >
                                {type.replace(" ", "").length !== 0 ? (
                                  type
                                ) : (
                                  <CircleIcon className="size-3" />
                                )}
                              </Badge>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap justify-end gap-1">
                    {column.dataType.split("|").map((type) => (
                      <Badge
                        key={type}
                        variant="outline"
                        className={cn(
                          getBadgeColor("enum-value"),
                          "whitespace-nowrap text-xs",
                        )}
                      >
                        {type.replace(" ", "").length !== 0 ? (
                          type
                        ) : (
                          <CircleIcon className="size-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                )
              ) : (
                <Badge
                  variant="outline"
                  className={cn(
                    getBadgeColor(
                      column.dataType || column.udtName || "unknown",
                    ),
                    "whitespace-nowrap text-xs",
                  )}
                >
                  {getDisplayType(column)}
                </Badge>
              )}
            </div>

            {/* Additional constraint icons */}
            <div className="flex flex-shrink-0 items-center gap-1">
              {column.isUnique &&
                (column.isPrimaryKey || column.isForeignKey) && (
                  <Tooltip>
                    <TooltipTrigger>
                      <FingerprintIcon className="size-3.5 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unique</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              {!column.isNullable ? (
                <Tooltip>
                  <TooltipTrigger>
                    <DiamondIcon className="size-3.5 fill-foreground text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Not Null</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <DiamondIcon className="size-3.5 text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nullable</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Connection handles */}
          {column.isPrimaryKey && (
            <Handle
              // @ts-ignore
              id={column.name}
              type="target"
              // biome-ignore lint/style/noNonNullAssertion: It's not null
              position={targetPosition!}
              className={cn(
                getConnectorClasses(
                  Boolean(isHighlighted || isActiveHighlighted),
                ),
                "!left-0",
              )}
            />
          )}
          {column.isForeignKey && (
            <Handle
              // @ts-ignore
              id={column.name}
              type="source"
              // biome-ignore lint/style/noNonNullAssertion: It's not null
              position={sourcePosition!}
              className={cn(
                getConnectorClasses(
                  Boolean(isHighlighted || isActiveHighlighted),
                ),
                "!right-0",
              )}
            />
          )}
        </div>
      ))}
      {/* Drawer component for mobile */}
      {columns
        .filter((column) => column.dataType?.includes("|"))
        .map((column) => (
          <Drawer
            key={column.name}
            open={openDrawer === column.name}
            onOpenChange={(value) => {
              if (!value) closeDialog();
            }}
          >
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{column.name} - Enum Values</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {column.dataType?.split("|").map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className={getBadgeColor("enum-value")}
                  >
                    {type.replace(" ", "").length !== 0 ? (
                      type
                    ) : (
                      <CircleIcon className="size-3" />
                    )}
                  </Badge>
                ))}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}
    </div>
  );
};

export { DBTableNode };
