"use client";

import Link from "next/link";
import { Plus, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { formatDate, daysUntil } from "@/lib/utils";
import type { Project } from "@/types/database";

interface ProjectGridProps {
  projects: Project[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function ProjectGrid({ projects, onDelete, onEdit }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-6">No projects yet. Create your first course!</p>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          New Project
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const daysLeft = project.exam_date ? daysUntil(project.exam_date) : null;
        const isUrgent = daysLeft && daysLeft <= 7;

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group relative block h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition"
          >
            {/* Background color */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundColor: project.color }}
            />

            {/* Content */}
            <div className="relative p-6 h-full flex flex-col justify-between">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {project.emoji && <span className="text-4xl">{project.emoji}</span>}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition line-clamp-2">
                  {project.name}
                </h3>

                {project.course_code && (
                  <p className="text-sm text-gray-600 mt-1">{project.course_code}</p>
                )}
              </div>

              {/* Footer */}
              <div>
                {project.exam_date && (
                  <div
                    className={`p-3 rounded-lg mb-3 ${
                      isUrgent
                        ? "bg-red-50 border border-red-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <p className={`text-sm font-medium ${isUrgent ? "text-red-800" : "text-blue-800"}`}>
                      Exam {formatDate(project.exam_date)}
                    </p>
                    <p className={`text-xs ${isUrgent ? "text-red-600" : "text-blue-600"}`}>
                      {daysLeft} days left
                    </p>
                  </div>
                )}

                {project.instructor && (
                  <p className="text-xs text-gray-500">{project.instructor}</p>
                )}
              </div>
            </div>

            {/* Actions menu */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
              <button className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition">
                <MoreVertical size={16} />
              </button>
            </div>
          </Link>
        );
      })}

      {/* New project card */}
      <Link
        href="/projects/new"
        className="h-64 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-indigo-600 hover:bg-indigo-50 transition"
      >
        <div className="text-center">
          <Plus size={48} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">New Project</p>
        </div>
      </Link>
    </div>
  );
}
