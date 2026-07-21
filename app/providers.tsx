"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ToastProvider } from "@heroui/react";
import { useSessionHydration } from "@/features/auth/hooks/use-session-hydration";

function AuthHydrator() {
  useSessionHydration();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthHydrator />
          {children}
          <ToastProvider />
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
