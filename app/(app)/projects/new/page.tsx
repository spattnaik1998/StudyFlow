"use client";

import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-2">Add a new course or subject to StudyFlow</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg shadow p-8">
        <ProjectForm />
      </div>
    </div>
  );
}
