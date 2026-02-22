"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ProjectForm } from "@/components/projects/ProjectForm";
import type { Project } from "@/types/database";

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      return data as Project;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Project not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Project</h1>
        <p className="text-zinc-400 mt-2">Update project details</p>
      </div>

      <div className="max-w-2xl bg-zinc-900 rounded-xl border border-white/10 p-8">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
