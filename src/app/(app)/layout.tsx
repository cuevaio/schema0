import { DatabaseSchemaSelector } from "@/components/database-schema-selector";
import { UploadDatabase } from "@/components/upload-database";
import { User } from "@/components/user";

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-start justify-between">
        <DatabaseSchemaSelector />
        <div className="flex items-center gap-4">
          <UploadDatabase />
          <User />
        </div>
      </div>
      {children}
    </div>
  );
}
