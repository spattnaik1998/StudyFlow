"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Trash2, CheckCircle2, Circle, AlertCircle, Edit2 } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import { showSuccess, showError } from "@/lib/toast";
import type { Task, Project } from "@/types/database";

interface TaskListProps {
  tasks: Task[];
  projects: Map<string, Project>;
  onRefresh?: () => void;
}

export function TaskList({ tasks, projects, onRefresh }: TaskListProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: "todo" | "in_progress" | "done";
    }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onRefresh?.();
      showSuccess("Task updated");
    },
    onError: () => {
      showError("Could not update task", "Please try again.");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onRefresh?.();
      showSuccess("Task deleted");
    },
    onError: () => {
      showError("Could not delete task", "Please try again.");
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400 bg-red-900/20";
      case "high":
        return "text-orange-400 bg-orange-900/20";
      case "medium":
        return "text-blue-400 bg-blue-900/20";
      default:
        return "text-zinc-400 bg-white/5";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 size={18} className="text-green-500" />;
      case "in_progress":
        return <AlertCircle size={18} className="text-blue-400" />;
      default:
        return <Circle size={18} className="text-zinc-500" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900 border border-white/10 rounded-xl">
        <p className="text-zinc-400 mb-4">No tasks yet</p>
        <Link
          href="/tasks/new"
          className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Create Task
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-400">Task</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-400">Project</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-400">Priority</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-400">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-400">Due Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-400">Duration</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-white/5 hover:bg-white/5 transition"
              onMouseEnter={() => setHoveredTaskId(task.id)}
              onMouseLeave={() => setHoveredTaskId(null)}
            >
              <td className="px-6 py-4">
                <button
                  onClick={() =>
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      status: task.status === "done" ? "todo" : "done",
                    })
                  }
                  className="flex items-center gap-3 hover:underline text-white"
                >
                  {getStatusIcon(task.status)}
                  <span
                    className={task.status === "done" ? "line-through text-zinc-500" : ""}
                  >
                    {task.title}
                  </span>
                </button>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-400">
                {projects.get(task.project_id)?.name || "—"}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-zinc-300">
                  {task.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-400">
                {task.due_date ? formatDate(task.due_date) : "—"}
              </td>
              <td className="px-6 py-4 text-sm text-zinc-400">
                {task.estimated_duration_mins
                  ? formatDuration(task.estimated_duration_mins)
                  : "—"}
              </td>
              <td className="px-6 py-4 text-right">
                {hoveredTaskId === task.id && (
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/tasks/${task.id}/edit`}
                      className="p-1 hover:bg-white/10 rounded transition text-zinc-400"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm("Delete this task?")) {
                          deleteTaskMutation.mutate(task.id);
                        }
                      }}
                      className="p-1 hover:bg-red-900/20 text-red-400 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
