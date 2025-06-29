import { SchemaVisualizer } from "@/components/schema-visualizer";
import { getDBName, getDBSchema, getDBSchemas } from "@/lib/db";

export default async function Home() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const dbName = await getDBName(process.env.DATABASE_URL);
  console.log(dbName);

  const schemas = await getDBSchemas(process.env.DATABASE_URL);

  console.log(schemas);

  const { tables, relations } = await getDBSchema(
    process.env.DATABASE_URL,
    schemas[0],
  );

  return (
    <div className="flex h-screen w-screen flex-col">
      <SchemaVisualizer tables={tables} relations={relations} />
    </div>
  );
}
