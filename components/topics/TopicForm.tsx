"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Project, Topic } from "@/types/database";

interface TopicFormProps {
  topic?: Topic;
  projectId?: string;
  onSubmit?: () => void;
}

export function TopicForm({ topic, projectId, onSubmit }: TopicFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialProjectId = projectId || topic?.project_id || "";

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

  const masteryLevels = [
    { value: "not_started", label: "Not Started" },
    { value: "learning", label: "Learning" },
    { value: "familiar", label: "Familiar" },
    { value: "proficient", label: "Proficient" },
    { value: "mastered", label: "Mastered" },
  ];

  const [formData, setFormData] = useState({
    project_id: initialProjectId,
    name: topic?.name || "",
    description: topic?.description || "",
    mastery_level: topic?.mastery_level || "not_started",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        sm2_ease_factor: topic?.sm2_ease_factor ?? 2.5,
        sm2_interval: topic?.sm2_interval ?? 0,
        sm2_repetitions: topic?.sm2_repetitions ?? 0,
        next_review_at: topic?.next_review_at ?? null,
        last_reviewed_at: topic?.last_reviewed_at ?? null,
      };

      if (topic) {
        const { error: updateError } = await supabase
          .from("topics")
          .update(submitData)
          .eq("id", topic.id);

        if (updateError) throw updateError;
      } else {
        const { data } = await supabase.auth.getSession();
        const userId = data?.session?.user?.id ?? "dev";

        const { error: insertError } = await supabase
          .from("topics")
          .insert([{ ...submitData, user_id: userId }]);

        if (insertError) throw insertError;
      }

      onSubmit?.();
      router.push("/topics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project *
        </label>
        <select
          required
          value={formData.project_id}
          onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Photosynthesis"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Notes about what you need to know for this topic"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Initial Mastery Level
        </label>
        <select
          value={formData.mastery_level}
          onChange={(e) =>
            setFormData({ ...formData, mastery_level: e.target.value as any })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {masteryLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : topic ? "Update Topic" : "Create Topic"}
        </button>
      </div>
    </form>
  );
}
