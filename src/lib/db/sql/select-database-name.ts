import { sql } from "drizzle-orm";

export const selectDatabaseName = sql`
    SELECT
      current_database();
  `;
