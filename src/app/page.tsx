import { getDBSchema } from "@/lib/db";

export default async function Home() {
  const { tables, relations } = await getDBSchema(
    process.env.DATABASE_URL || "",
    "public",
  );
  return (
    <div>
      <pre>{JSON.stringify(tables, null, 2)}</pre>
      <pre>{JSON.stringify(relations, null, 2)}</pre>
    </div>
  );
}
