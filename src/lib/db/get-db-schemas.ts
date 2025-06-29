import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { selectSchemas } from "./sql";

export async function getDBSchemas(connectionString: string) {
  const sqlClient = neon(connectionString);
  const db = drizzle(sqlClient);

  const schemas = await db.execute(selectSchemas);

  return schemas.rows.map((row) => row.schema_name as string);
}
