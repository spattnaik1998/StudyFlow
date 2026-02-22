import { ReactNode } from "react";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
