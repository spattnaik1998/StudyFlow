"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { TopicCard } from "@/components/topics/TopicCard";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Topic, Project } from "@/types/database";

export default function TopicsPage() {
  const supabase = createClient();
  const [filterProject, setFilterProject] = useState<string>("");
  const [filterMastery, setFilterMastery] = useState<string>("");

  // Fetch all topics with their projects
  const { data: topics = [] } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, projects(name, color, emoji)")
        .order("name");

      if (error) throw error;
      return data as (Topic & { projects?: { name: string; color: string; emoji?: string } })[];
    },
  });

  // Fetch projects for filter dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      return data as Project[];
    },
  });

  // Filter topics
  const filteredTopics = topics.filter((topic) => {
    if (filterProject && topic.project_id !== filterProject) return false;
    if (filterMastery && topic.mastery_level !== filterMastery) return false;
    return true;
  });

  // Find topics due for review
  const now = new Date();
  const dueTopics = topics.filter(
    (topic) => topic.next_review_at && new Date(topic.next_review_at) <= now
  );

  const masteryLevels = [
    { value: "not_started", label: "Not Started" },
    { value: "learning", label: "Learning" },
    { value: "familiar", label: "Familiar" },
    { value: "proficient", label: "Proficient" },
    { value: "mastered", label: "Mastered" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Topics</h1>
          <p className="text-gray-600 mt-2">Your spaced repetition learning library</p>
        </div>

        <Link
          href="/topics/new"
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          New Topic
        </Link>
      </div>

      {/* Due for review banner */}
      {dueTopics.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-blue-900 font-medium">
              {dueTopics.length} topic{dueTopics.length !== 1 ? "s" : ""} due for review today
            </p>
            {dueTopics.length > 0 && (
              <Link
                href={`/topics/${dueTopics[0].id}/review`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
              >
                Start Review Session
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mastery Level</label>
          <select
            value={filterMastery}
            onChange={(e) => setFilterMastery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Levels</option>
            {masteryLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Topics grid */}
      {filteredTopics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No topics found</p>
          {topics.length === 0 && (
            <Link
              href="/topics/new"
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
              Create your first topic
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
}
