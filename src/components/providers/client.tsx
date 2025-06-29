"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <ReactFlowProvider>{children}</ReactFlowProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
