import { getDBClient } from "./get-db-client";
import { selectDatabaseName } from "./sql";

export async function getDBName(connectionString: string) {
  const db = getDBClient(connectionString);

  const name = await db.execute(selectDatabaseName);

  return name[0].current_database as string;
}
