"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { AITaskInput } from "@/components/ai/AITaskInput";
import { Plus, List, LayoutGrid, Sparkles } from "lucide-react";
import type { Task, Project } from "@/types/database";

type ViewType = "list" | "board";

export default function TasksPage() {
  const supabase = createClient();
  const [view, setView] = useState<ViewType>("list");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAI, setShowAI] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });

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

  const projectsMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const firstProjectId = projects.length > 0 ? projects[0].id : "";

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">View and manage all your study tasks</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            <Sparkles size={20} />
            Add with AI
          </button>
          <Link
            href="/app/tasks/new"
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            New Task
          </Link>
        </div>
      </div>

      {/* AI Input */}
      {showAI && firstProjectId && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AITaskInput projectId={firstProjectId} />
        </div>
      )}

      {/* View toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            view === "list"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <List size={20} />
          List
        </button>
        <button
          onClick={() => setView("board")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            view === "board"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <LayoutGrid size={20} />
          Board
        </button>
      </div>

      {/* Content */}
      {tasksLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      ) : (
        <>
          {view === "list" && (
            <TaskList tasks={tasks} projects={projectsMap} onRefresh={handleRefresh} />
          )}
          {view === "board" && (
            <TaskBoard tasks={tasks} projects={projectsMap} onRefresh={handleRefresh} />
          )}
        </>
      )}
    </div>
  );
}
