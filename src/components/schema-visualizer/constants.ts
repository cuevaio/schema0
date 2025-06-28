import { dataTypeMap } from "@/lib/schema-utils";

// Extended dataTypeMap to include vector type
export const extendedDataTypeMap = {
  ...dataTypeMap,
  vector: "vector",
};

export const MAX_ENUM_LENGTH_DESKTOP = 10;
export const MAX_ENUM_LENGTH_MOBILE = 10;
