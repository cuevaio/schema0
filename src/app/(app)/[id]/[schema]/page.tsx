import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SchemaVisualizer } from "@/components/schema-visualizer";
import { db } from "@/database";
import { database } from "@/database/schema/database";
import { decryptSchemas } from "@/lib/encryption";

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

  const schemas = decryptSchemas(dbRecord.encryptedSchemas);

  const schemaRecord = schemas.find((s) => s.name === schema);

  if (!schemaRecord) {
    notFound();
  }

  return (
    <SchemaVisualizer
      tables={schemaRecord.tables}
      relations={schemaRecord.relations}
    />
  );
}

export async function generateStaticParams() {
  return [];
}

export const revalidate = 300;
export const dynamic = "force-static";
export const dynamicParams = true;
