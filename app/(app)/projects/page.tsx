"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import type { Project } from "@/types/database";

export default function ProjectsPage() {
  const supabase = createClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Your Projects</h1>
        <p className="text-zinc-400">
          Manage your courses and subjects. Click on a project to view tasks.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">Loading projects...</p>
        </div>
      ) : (
        <ProjectGrid projects={projects} />
      )}
    </div>
  );
}
