import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { selectDatabaseName } from "./sql";

export async function getDBName(connectionString: string) {
  const sqlClient = neon(connectionString);
  const db = drizzle(sqlClient);

  const name = await db.execute(selectDatabaseName);
  return name.rows[0].current_database as string;
}
