"use client";

import { ReactNode, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useUIStore } from "@/stores/useUIStore";

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { sidebarOpen } = useUIStore();
  useCommandPalette();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <CommandPalette />
        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? "md:pl-64" : "md:pl-0"
          }`}
        >
          <main className="p-8 pt-20 md:pt-8">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
