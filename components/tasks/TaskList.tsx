"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Trash2, CheckCircle2, Circle, AlertCircle, Edit2 } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
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
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 size={18} className="text-green-600" />;
      case "in_progress":
        return <AlertCircle size={18} className="text-blue-600" />;
      default:
        return <Circle size={18} className="text-gray-400" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600 mb-4">No tasks yet</p>
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Task</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Project</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b hover:bg-gray-50 transition"
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
                  className="flex items-center gap-3 hover:underline text-gray-900"
                >
                  {getStatusIcon(task.status)}
                  <span
                    className={task.status === "done" ? "line-through text-gray-500" : ""}
                  >
                    {task.title}
                  </span>
                </button>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {projects.get(task.project_id)?.name || "—"}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {task.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {task.due_date ? formatDate(task.due_date) : "—"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {task.estimated_duration_mins
                  ? formatDuration(task.estimated_duration_mins)
                  : "—"}
              </td>
              <td className="px-6 py-4 text-right">
                {hoveredTaskId === task.id && (
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/tasks/${task.id}/edit`}
                      className="p-1 hover:bg-gray-200 rounded transition"
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
                      className="p-1 hover:bg-red-100 text-red-600 rounded transition"
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
