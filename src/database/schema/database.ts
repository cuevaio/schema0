import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import type { SchemaRelation, SchemaTable } from "@/lib/db/types";
import { user } from "./auth";

export type Schema = {
  name: string;
  tables: SchemaTable[];
  relations: SchemaRelation[];
};

export const database = pgTable("database", {
  id: varchar("id", { length: 12 }).primaryKey(),

  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  anonymousUserId: text("anonymous_user_id"),

  name: text("name").notNull(),
  description: text("description").notNull(),

  schemas: jsonb("schemas").array().notNull().default([]).$type<Schema[]>(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DatabaseSelect = typeof database.$inferSelect;
export type DatabaseInsert = typeof database.$inferInsert;
