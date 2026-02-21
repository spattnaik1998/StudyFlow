"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Edit2, MoreVertical, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/database";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showActions, setShowActions] = useState(false);

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
      window.location.href = "/app/projects";
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Project not found</p>
        <Link href="/app/projects" className="text-indigo-600 hover:underline">
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
            href="/app/projects"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </Link>

          <div>
            <div className="flex items-center gap-3 mb-2">
              {project.emoji && <span className="text-4xl">{project.emoji}</span>}
              <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
            </div>

            {project.course_code && (
              <p className="text-gray-600">{project.course_code}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <MoreVertical size={24} />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
              <Link
                href={`/app/projects/${project.id}/edit`}
                className="block px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2"
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
                className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition"
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
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Exam Date
            </h3>
            <p className="text-2xl font-bold text-gray-900">{formatDate(project.exam_date)}</p>
          </div>
        )}

        {project.instructor && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Instructor
            </h3>
            <p className="text-lg font-semibold text-gray-900">{project.instructor}</p>
          </div>
        )}

        {project.credit_hours && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Credit Hours
            </h3>
            <p className="text-2xl font-bold text-gray-900">{project.credit_hours}</p>
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {/* Tasks section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Tasks</h2>
          <Link
            href={`/app/tasks/new?project=${project.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            Add Task
          </Link>
        </div>

        <div className="text-center py-12 text-gray-600">
          <p>No tasks yet. Create one to get started!</p>
        </div>
      </div>
    </div>
  );
}
