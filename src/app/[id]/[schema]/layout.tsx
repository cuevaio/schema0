import { DatabaseSchemaSelector } from "@/components/database-schema-selector";
import { UploadDatabase } from "@/components/upload-database";

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-start justify-between">
        <DatabaseSchemaSelector />
        <UploadDatabase />
      </div>
      {children}
    </div>
  );
}
