import { SchemaVisualizer } from "@/components/schema-visualizer";
import { getDBSchema } from "@/lib/db";

export default async function Home() {
  const { tables, relations } = await getDBSchema(
    // biome-ignore lint/style/noNonNullAssertion: Already set in .env.local
    process.env.DATABASE_URL!,
    "public",
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="font-bold text-2xl">Welcome to schema0</h1>
        <p className="text-muted-foreground text-sm">
          You are currently viewing the public schema of the actual schema0
          database.
        </p>
        <p>Add your own database to visualize its schema ↖</p>
      </div>
      <SchemaVisualizer tables={tables} relations={relations} />
    </div>
  );
}
