import { eq } from "drizzle-orm";
import { db } from "@/database";
import { database } from "@/database/schema/database";

export default async function DatabaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string; schema: string }>;
}) {
  const { id, schema } = await params;

  const _dbRecord = await db.query.database.findFirst({
    where: eq(database.id, id),
  });

  return <div>{children}</div>;
}
