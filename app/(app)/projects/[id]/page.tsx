"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { StudyPlanModal } from "@/components/ai/StudyPlanModal";
import { ArrowLeft, Edit2, MoreVertical, Plus, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/database";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showActions, setShowActions] = useState(false);
  const [showStudyPlan, setShowStudyPlan] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({ status: "archived" })
        .eq("id", params.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      window.location.href = "/projects";
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
        <p className="text-zinc-400 mb-4">Project not found</p>
        <Link href="/projects" className="text-indigo-400 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-zinc-400" />
          </Link>

          <div>
            <div className="flex items-center gap-3 mb-2">
              {project.emoji && <span className="text-4xl">{project.emoji}</span>}
              <h1 className="text-4xl font-bold text-white">{project.name}</h1>
            </div>

            {project.course_code && (
              <p className="text-zinc-400">{project.course_code}</p>
            )}
          </div>
        </div>

        <div className="relative flex gap-2">
          {project.exam_date && (
            <button
              onClick={() => setShowStudyPlan(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              <Sparkles size={20} />
              Generate Plan
            </button>
          )}
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <MoreVertical size={24} className="text-zinc-400" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-10 w-48 bg-zinc-800 border border-white/10 rounded-lg shadow-lg z-10">
              <Link
                href={`/projects/${project.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-zinc-300 transition"
              >
                <Edit2 size={16} />
                Edit Project
              </Link>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to archive this project?")) {
                    deleteMutation.mutate();
                  }
                }}
                className="block w-full text-left px-4 py-2 hover:bg-red-900/20 text-red-400 transition"
              >
                Archive Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {project.exam_date && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-500 uppercase mb-2">
              Exam Date
            </h3>
            <p className="text-2xl font-bold text-white">{formatDate(project.exam_date)}</p>
          </div>
        )}

        {project.instructor && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-500 uppercase mb-2">
              Instructor
            </h3>
            <p className="text-lg font-semibold text-white">{project.instructor}</p>
          </div>
        )}

        {project.credit_hours && (
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-500 uppercase mb-2">
              Credit Hours
            </h3>
            <p className="text-2xl font-bold text-white">{project.credit_hours}</p>
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Description</h2>
          <p className="text-zinc-300 whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {/* Tasks section */}
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Tasks</h2>
          <Link
            href={`/tasks/new?project=${project.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            Add Task
          </Link>
        </div>

        <div className="text-center py-12 text-zinc-500">
          <p>No tasks yet. Create one to get started!</p>
        </div>
      </div>

      {/* Study Plan Modal */}
      {project.exam_date && (
        <StudyPlanModal
          project={project}
          open={showStudyPlan}
          onOpenChange={setShowStudyPlan}
        />
      )}
    </div>
  );
}
