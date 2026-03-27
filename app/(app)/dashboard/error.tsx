"use client";

import { ErrorFallback } from "@/components/ErrorBoundary";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorFallback onReset={reset} label="Try again" />;
}
