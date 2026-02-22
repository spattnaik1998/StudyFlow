"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { GripVertical, Trash2, Edit2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Task, Project } from "@/types/database";

interface TaskBoardProps {
  tasks: Task[];
  projects: Map<string, Project>;
  onRefresh?: () => void;
}

type StatusType = "todo" | "in_progress" | "done";

const statuses: Array<{ id: StatusType; label: string; color: string }> = [
  { id: "todo", label: "To Do", color: "bg-white/5" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-900/20" },
  { id: "done", label: "Done", color: "bg-green-900/20" },
];

export function TaskBoard({ tasks, projects, onRefresh }: TaskBoardProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: StatusType }) => {
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

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: StatusType) => {
    if (draggedTask) {
      updateTaskMutation.mutate({ taskId: draggedTask.id, status });
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status: StatusType) => {
    return tasks.filter((t) => t.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-blue-500";
      default:
        return "border-l-zinc-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const statusTasks = getTasksByStatus(status.id);

        return (
          <div
            key={status.id}
            className={`${status.color} border border-white/10 rounded-xl p-4 min-w-[300px] min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status.id)}
          >
            <div className="mb-4">
              <h3 className="font-semibold text-white text-lg">
                {status.label} ({statusTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {statusTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className={`group bg-zinc-900 border border-white/10 rounded-lg shadow p-4 cursor-move hover:border-white/20 transition border-l-4 ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <GripVertical size={16} className="text-zinc-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm truncate">
                        {task.title}
                      </h4>
                      {task.due_date && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Due: {formatDate(task.due_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded text-xs bg-indigo-900/30 text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 2 && (
                        <span className="text-xs text-zinc-500">
                          +{task.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-500">
                      {projects.get(task.project_id)?.name || "—"}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="p-1 hover:bg-white/10 rounded transition text-zinc-400"
                        title="Edit"
                      >
                        <Edit2 size={14} />
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
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
