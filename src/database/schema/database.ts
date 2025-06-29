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

  userId: varchar("user_id", { length: 12 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  description: text("description").notNull(),

  schemas: jsonb("schemas").array().notNull().default([]).$type<Schema[]>(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DatabaseSelect = typeof database.$inferSelect;
