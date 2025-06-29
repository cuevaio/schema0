import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SchemaSelector } from "@/components/schema-selector";
import { SchemaVisualizer } from "@/components/schema-visualizer";
import { db } from "@/database";
import { database } from "@/database/schema/database";

export default async function DatabasePage({
  params,
}: {
  params: Promise<{ id: string; schema: string }>;
}) {
  const { id, schema } = await params;

  const dbRecord = await db.query.database.findFirst({
    where: eq(database.id, id),
  });

  if (!dbRecord) {
    notFound();
  }

  const schemaRecord = dbRecord.schemas.find((s) => s.name === schema);

  if (!schemaRecord) {
    notFound();
  }

  return (
    <div>
      <SchemaSelector
        schemas={dbRecord.schemas}
        currentSchema={schema}
        databaseId={id}
      />
      <SchemaVisualizer
        tables={schemaRecord.tables}
        relations={schemaRecord.relations}
      />
    </div>
  );
}
