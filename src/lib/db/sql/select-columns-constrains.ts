import { sql } from "drizzle-orm";

export const selectColumnsConstrains = (schema: string) => sql`
    SELECT
      tc.table_name AS table_name,
      kcu.column_name AS column_name,
      CASE tc.constraint_type
        WHEN 'PRIMARY KEY' THEN 'PRIMARY KEY'
        WHEN 'FOREIGN KEY' THEN 'FOREIGN KEY'
        WHEN 'UNIQUE' THEN 'UNIQUE'
        ELSE NULL
      END AS constraint_type
    FROM
      information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE
      tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
      AND tc.table_schema = ${schema}::text
    ORDER BY
      tc.table_name,
      kcu.column_name
  `;
