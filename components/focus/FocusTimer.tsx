"use client";

import { motion } from "framer-motion";
import { useFocusStore } from "@/stores/useFocusStore";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/types/database";

const CIRCUMFERENCE = 2 * Math.PI * 90; // SVG circle radius = 90

export function FocusTimer() {
  const {
    state,
    elapsedSeconds,
    workMinutes,
    breakMinutes,
    distractionCount,
    taskId,
    startSession,
    pauseSession,
    resumeSession,
    skipBreak,
    incrementDistraction,
  } = useFocusStore();

  const supabase = createClient();
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "todo")
        .limit(50);
      if (error) throw error;
      return data as Task[];
    },
  });

  // Determine duration based on state
  const totalSeconds =
    state === "break" ? breakMinutes * 60 : workMinutes * 60;
  const progress = elapsedSeconds / totalSeconds;
  const offset = CIRCUMFERENCE * (1 - progress);

  // Format time
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeStr = `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;

  // Colors based on state
  const ringColor =
    state === "running"
      ? "text-indigo-500"
      : state === "break"
        ? "text-emerald-500"
        : state === "paused"
          ? "text-amber-500"
          : "text-gray-300";

  const badgeText = state === "break" ? "BREAK" : "FOCUS";
  const badgeBg =
    state === "break"
      ? "bg-emerald-100 text-emerald-700"
      : state === "running"
        ? "bg-indigo-100 text-indigo-700"
        : "bg-amber-100 text-amber-700";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Task Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task (Optional)
        </label>
        <select
          value={taskId || ""}
          onChange={(e) => {
            if (state === "idle") {
              startSession(e.target.value || undefined);
              // Don't actually start, just set the task
              const { resetSession } = useFocusStore.getState();
              resetSession();
              useFocusStore.getState().startSession(e.target.value || undefined);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">No task selected</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>

      {/* SVG Timer Ring */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />

          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={ringColor}
            strokeLinecap="round"
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-900 font-mono">
            {timeStr}
          </div>
          <div className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold ${badgeBg}`}>
            {badgeText}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-8 justify-center flex-wrap">
        {state === "idle" && (
          <button
            onClick={() => startSession(taskId)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Start
          </button>
        )}

        {state === "running" && (
          <>
            <button
              onClick={pauseSession}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition"
            >
              Pause
            </button>
            <button
              onClick={() => useFocusStore.getState().endSession(3, "")}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Give Up
            </button>
          </>
        )}

        {state === "paused" && (
          <>
            <button
              onClick={resumeSession}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Resume
            </button>
            <button
              onClick={() => useFocusStore.getState().endSession(2, "")}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Stop
            </button>
          </>
        )}

        {state === "break" && (
          <>
            <button
              onClick={skipBreak}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Skip Break
            </button>
          </>
        )}
      </div>

      {/* Distraction Counter */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">
          Distractions: <span className="text-2xl font-bold">{distractionCount}</span>
        </span>
        <button
          onClick={incrementDistraction}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition"
        >
          +1 Distraction
        </button>
      </div>
    </div>
  );
}
