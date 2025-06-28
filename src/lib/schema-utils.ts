import type { DBTable } from "./db/types";

export const getBadgeColor = (dataType: string) => {
  switch (dataType?.toLowerCase()) {
    case "uuid":
      return "text-blue-500 border-blue-500";
    case "date":
      return "text-red-500 border-red-500";
    case "character varying":
      return "text-purple-500 border-purple-500";
    case "boolean":
      return "text-yellow-500 border-yellow-500";
    case "enum-raw":
      return "text-orange-500 border-orange-500";
    case "enum-value":
      return "text-muted-foreground border-muted-foreground/40";
    case "timestamp without time zone":
    case "timestamp with time zone":
      return "text-blue-500 border-blue-500";
    case "integer":
      return "text-green-500 border-green-500";
    case "bigint":
    case "smallint":
    case "numeric":
      return "text-blue-500 border-blue-500";
    default:
      return "text-muted-foreground border-muted-foreground/40";
  }
};

export const getEnumLength = (column: Partial<DBTable["columns"][number]>) => {
  if (!column.dataType) return 0;
  return column.dataType
    ?.split("|")
    .reduce((sum, type) => sum + type.length, 0);
};

export const dataTypeMap = {
  integer: "int4",
  "character varying": "varchar",
  text: "text",
  uuid: "uuid",
  "timestamp without time zone": "timestamp",
  "timestamp with time zone": "timestamptz",
  boolean: "bool",
  "USER-DEFINED": "custom",
};

export const getDataTypeLabel = (
  data_type: string,
  character_maximum_length?: number,
) => {
  let label = dataTypeMap[data_type as keyof typeof dataTypeMap] || data_type;
  if (label === "varchar") {
    label = `varchar(${character_maximum_length})`;
  }

  return label;
};
