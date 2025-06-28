import { extendedDataTypeMap } from "./constants";

// Local helper function to calculate enum length that can handle null dataType
export const calculateEnumLength = (column: {
  dataType: string | null;
}): number => {
  if (!column.dataType) return 0;
  return column.dataType.split("|").reduce((sum, type) => sum + type.length, 0);
};

// Helper function to get display type considering both dataType and udtName
export const getDisplayType = (column: {
  dataType: string | null;
  udtName: string;
}) => {
  if (column.dataType) {
    console.log({ dataType: column.dataType });
    return (
      extendedDataTypeMap[
        column.dataType as keyof typeof extendedDataTypeMap
      ] || column.dataType
    );
  }
  return column.udtName || "unknown";
};
