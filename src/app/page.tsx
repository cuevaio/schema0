import { SchemaVisualizer } from "@/components/schema-visualizer";
import { getDBSchema } from "@/lib/db";

export default async function Home() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const { tables, relations } = await getDBSchema(
    process.env.DATABASE_URL,
    "public",
  );
  return (
    <div className="flex h-screen w-screen flex-col">
      <SchemaVisualizer tables={tables} relations={relations} />
    </div>
  );
}
