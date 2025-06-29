import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUserId } from "@/auth";
import { db } from "@/database";
import { database } from "@/database/schema/database";

export type Database = {
  id: string;
  name: string;
  schemas: string[];
};

export async function GET(request: Request) {
  const { userId, isAnonymous } = await getUserId(request.headers);

  const databases = await db.query.database.findMany({
    where: isAnonymous
      ? eq(database.anonymousUserId, userId)
      : eq(database.userId, userId),
  });

  const result = databases.map((db) => ({
    id: db.id,
    name: db.name,
    schemas: db.schemas.map((schema) => schema.name),
  }));

  return NextResponse.json(result);
}
