"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getUserId } from "@/auth";
import { database, db } from "@/database";
import { decryptSchemas, encryptSchemas } from "@/lib/encryption";

export type UpdateDatabaseNameActionState = {
  input: {
    databaseId: string;
    currentSchemaName: string;
    newDatabaseName: string;
    newSchemaName: string;
  };
  output:
    | {
        success: true;
        data: {
          schemaName: string;
        };
      }
    | {
        success: false;
        error?: string;
      };
};

export async function updateDatabaseNameAction(
  _previousState: UpdateDatabaseNameActionState,
  formData: FormData,
): Promise<UpdateDatabaseNameActionState> {
  const databaseId = formData.get("databaseId") as string;
  const currentSchemaName = formData.get("currentSchemaName") as string;
  const newDatabaseName = formData.get("newDatabaseName") as string;
  const newSchemaName = formData.get("newSchemaName") as string;

  const state: UpdateDatabaseNameActionState = {
    input: {
      databaseId,
      currentSchemaName,
      newDatabaseName,
      newSchemaName,
    },
    output: {
      success: false,
    },
  };

  if (!databaseId || !currentSchemaName || !newDatabaseName || !newSchemaName) {
    state.output = {
      success: false,
      error: "Missing required fields",
    };
    return state;
  }

  const { userId, isAnonymous } = await getUserId(await headers());
  try {
    const dbRecord = await db.query.database.findFirst({
      where: and(
        eq(database.id, databaseId),
        isAnonymous
          ? eq(database.anonymousUserId, userId)
          : eq(database.userId, userId),
      ),
    });

    if (!dbRecord) {
      state.output = {
        success: false,
        error: "Database not found",
      };
      return state;
    }

    await db
      .update(database)
      .set({
        name: newDatabaseName,
        encryptedSchemas: encryptSchemas(
          decryptSchemas(dbRecord.encryptedSchemas).map((s) =>
            s.name === currentSchemaName ? { ...s, name: newSchemaName } : s,
          ),
        ).toString(),
      })
      .where(eq(database.id, databaseId));

    state.output = {
      success: true,
      data: {
        schemaName: newSchemaName,
      },
    };
  } catch (error) {
    state.output = {
      success: false,
      error: error instanceof Error ? error.message : undefined,
    };
  }

  return state;
}
