import { Providers as ClientProviders } from "./client";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ClientProviders>{children}</ClientProviders>;
};
