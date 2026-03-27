import { ReactNode } from "react";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppLayoutClient>{children}</AppLayoutClient>
      <Toaster position="bottom-right" theme="dark" richColors />
    </>
  );
}
