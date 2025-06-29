import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { generateAnonymousUserId } from "@/lib/anomymous-auth";
import { db } from "../database";
import * as schema from "../database/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});

export async function getUserId(headers: ReadonlyHeaders): Promise<{
  userId: string;
  isAnonymous: boolean;
}> {
  const session = await auth.api.getSession({
    headers,
  });

  if (session) {
    return {
      userId: session.session.userId,
      isAnonymous: false,
    };
  }

  const anonymousUserId = generateAnonymousUserId(headers);

  return {
    userId: anonymousUserId,
    isAnonymous: true,
  };
}
