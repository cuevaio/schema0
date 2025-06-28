import { sql } from "drizzle-orm";

export const selectColumns = (schema: string) => sql`
    SELECT
        c.table_name,
        c.column_name,
        CASE 
            WHEN c.data_type = 'USER-DEFINED' THEN
                (SELECT 
                    array_to_string(array_agg(e.enumlabel ORDER BY e.enumsortorder), ' | ')
                 FROM
                    pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE
                    t.typname = c.udt_name)
            ELSE
                c.data_type
        END AS data_type,
        CASE c.is_nullable
            WHEN 'NO' THEN FALSE
            ELSE TRUE
        END AS is_nullable,
        c.column_default AS default_value,
        c.udt_name,
        c.ordinal_position,
        c.character_maximum_length
    FROM
        information_schema.columns c
    WHERE
        c.table_schema = ${schema}::text
  `;
