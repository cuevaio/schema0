import { sql } from "drizzle-orm";

export const selectSchemas = sql`
    SELECT
      schema_name
    FROM
      information_schema.schemata
  `;
