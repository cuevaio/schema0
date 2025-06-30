"use server";

import { headers } from "next/headers";
import { getUserId } from "@/auth";
import { type DatabaseInsert, database, db } from "@/database";
import { getDBName, getDBSchema, getDBSchemas } from "@/lib/db";
import { encryptSchemas } from "@/lib/encryption";
import { nanoid } from "@/lib/nanoid";

export type UploadDatabaseActionState = {
  input: {
    connectionString?: string;
    jsonSchema?: string;
    importMethod?: "connection" | "json";
  };
  output:
    | {
        success: true;
        data: {
          id: string;
          firstSchema?: string;
        };
      }
    | {
        success: false;
        error?: string;
      };
};

export async function uploadDatabaseAction(
  _previousState: UploadDatabaseActionState,
  formData: FormData,
): Promise<UploadDatabaseActionState> {
  const connectionString = formData.get("connectionString") as string;
  const jsonSchema = formData.get("jsonSchema") as string;
  const importMethod = formData.get("importMethod") as "connection" | "json";

  const state: UploadDatabaseActionState = {
    input: {
      connectionString,
      jsonSchema,
      importMethod,
    },
    output: {
      success: false,
    },
  };

  if (importMethod === "json") {
    if (!jsonSchema?.trim()) {
      state.output = {
        success: false,
        error: "JSON schema is required",
      };
      return state;
    }

    try {
      const parsedSchema = JSON.parse(jsonSchema);

      if (!parsedSchema.tables || !Array.isArray(parsedSchema.tables)) {
        state.output = {
          success: false,
          error: "Invalid schema format: missing tables array",
        };
        return state;
      }

      const { userId, isAnonymous } = await getUserId(await headers());
      const id = nanoid();

      const schemasWithTables = [
        {
          name: "public",
          tables: parsedSchema.tables,
          relations: parsedSchema.relations || [],
        },
      ];

      await db.insert(database).values({
        id,
        name: "Imported Database",
        description: "Database imported from JSON schema",
        encryptedSchemas: encryptSchemas(schemasWithTables),
        userId: isAnonymous ? undefined : userId,
        anonymousUserId: isAnonymous ? userId : undefined,
      } satisfies DatabaseInsert);

      state.output = {
        success: true,
        data: {
          id,
          firstSchema: "public",
        },
      };
    } catch (error) {
      state.output = {
        success: false,
        error:
          error instanceof Error
            ? `Invalid JSON: ${error.message}`
            : "Invalid JSON format",
      };
    }
    return state;
  }

  if (!connectionString) {
    state.output = {
      success: false,
      error: "Connection string is required",
    };
    return state;
  }

  const { userId, isAnonymous } = await getUserId(await headers());
  try {
    const dbName = await getDBName(connectionString);
    let schemas = await getDBSchemas(connectionString);
    schemas = schemas.filter((schema) => !SCHEMAS_TO_IGNORE.includes(schema));

    const schemasWithTables = await Promise.all(
      schemas.map(async (schema) => {
        const { tables, relations } = await getDBSchema(
          connectionString,
          schema,
        );
        return { name: schema, tables, relations };
      }),
    );

    const id = nanoid();

    await db.insert(database).values({
      id,
      name: dbName,
      description: "Uploaded database",
      encryptedSchemas: encryptSchemas(schemasWithTables),
      userId: isAnonymous ? undefined : userId,
      anonymousUserId: isAnonymous ? userId : undefined,
    } satisfies DatabaseInsert);

    state.output = {
      success: true,
      data: {
        id,
        firstSchema: schemasWithTables[0].name,
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

const SCHEMAS_TO_IGNORE = ["pg_catalog", "information_schema", "pg_toast"];
