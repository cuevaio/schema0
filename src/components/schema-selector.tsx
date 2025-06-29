import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Schema {
  name: string;
}

interface SchemaSelectorProps {
  schemas: Schema[];
  currentSchema: string;
  databaseId: string;
}

export function SchemaSelector({
  schemas,
  currentSchema,
  databaseId,
}: SchemaSelectorProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {schemas.map((schema) => {
            const isSelected = schema.name === currentSchema;
            return (
              <Link key={schema.name} href={`/${databaseId}/${schema.name}`}>
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isSelected && <CheckIcon className="h-4 w-4" />}
                  {schema.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
