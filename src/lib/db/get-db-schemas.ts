import { getDBClient } from "./get-db-client";
import { selectSchemas } from "./sql";

export async function getDBSchemas(connectionString: string) {
  const db = getDBClient(connectionString);

  const schemas = await db.execute(selectSchemas);

  return schemas.map((row) => row.schema_name as string);
}
