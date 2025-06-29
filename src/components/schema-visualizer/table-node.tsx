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
import type { SchemaTable } from "@/lib/db/types";
import { getBadgeColor } from "@/lib/schema-utils";
import { cn } from "@/lib/utils";
import { MAX_ENUM_LENGTH_DESKTOP, MAX_ENUM_LENGTH_MOBILE } from "./constants";
import { TABLE_NODE_ROW_HEIGHT, TABLE_NODE_WIDTH } from "./layout-utils";
import { calculateEnumLength, getDisplayType } from "./utils";

const DBTableNode = ({
  data: { name, columns },
  targetPosition,
  sourcePosition,
}: Node<SchemaTable>) => {
  const hiddenNodeConnector =
    "!h-px !w-px !min-w-0 !min-h-0 !cursor-grab !border-0 !opacity-0";

  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
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

  return (
    <div
      className="text-card-foreground"
      style={{
        width: (TABLE_NODE_WIDTH / 2) * 0.75,
      }}
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
          className="relative flex items-center justify-between border-x border-t bg-muted px-3 last:rounded-b last:border-b"
          style={{
            height: (TABLE_NODE_ROW_HEIGHT / 2) * 0.75,
          }}
        >
          {/* Left side: Icons + Column name */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
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
            <div className="truncate font-semibold text-xs">{column.name}</div>
          </div>

          {/* Right side: Data type + Additional constraints */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Data type */}
            <div className="flex items-center gap-1">
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
              {column.dataType?.includes("|") ? (
                calculateEnumLength(column) >
                (isMobile
                  ? MAX_ENUM_LENGTH_MOBILE
                  : MAX_ENUM_LENGTH_DESKTOP) ? (
                  <>
                    {/* Drawer trigger for mobile */}
                    <div className="flex md:hidden">
                      <Badge
                        variant="outline"
                        onClick={() => openDialog(column.name)}
                        className={cn(
                          getBadgeColor("enum-raw"),
                          "cursor-pointer text-xs",
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
                              "cursor-pointer text-xs",
                            )}
                          >
                            <span className="mr-1">
                              enum ({column.dataType.split("|").length})
                            </span>
                            <InfoIcon className="size-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md border bg-background">
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
                            ))}{" "}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </>
                ) : (
                  column.dataType.split("|").map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn(getBadgeColor("enum-value"), "text-xs")}
                    >
                      {type.replace(" ", "").length !== 0 ? (
                        type
                      ) : (
                        <CircleIcon className="size-3" />
                      )}
                    </Badge>
                  ))
                )
              ) : (
                <Badge
                  variant="outline"
                  className={cn(
                    getBadgeColor(
                      column.dataType || column.udtName || "unknown",
                    ),
                    "text-xs",
                  )}
                >
                  {getDisplayType(column)}
                </Badge>
              )}
            </div>

            {/* Additional constraint icons */}
            <div className="flex items-center gap-1">
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
              className={cn(hiddenNodeConnector, "!left-0")}
            />
          )}
          {column.isForeignKey && (
            <Handle
              // @ts-ignore
              id={column.name}
              type="source"
              // biome-ignore lint/style/noNonNullAssertion: It's not null
              position={sourcePosition!}
              className={cn(hiddenNodeConnector, "!right-0")}
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
