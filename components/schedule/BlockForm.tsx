"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { colors, colorOptions } from "@/lib/utils";
import { X, Trash2 } from "lucide-react";
import type { ScheduleBlock, Project } from "@/types/database";

interface BlockFormProps {
  block?: ScheduleBlock | null;
  selectedDate?: Date | null;
  projects: Project[];
  onSubmit: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function BlockForm({
  block,
  selectedDate,
  projects,
  onSubmit,
  onDelete,
  onClose,
  isLoading,
}: BlockFormProps) {
  const supabase = createClient();
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: block?.title || "",
    block_type: (block?.block_type || "study") as
      | "study"
      | "class"
      | "exam"
      | "break"
      | "blocked",
    start_time: block
      ? new Date(block.start_time).toISOString().slice(0, 16)
      : selectedDate
      ? new Date(selectedDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    end_time: block
      ? new Date(block.end_time).toISOString().slice(0, 16)
      : selectedDate
      ? new Date(new Date(selectedDate).getTime() + 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16)
      : new Date(new Date().getTime() + 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
    color: block?.color || colors.indigo,
    project_id: block?.project_id || "",
  });

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id ?? "dev");
    };
    getUser();
  }, []);

  const validateForm = (): boolean => {
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }

    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);

    if (endTime <= startTime) {
      setError("End time must be after start time");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLocalLoading(true);

    try {
      const submitData = {
        title: formData.title,
        block_type: formData.block_type,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        color: formData.color,
        project_id: formData.project_id || null,
        task_id: null,
        is_recurring: false,
        recurrence_rule: null,
        user_id: userId,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!block) return;

    setDeleteLoading(true);
    try {
      await onDelete(block.id);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#12121e] border border-white/10 rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {block ? "Edit Block" : "New Schedule Block"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Chemistry Lecture"
              className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500"
            />
          </div>

          {/* Block type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type *
            </label>
            <select
              value={formData.block_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  block_type: e.target.value as any,
                })
              }
              className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="study" className="bg-zinc-900">Study Session</option>
              <option value="class" className="bg-zinc-900">Class</option>
              <option value="exam" className="bg-zinc-900">Exam</option>
              <option value="break" className="bg-zinc-900">Break</option>
              <option value="blocked" className="bg-zinc-900">Blocked Time</option>
            </select>
          </div>

          {/* Start time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.start_time}
              onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
              }
              className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* End time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.end_time}
              onChange={(e) =>
                setFormData({ ...formData, end_time: e.target.value })
              }
              className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, color: option.hex })
                  }
                  className={`w-8 h-8 rounded-full transition ${
                    formData.color === option.hex
                      ? "ring-2 ring-offset-2 ring-white/40"
                      : ""
                  }`}
                  style={{ backgroundColor: option.hex }}
                  title={option.name}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-8 h-8 rounded-full cursor-pointer border border-white/20"
                title="Custom color"
              />
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project
            </label>
            <select
              value={formData.project_id}
              onChange={(e) =>
                setFormData({ ...formData, project_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-white/20 bg-white/5 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="bg-zinc-900">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            {block && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={deleteLoading}
                className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={20} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 transition font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || localLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || localLoading
                ? "Saving..."
                : block
                ? "Update Block"
                : "Create Block"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
