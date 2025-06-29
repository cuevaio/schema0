"use client";

import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/app/api/databases/route";

export const useDatabases = () => {
  return useQuery({
    queryKey: ["databases"],
    queryFn: async () => {
      const res = await fetch("/api/databases");
      if (!res.ok) {
        throw new Error("Failed to fetch databases");
      }
      return res.json() as Promise<Database[]>;
    },
  });
};
