"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Project, Task } from "@/types/database";

interface TaskFormProps {
  task?: Task;
  projectId?: string;
  onSubmit?: () => void;
}

export function TaskForm({ task, projectId, onSubmit }: TaskFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check both "project" and "project_id" params
  const projectFromParams = searchParams.get("project") || searchParams.get("project_id") || "";
  const initialProjectId = projectId || projectFromParams || "";

  // Read AI-provided params
  const aiTitle = searchParams.get("title") || "";
  const aiPriority = searchParams.get("priority") || "";
  const aiDueDate = searchParams.get("due_date") || "";
  const aiEstimatedDuration = searchParams.get("estimated_duration_mins") || "";
  const aiTags = searchParams.get("tags") || "";

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active");

      if (error) throw error;
      return data as Project[];
    },
  });

  const [formData, setFormData] = useState({
    project_id: task?.project_id || initialProjectId,
    title: task?.title || aiTitle || "",
    description: task?.description || "",
    priority: task?.priority || aiPriority || "medium",
    status: task?.status || "todo",
    due_date: task?.due_date || aiDueDate || "",
    due_time: task?.due_time || "",
    estimated_duration_mins: task?.estimated_duration_mins || (aiEstimatedDuration ? parseInt(aiEstimatedDuration) : 30),
    tags: task?.tags?.join(", ") || aiTags || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        estimated_duration_mins: parseInt(formData.estimated_duration_mins as any),
      };

      if (task) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update(submitData)
          .eq("id", task.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("tasks")
          .insert([submitData]);

        if (insertError) throw insertError;
      }

      onSubmit?.();
      router.push(`/projects/${formData.project_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project *
        </label>
        <select
          required
          value={formData.project_id}
          onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
          className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" className="bg-zinc-900">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="bg-zinc-900">
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Task Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Read Chapter 5"
          className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add details about this task"
          rows={3}
          className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low" className="bg-zinc-900">Low</option>
            <option value="medium" className="bg-zinc-900">Medium</option>
            <option value="high" className="bg-zinc-900">High</option>
            <option value="urgent" className="bg-zinc-900">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todo" className="bg-zinc-900">To Do</option>
            <option value="in_progress" className="bg-zinc-900">In Progress</option>
            <option value="done" className="bg-zinc-900">Done</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estimated Duration (mins)
          </label>
          <input
            type="number"
            min="5"
            step="5"
            value={formData.estimated_duration_mins}
            onChange={(e) =>
              setFormData({ ...formData, estimated_duration_mins: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., important, review, urgent"
          className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
}
