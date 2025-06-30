import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function getDBClient(connectionString: string) {
  const sqlClient = postgres(connectionString, { prepare: false });
  return drizzle(sqlClient);
}
