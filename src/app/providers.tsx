"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SettingsProvider } from "@/contexts/settings-context";
import { MaintenanceMode } from "@/components/maintenance-mode";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <MaintenanceMode>
              {children}
            </MaintenanceMode>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
