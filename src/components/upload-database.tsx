"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  type UploadDatabaseActionState,
  uploadDatabaseAction,
} from "@/actions/upload-database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: UploadDatabaseActionState = {
  input: {
    connectionString: "",
  },
  output: {
    success: false,
  },
};

export function UploadDatabase() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    uploadDatabaseAction,
    initialState,
  );

  // Handle success redirect and toast messages
  useEffect(() => {
    if (state.output.success && state.output.data?.id) {
      toast.success("Database uploaded successfully!");
      router.push(
        `/${state.output.data.id}/${state.output.data.firstSchema ?? ""}`,
      );
    } else if (!state.output.success && state.output.error) {
      toast.error(state.output.error);
    }
  }, [state.output, router]);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Database</CardTitle>
        <CardDescription>
          Enter your database connection string to upload and visualize your
          schema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-white border-b-2"></div>
                Uploading...
              </>
            ) : (
              "Upload Database"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
