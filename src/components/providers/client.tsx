"use client";

import { ReactFlowProvider } from "@xyflow/react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
};
