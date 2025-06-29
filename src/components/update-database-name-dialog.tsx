"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, PenIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { updateDatabaseNameAction } from "@/actions/update-database-name";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDatabases } from "@/hooks/useDatabases";

const initialState = {
  input: {
    databaseId: "",
    currentSchemaName: "",
    newDatabaseName: "",
    newSchemaName: "",
  },
  output: { success: false },
} as const;

export function UpdateDatabaseNameDialog() {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, formAction, isPending] = React.useActionState(
    updateDatabaseNameAction,
    initialState,
  );
  const { data: databases } = useDatabases();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (state.output.success) {
      setOpen(false);
      router.push(`/${params.id}/${state.output.data.schemaName}`);
      queryClient.invalidateQueries({ queryKey: ["databases"] });
    }
  }, [router, params.id, state.output, queryClient]);

  const currentDatabaseName = React.useMemo(() => {
    return databases?.find((db) => db.id === params.id)?.name;
  }, [databases, params.id]);

  if (!params.id) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <PenIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Database & Schema Names</DialogTitle>
          <DialogDescription>
            Change the name of your database and current schema.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="databaseId" defaultValue={params.id} />
          <input
            type="hidden"
            name="currentSchemaName"
            defaultValue={params.schema}
          />
          <div className="space-y-2">
            <Label htmlFor="newDatabaseName">Database Name</Label>
            <Input
              id="newDatabaseName"
              name="newDatabaseName"
              placeholder="Enter new database name"
              required
              defaultValue={state.input.newDatabaseName || currentDatabaseName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newSchemaName">Schema Name</Label>
            <Input
              id="newSchemaName"
              name="newSchemaName"
              placeholder="Enter new schema name"
              required
              defaultValue={state.input.newSchemaName || params.schema}
            />
          </div>
          {state.output.success === false && "error" in state.output && (
            <p className="text-destructive text-sm">{state.output.error}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update Names"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
