"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { colorOptions } from "@/lib/utils";
import type { Project } from "@/types/database";

const emojis = [
  "📚", "📖", "🧪", "🔬", "💻", "🖥️", "📐", "🧮", "📊",
  "🎨", "🎭", "🎵", "🎸", "📝", "✏️", "🖊️", "📓", "🗂️"
];

interface ProjectFormProps {
  project?: Project;
  onSubmit?: () => void;
}

export function ProjectForm({ project, onSubmit }: ProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    color: project?.color || "#6366f1",
    emoji: project?.emoji || "📚",
    course_code: project?.course_code || "",
    instructor: project?.instructor || "",
    credit_hours: project?.credit_hours || 0,
    exam_date: project?.exam_date || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sanitize form data: convert empty strings to null, NaN to null
      const sanitizedData = {
        ...formData,
        exam_date: formData.exam_date || null,
        credit_hours: isNaN(Number(formData.credit_hours)) ? null : formData.credit_hours,
      };

      if (project) {
        // Update existing project
        const { error: updateError } = await supabase
          .from("projects")
          .update(sanitizedData)
          .eq("id", project.id);

        if (updateError) throw updateError;
      } else {
        // Create new project
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error: insertError } = await supabase
          .from("projects")
          .insert([{ ...sanitizedData, user_id: user.id }]);

        if (insertError) throw insertError;
      }

      // Invalidate projects cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      onSubmit?.();
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Biology 101"
          className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 bg-white/5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
          rows={3}
          className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 bg-white/5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setFormData({ ...formData, color: option.hex })}
                className={`w-10 h-10 rounded-lg transition border-2 ${
                  formData.color === option.hex
                    ? "border-gray-900"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: option.hex }}
                title={option.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Emoji
          </label>
          <div className="grid grid-cols-6 gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, emoji })}
                className={`p-2 rounded-lg text-lg transition ${
                  formData.emoji === emoji
                    ? "bg-indigo-100 border-2 border-indigo-600"
                    : "hover:bg-white/10"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Course Code
          </label>
          <input
            type="text"
            value={formData.course_code}
            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
            placeholder="e.g., BIO-101"
            className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 bg-white/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Instructor
          </label>
          <input
            type="text"
            value={formData.instructor}
            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            placeholder="e.g., Dr. Smith"
            className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 bg-white/5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Credit Hours
          </label>
          <input
            type="number"
            step="0.5"
            value={formData.credit_hours}
            onChange={(e) =>
              setFormData({ ...formData, credit_hours: parseFloat(e.target.value) })
            }
            className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 bg-white/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Exam Date
          </label>
          <input
            type="date"
            value={formData.exam_date}
            onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
            className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 bg-white/5"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
        </button>
      </div>
    </form>
  );
}
