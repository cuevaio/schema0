CREATE TABLE "database" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"user_id" varchar(12) NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"schemas" jsonb[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "post" CASCADE;--> statement-breakpoint
ALTER TABLE "database" ADD CONSTRAINT "database_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;