"use client";

import { useEffect } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { useTimer } from "@/hooks/useTimer";
import { FocusTimer } from "@/components/focus/FocusTimer";
import { AmbientSounds } from "@/components/focus/AmbientSounds";
import { SessionComplete } from "@/components/focus/SessionComplete";
import { SessionHistory } from "@/components/focus/SessionHistory";

export default function FocusPage() {
  const loadFromLocalStorage = useFocusStore(
    (s) => s.loadFromLocalStorage
  );

  // Load persisted session on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Drive the timer
  useTimer();

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Focus Session
          </h1>
          <p className="text-zinc-400">
            Eliminate distractions, study smarter, master your goals
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Left: Timer */}
          <div className="md:col-span-2">
            <div className="glass rounded-xl p-8 shadow-2xl shadow-black/50">
              <FocusTimer />
            </div>
          </div>

          {/* Right: Ambient sounds */}
          <div>
            <AmbientSounds />
          </div>
        </div>

        {/* Session History */}
        <div className="glass-subtle rounded-xl p-6 border border-white/5">
          <SessionHistory />
        </div>
      </div>

      {/* Session Complete Modal */}
      <SessionComplete />
    </main>
  );
}
