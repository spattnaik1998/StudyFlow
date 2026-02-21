"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ParseNLTaskRequest } from "@/types/api";

interface AITaskInputProps {
  projectId: string;
}

export function AITaskInput({ projectId }: AITaskInputProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleParse = async () => {
    if (!input.trim()) {
      setError("Please describe a task");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          project_id: projectId,
        } as ParseNLTaskRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to parse task");
      }

      const result = await response.json();
      const task = result.data;

      // Build query params
      const params = new URLSearchParams({
        project_id: projectId,
        ...(task.title && { title: task.title }),
        ...(task.description && { description: task.description }),
        ...(task.priority && { priority: task.priority }),
        ...(task.due_date && { due_date: task.due_date }),
        ...(task.estimated_duration_mins && {
          estimated_duration_mins: task.estimated_duration_mins.toString(),
        }),
        ...(task.tags && task.tags.length > 0 && {
          tags: task.tags.join(","),
        }),
      });

      // Navigate to tasks/new with pre-filled data
      router.push(`/app/tasks/new?${params.toString()}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse task";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        placeholder="Describe a task in plain English... e.g. 'Study Chapter 5 for physics on Friday, should take about 2 hours'"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full min-h-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        disabled={loading}
      />
      {error && <div className="text-sm text-red-500">{error}</div>}
      <button
        onClick={handleParse}
        disabled={loading || !input.trim()}
        className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Parsing with AI..." : "Parse with AI"}
      </button>
    </div>
  );
}
