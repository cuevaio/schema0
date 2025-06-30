import crypto from "node:crypto";
import type { Schema } from "@/database/schema/database";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is required");
}

// At this point, ENCRYPTION_KEY is guaranteed to be a string
const key = ENCRYPTION_KEY as string;

export function encryptSchemas(schemas: Schema[]): string {
  const iv = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(key, "salt", 32);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  let encrypted = cipher.update(JSON.stringify(schemas), "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  // Combine IV, encrypted data, and authentication tag
  return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`.toString();
}

export function decryptSchemas(encryptedData: string): Schema[] {
  // Handle case where data might not be encrypted yet
  if (
    !encryptedData ||
    encryptedData === "[]" ||
    !encryptedData.includes(":")
  ) {
    try {
      return JSON.parse(encryptedData || "[]");
    } catch {
      return [];
    }
  }

  try {
    const parts = encryptedData.split(":");

    // Check if we have the new format with auth tag (3 parts) or old format (2 parts)
    if (parts.length === 3) {
      // New format: iv:encrypted:authTag
      const [ivHex, encrypted, authTagHex] = parts;

      if (!ivHex || !encrypted || !authTagHex) {
        throw new Error("Invalid encrypted data format");
      }

      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");
      const derivedKey = crypto.scryptSync(key, "salt", 32);

      const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return JSON.parse(decrypted);
    } else if (parts.length === 2) {
      // Old format: iv:encrypted (without auth tag) - this will likely fail
      const [ivHex, encrypted] = parts;

      if (!ivHex || !encrypted) {
        throw new Error("Invalid encrypted data format");
      }

      const iv = Buffer.from(ivHex, "hex");
      const derivedKey = crypto.scryptSync(key, "salt", 32);

      const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return JSON.parse(decrypted);
    } else {
      throw new Error("Invalid encrypted data format");
    }
  } catch (error) {
    console.error("Failed to decrypt schemas:", error);
    // Return empty array as fallback
    return [];
  }
}
