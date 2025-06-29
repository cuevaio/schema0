import { createHash } from "node:crypto";
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

// Get the secret key from environment variables
const SECRET_KEY = process.env.ANONYMOUS_USER_ID_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error(
    "ANONYMOUS_USER_ID_SECRET_KEY environment variable is required",
  );
}

export function generateAnonymousUserId(headers: ReadonlyHeaders): string {
  // Get IP address from x-forwarded-for header (first IP in the chain)
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Get other relevant headers
  const userAgent = headers.get("user-agent") || "unknown";
  const acceptLanguage = headers.get("accept-language") || "unknown";
  const browserInfo = headers.get("sec-ch-ua") || "unknown";
  const platform = headers.get("sec-ch-ua-platform") || "unknown";

  // Combine all identifiers into a single string, including the secret key
  const combinedString = `${ip}|${userAgent}|${acceptLanguage}|${browserInfo}|${platform}|${SECRET_KEY}`;

  // Create and return the full SHA-256 hash
  return createHash("sha256").update(combinedString).digest("hex");
}
