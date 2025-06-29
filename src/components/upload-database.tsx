"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusIcon } from "lucide-react";
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
  },
  output: {
    success: false,
  },
} as const;

export function UploadDatabase() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, formAction, isPending] = React.useActionState(
    uploadDatabaseAction,
    initialState,
  );
  const queryClient = useQueryClient();

  // Handle success redirect and toast messages
  React.useEffect(() => {
    if (state.output.success && state.output.data?.id) {
      toast.success("Database uploaded successfully!");
      setOpen(false); // Close the dialog on success
      router.push(
        `/${state.output.data.id}/${state.output.data.firstSchema ?? ""}`,
      );
      queryClient.invalidateQueries({ queryKey: ["databases"] });
    } else if (!state.output.success && state.output.error) {
      toast.error(state.output.error);
    }
  }, [state.output, router, queryClient]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Database</DialogTitle>
          <DialogDescription>
            Enter your database connection string to add a new database to your
            account
          </DialogDescription>
        </DialogHeader>
        <form id="add-database-form" action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connectionString">Connection String</Label>
            <Input
              id="connectionString"
              name="connectionString"
              type="text"
              placeholder="postgresql://user:password@localhost:5432/database"
              required
              disabled={isPending}
            />
          </div>
        </form>
        <DialogFooter>
          <div className="grid w-full grid-cols-2 gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="add-database-form" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add database
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
