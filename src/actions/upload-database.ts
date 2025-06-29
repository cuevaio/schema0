"use server";

import { type DatabaseInsert, database, db } from "@/database";
import { getDBName, getDBSchema, getDBSchemas } from "@/lib/db";
import { nanoid } from "@/lib/nanoid";

type UploadDatabaseActionState = {
  input: {
    connectionString?: string;
  };
  output:
    | {
        success: true;
        data: {
          id: string;
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

  const state: UploadDatabaseActionState = {
    input: {
      connectionString,
    },
    output: {
      success: false,
    },
  };

  if (!connectionString) {
    state.output = {
      success: false,
      error: "Connection string is required",
    };
    return state;
  }

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
      schemas: schemasWithTables,
    } satisfies DatabaseInsert);

    state.output = {
      success: true,
      data: {
        id,
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
