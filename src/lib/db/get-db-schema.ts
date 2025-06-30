import { getDBClient } from "./get-db-client";
import { selectColumns, selectColumnsConstrains, selectRelations } from "./sql";
import type { SchemaTable } from "./types";

export async function getDBSchema(connectionString: string, schema: string) {
  const db = getDBClient(connectionString);

  const _columns = await db.execute(selectColumns(schema));

  const columns = _columns as unknown as {
    table_name: string;
    column_name: string;
    data_type: string;
    is_nullable: boolean;
    default_value: string;
    udt_name: string;
    ordinal_position: number;
    character_maximum_length?: number;
  }[];

  const _columnConstrains = await db.execute(selectColumnsConstrains(schema));

  const columnConstrains = _columnConstrains as unknown as {
    table_name: string;
    column_name: string;
    constraint_type: string;
  }[];

  const _relations = await db.execute(selectRelations(schema));

  const relations = _relations as unknown as {
    referencing_table: string;
    referencing_column: string;
    referenced_table: string;
    referenced_column: string;
  }[];

  const tables: SchemaTable[] = columns.reduce((acc, dbColumn) => {
    const table = acc.find((t) => t.name === dbColumn.table_name);

    const constrains = columnConstrains.filter(
      (c) =>
        c.table_name === dbColumn.table_name &&
        c.column_name === dbColumn.column_name,
    );

    const column = {
      name: dbColumn.column_name,
      dataType: dbColumn.data_type,
      udtName: dbColumn.udt_name,
      isNullable: dbColumn.is_nullable,
      defaultValue: dbColumn.default_value,
      isUnique: constrains.some((c) => c.constraint_type === "UNIQUE"),
      isPrimaryKey: constrains.some((c) => c.constraint_type === "PRIMARY KEY"),
      isForeignKey: constrains.some((c) => c.constraint_type === "FOREIGN KEY"),
      ordinalPosition: dbColumn.ordinal_position,
      characterMaximumLength: dbColumn.character_maximum_length,
    };

    if (table) {
      table.columns.push(column);
    } else {
      acc.push({
        name: dbColumn.table_name,
        columns: [column],
      });
    }

    return acc;
  }, [] as SchemaTable[]);

  tables.forEach((t) => {
    t.columns.sort((a, b) => a.ordinalPosition - b.ordinalPosition);
  });

  return { tables, relations };
}
