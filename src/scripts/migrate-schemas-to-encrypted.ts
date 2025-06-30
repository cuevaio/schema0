import { eq } from "drizzle-orm";

import { db } from "@/database";
import { database } from "@/database/schema/database";
import { decryptSchemas, encryptSchemas } from "@/lib/encryption";

export async function migrateSchemasToEncrypted() {
  console.log("Starting schema encryption migration...");

  // Get all databases with unencrypted schemas
  const databases = await db.select().from(database);

  for (const dbRecord of databases) {
    try {
      console.log(`Processing database: ${dbRecord.id}`);

      // Check if schemas exist and need encryption
      if (dbRecord.schemas && dbRecord.schemas.length > 0) {
        console.log(`Found unencrypted schemas for database: ${dbRecord.id}`);

        // Encrypt the schemas with the new format
        const schemas = dbRecord.schemas;
        const encryptedSchemas = encryptSchemas(schemas);

        // Verify the encryption worked by decrypting
        const decryptedSchemas = decryptSchemas(encryptedSchemas.toString());

        if (decryptedSchemas.length === schemas.length) {
          // Update the database with encrypted schemas
          await db
            .update(database)
            .set({ encryptedSchemas: encryptedSchemas.toString() })
            .where(eq(database.id, dbRecord.id));

          console.log(
            `✅ Successfully encrypted schemas for database: ${dbRecord.id}`,
          );
          console.log(
            `   Original schemas: ${schemas.length}, Decrypted schemas: ${decryptedSchemas.length}`,
          );
        } else {
          console.error(
            `❌ Encryption verification failed for database: ${dbRecord.id}`,
          );
          console.error(
            `   Expected: ${schemas.length}, Got: ${decryptedSchemas.length}`,
          );
        }
      } else if (dbRecord.encryptedSchemas) {
        // Check if already encrypted with old format and needs re-encryption
        const parts = dbRecord.encryptedSchemas.split(":");
        if (parts.length === 2) {
          console.log(
            `Found old format encrypted schemas for database: ${dbRecord.id}, re-encrypting...`,
          );

          try {
            // Try to decrypt with old format
            const decryptedSchemas = decryptSchemas(dbRecord.encryptedSchemas);

            if (decryptedSchemas.length > 0) {
              // Re-encrypt with new format
              const newEncryptedSchemas = encryptSchemas(decryptedSchemas);

              // Verify the new encryption
              const verifyDecrypted = decryptSchemas(
                newEncryptedSchemas.toString(),
              );

              if (verifyDecrypted.length === decryptedSchemas.length) {
                await db
                  .update(database)
                  .set({ encryptedSchemas: newEncryptedSchemas.toString() })
                  .where(eq(database.id, dbRecord.id));

                console.log(
                  `✅ Successfully re-encrypted schemas for database: ${dbRecord.id}`,
                );
              } else {
                console.error(
                  `❌ Re-encryption verification failed for database: ${dbRecord.id}`,
                );
              }
            } else {
              console.log(
                `⚠️  Could not decrypt old format schemas for database: ${dbRecord.id}`,
              );
            }
          } catch (error) {
            console.error(
              `❌ Failed to decrypt old format schemas for database: ${dbRecord.id}:`,
              error,
            );
          }
        } else if (parts.length === 3) {
          console.log(
            `✅ Database ${dbRecord.id} already has new format encrypted schemas`,
          );
        }
      } else {
        console.log(`ℹ️  No schemas found for database: ${dbRecord.id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to process database ${dbRecord.id}:`, error);
    }
  }

  console.log("Schema encryption migration completed!");
}

await migrateSchemasToEncrypted();
