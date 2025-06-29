import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/database";
import { database } from "@/database/schema/database";

interface DatabasePageProps {
  params: {
    id: string;
  };
}

export default async function DatabasePage({ params }: DatabasePageProps) {
  const dbRecord = await db.query.database.findFirst({
    where: eq(database.id, params.id),
  });

  if (!dbRecord) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">{dbRecord.name}</h1>
        {dbRecord.description && (
          <p className="mt-2 text-muted-foreground">{dbRecord.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {dbRecord.schemas.map((schema) => (
          <div key={schema.name} className="rounded-lg border p-6">
            <h2 className="mb-4 font-semibold text-xl">
              Schema: {schema.name}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium text-lg">Tables</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {schema.tables.map((table) => (
                    <div key={table.name} className="rounded border p-4">
                      <h4 className="font-medium">{table.name}</h4>
                      <p className="text-muted-foreground text-sm">
                        {table.columns.length} columns
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {schema.relations.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-lg">Relations</h3>
                  <div className="space-y-2">
                    {schema.relations.map((relation, _index) => (
                      <div
                        key={`${relation.referencing_table}-${relation.referencing_column}-${relation.referenced_table}-${relation.referenced_column}`}
                        className="text-muted-foreground text-sm"
                      >
                        {relation.referencing_table}.
                        {relation.referencing_column} →{" "}
                        {relation.referenced_table}.{relation.referenced_column}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
