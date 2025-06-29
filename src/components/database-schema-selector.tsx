"use client";

import { ChevronRight } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatabases } from "@/hooks/useDatabases";

export function DatabaseSchemaSelector() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { data: databases, isLoading, error } = useDatabases();

  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>("");
  const [selectedSchema, setSelectedSchema] = useState<string>("");

  // Check if we're at the root path
  const isAtRoot = pathname === "/";

  // Get current database and schema from URL params
  const currentDatabaseId = params.id as string;
  const currentSchema = params.schema as string;

  // Set initial values when data loads
  useEffect(() => {
    if (isAtRoot) {
      // At root path, show default schema0 database with public schema
      setSelectedDatabaseId("schema0");
      setSelectedSchema("public");
    } else if (databases && databases.length > 0) {
      // If we have a current database in URL, use it; otherwise use first database
      const initialDatabaseId = currentDatabaseId || databases[0].id;
      setSelectedDatabaseId(initialDatabaseId);

      // Find the selected database
      const selectedDb = databases.find((db) => db.id === initialDatabaseId);
      if (selectedDb && selectedDb.schemas.length > 0) {
        // If we have a current schema in URL and it exists in the database, use it;
        // otherwise use first schema
        const initialSchema =
          currentSchema && selectedDb.schemas.includes(currentSchema)
            ? currentSchema
            : selectedDb.schemas[0];
        setSelectedSchema(initialSchema);
      }
    }
  }, [databases, currentDatabaseId, currentSchema, isAtRoot]);

  useEffect(() => {
    if (databases) {
      databases.forEach((db) => {
        db.schemas.forEach((schema) => {
          router.prefetch(`/${db.id}/${schema}`);
        });
      });
    }
  }, [databases, router]);

  // Handle database selection
  const handleDatabaseChange = (databaseId: string) => {
    setSelectedDatabaseId(databaseId);

    if (databaseId === "schema0") {
      // If selecting schema0, go to root with public schema
      setSelectedSchema("public");
      router.push("/");
    } else {
      // Find the selected database and get its first schema
      const selectedDb = databases?.find((db) => db.id === databaseId);
      if (selectedDb && selectedDb.schemas.length > 0) {
        const firstSchema = selectedDb.schemas[0];
        setSelectedSchema(firstSchema);

        // Redirect to the new database/schema
        router.push(`/${databaseId}/${firstSchema}`);
      }
    }
  };

  // Handle schema selection
  const handleSchemaChange = (schema: string) => {
    setSelectedSchema(schema);

    if (selectedDatabaseId === "schema0") {
      // If schema0 database, go to root
      router.push("/");
    } else {
      // Redirect to the selected schema
      router.push(`/${selectedDatabaseId}/${schema}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-32" />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  // Show schema0 database even if no user databases exist
  const availableDatabases = [
    { id: "schema0", name: "schema0", schemas: ["public"] },
    ...(databases || []),
  ];

  const selectedDb = availableDatabases.find(
    (db) => db.id === selectedDatabaseId,
  );

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedDatabaseId} onValueChange={handleDatabaseChange}>
        <SelectTrigger>
          <SelectValue placeholder="Database" />
        </SelectTrigger>
        <SelectContent>
          {availableDatabases.map((database) => (
            <SelectItem key={database.id} value={database.id}>
              {database.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedDb && selectedDb.schemas.length > 0 && (
        <>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <Select value={selectedSchema} onValueChange={handleSchemaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Schema" />
            </SelectTrigger>
            <SelectContent>
              {selectedDb.schemas.map((schema) => (
                <SelectItem key={schema} value={schema}>
                  {schema}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
}
