import type { SchemaTable } from "@/lib/db/types";
import { extendedDataTypeMap } from "./constants";

// Local helper function to calculate enum length that can handle null dataType
export const calculateEnumLength = (column: SchemaTable["columns"][number]) => {
  if (!column.dataType) return 0;
  return column.dataType.split("|").reduce((sum, type) => sum + type.length, 0);
};

// Helper function to get display type considering both dataType and udtName
export const getDisplayType = (column: SchemaTable["columns"][number]) => {
  let name = column.dataType;
  if (column.dataType) {
    name =
      extendedDataTypeMap[
        column.dataType as keyof typeof extendedDataTypeMap
      ] || column.dataType;
  }
  if (name === "varchar" && column.characterMaximumLength) {
    name = `varchar(${column.characterMaximumLength})`;
  }

  if (!name) {
    name = column.udtName || "unknown";
  }

  return name;
};
