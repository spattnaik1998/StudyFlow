"use client";

import { useEffect } from "react";
import { useFocusStore } from "@/stores/useFocusStore";

/**
 * Manages the timer interval. Drives tick() on the focus store.
 * Only active when state is "running" or "break".
 */
export function useTimer() {
  const state = useFocusStore((s) => s.state);
  const tick = useFocusStore((s) => s.tick);

  useEffect(() => {
    // Only set interval if actively timing
    if (state !== "running" && state !== "break") {
      return;
    }

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [state, tick]);
}
