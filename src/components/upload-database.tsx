"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Code, Database, Loader2, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import {
  type UploadDatabaseActionState,
  uploadDatabaseAction,
} from "@/actions/upload-database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: UploadDatabaseActionState = {
  input: {
    connectionString: "",
    jsonSchema: "",
    importMethod: "json",
  },
  output: {
    success: false,
  },
} as const;

const SQL_QUERY = `-- ERD Schema Export Query
-- Copy this query and execute it in your PostgreSQL database client
-- Then copy the result and paste it back into the ERD generator

WITH schema_data AS (
  -- Table and Column Information
  SELECT json_build_object(
    'tables', json_agg(
      json_build_object(
        'name', table_name,
        'columns', columns
      ) ORDER BY table_name
    ),
    'relations', (
      SELECT json_agg(
        json_build_object(
          'referencing_table', referencing_table,
          'referencing_column', referencing_column,
          'referenced_table', referenced_table,
          'referenced_column', referenced_column
        )
      )
      FROM (
        SELECT DISTINCT
          tc.table_name AS referencing_table,
          kcu.column_name AS referencing_column,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.constraint_schema = tc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
        ORDER BY referencing_table, referencing_column
      ) relations_data
    )
  ) AS schema_json
  FROM (
    SELECT
      c.table_name,
      json_agg(
        json_build_object(
          'name', c.column_name,
          'dataType', CASE
            WHEN c.data_type = 'USER-DEFINED' THEN
              COALESCE(
                (SELECT array_to_string(array_agg(e.enumlabel ORDER BY e.enumsortorder), ' | ')
                 FROM pg_type t
                 JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = c.udt_name),
                c.udt_name
              )
            ELSE c.data_type
          END,
          'udtName', c.udt_name,
          'isNullable', CASE c.is_nullable WHEN 'NO' THEN false ELSE true END,
          'defaultValue', COALESCE(c.column_default, ''),
          'isUnique', EXISTS(
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'UNIQUE'
              AND tc.table_schema = 'public'
              AND tc.table_name = c.table_name
              AND kcu.column_name = c.column_name
          ),
          'isPrimaryKey', EXISTS(
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = 'public'
              AND tc.table_name = c.table_name
              AND kcu.column_name = c.column_name
          ),
          'isForeignKey', EXISTS(
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = 'public'
              AND tc.table_name = c.table_name
              AND kcu.column_name = c.column_name
          ),
          'ordinalPosition', c.ordinal_position,
          'characterMaximumLength', c.character_maximum_length
        ) ORDER BY c.ordinal_position
      ) AS columns
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name NOT LIKE 'pg_%'
      AND c.table_name NOT LIKE 'sql_%'
      AND c.table_name != 'information_schema'
    GROUP BY c.table_name
  ) tables_data
)
SELECT schema_json FROM schema_data;`;

export function UploadDatabase() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [importMethod, setImportMethod] = React.useState<"json" | "connection">(
    "json",
  );
  const [jsonSchema, setJsonSchema] = React.useState("");
  const [state, formAction, isPending] = React.useActionState(
    uploadDatabaseAction,
    initialState,
  );
  const queryClient = useQueryClient();

  const formatJson = (text: string) => {
    try {
      const parsed = JSON.parse(text.trim());
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonSchema(value);

    if (value.trim()?.startsWith("{")) {
      try {
        JSON.parse(value.trim());
        const formatted = formatJson(value);
        if (formatted !== value) {
          setTimeout(() => setJsonSchema(formatted), 100);
        }
      } catch {
        // Invalid JSON, keep as is
      }
    }
  };

  React.useEffect(() => {
    if (state.output.success && state.output.data?.id) {
      toast.success("Database imported successfully!");
      setOpen(false);
      setJsonSchema("");
      router.push(
        `/${state.output.data.id}/${state.output.data.firstSchema ?? ""}`,
      );
      queryClient.invalidateQueries({ queryKey: ["databases"] });
    } else if (!state.output.success && state.output.error) {
      toast.error(state.output.error);
    }
  }, [state.output, router, queryClient]);

  const copyQuery = () => {
    navigator.clipboard.writeText(SQL_QUERY);
    toast.success("Query copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Add Database</DialogTitle>
          <DialogDescription>
            Import your database schema using our secure SQL query or a direct
            connection.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={importMethod === "json" ? "default" : "outline"}
            onClick={() => setImportMethod("json")}
            className="flex items-center gap-2"
          >
            <Code className="h-4 w-4" />
            SQL Query
          </Button>
          <Button
            type="button"
            variant={importMethod === "connection" ? "default" : "outline"}
            onClick={() => setImportMethod("connection")}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Connection String
          </Button>
        </div>

        <form id="add-database-form" action={formAction} className="space-y-4">
          <input type="hidden" name="importMethod" value={importMethod} />

          {importMethod === "json" ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    PostgreSQL Schema Export Query
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyQuery}
                  >
                    Copy Query
                  </Button>
                </div>
                <p className="mb-3 text-muted-foreground text-sm">
                  This is a read-only query that safely extracts your database
                  schema structure.
                </p>
                <pre className="max-h-32 overflow-x-auto rounded border bg-background p-3 text-xs">
                  {SQL_QUERY}
                </pre>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jsonSchema">Paste Query Result</Label>
                <textarea
                  id="jsonSchema"
                  name="jsonSchema"
                  value={jsonSchema}
                  onChange={handleJsonChange}
                  placeholder="Paste the JSON result from your query here..."
                  className="min-h-[200px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isPending}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="connectionString">Connection String</Label>
              <Input
                id="connectionString"
                name="connectionString"
                type="password"
                placeholder="postgresql://user:pass@host:port/dbname"
                disabled={isPending}
              />
              <p className="text-muted-foreground text-xs">
                Direct database connection for real-time schema import.
              </p>
            </div>
          )}
        </form>

        <DialogFooter>
          <div className="grid w-full grid-cols-2 gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="add-database-form" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Import Database
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
