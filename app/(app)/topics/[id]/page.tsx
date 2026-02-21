"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { MasteryBadge } from "@/components/topics/MasteryBadge";
import { Trash2, Edit2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { Topic, TopicReview } from "@/types/database";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const topicId = params.id as string;

  // Fetch topic
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, projects(name, color, emoji)")
        .eq("id", topicId)
        .single();

      if (error) throw error;
      return data as Topic & { projects?: { name: string; color: string; emoji?: string } };
    },
  });

  // Fetch topic reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["topic_reviews", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topic_reviews")
        .select("*")
        .eq("topic_id", topicId)
        .order("reviewed_at", { ascending: false });

      if (error) throw error;
      return data as TopicReview[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("topics").delete().eq("id", topicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      router.push("/app/topics");
    },
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this topic?")) {
      try {
        await deleteMutation.mutateAsync();
      } catch (err) {
        console.error("Error deleting topic:", err);
      }
    }
  };

  if (topicLoading) {
    return <div className="text-center py-12 text-gray-600">Loading topic...</div>;
  }

  if (!topic) {
    return <div className="text-center py-12 text-gray-600">Topic not found</div>;
  }

  const project = topic.projects;
  const nextReviewDate = topic.next_review_at ? new Date(topic.next_review_at) : null;
  const formattedNextReview = nextReviewDate
    ? nextReviewDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not scheduled";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/app/topics"
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 w-fit"
        >
          <ArrowLeft size={18} />
          Back to topics
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{topic.name}</h1>
            {topic.description && (
              <p className="text-gray-600 text-lg mb-4">{topic.description}</p>
            )}

            {project && (
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-sm font-medium text-gray-600">{project.name}</span>
              </div>
            )}

            <MasteryBadge level={topic.mastery_level} />
          </div>

          <div className="flex gap-2">
            <Link
              href={`/app/topics/${topicId}/review`}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Review Now
            </Link>

            <Link
              href={`/app/topics/${topicId}/edit`}
              className="p-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              title="Edit topic"
            >
              <Edit2 size={20} />
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              title="Delete topic"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* SM-2 Stats */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 font-medium mb-1">Ease Factor</div>
          <div className="text-2xl font-bold text-gray-900">{topic.sm2_ease_factor.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 font-medium mb-1">Interval</div>
          <div className="text-2xl font-bold text-gray-900">{topic.sm2_interval} days</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 font-medium mb-1">Repetitions</div>
          <div className="text-2xl font-bold text-gray-900">{topic.sm2_repetitions}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 font-medium mb-1">Next Review</div>
          <div className="text-2xl font-bold text-gray-900">{formattedNextReview}</div>
        </div>
      </div>

      {/* Review History */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Review History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Quality</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Ease Before
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Interval Before
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => {
                  const qualityLabels: Record<number, string> = {
                    0: "Complete blackout",
                    1: "Incorrect answer",
                    2: "Incorrect, felt easy",
                    3: "Correct, with difficulty",
                    4: "Correct, with hesitation",
                    5: "Perfect recall",
                  };

                  return (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">
                        {new Date(review.reviewed_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-semibold text-gray-900">{review.quality}</span>
                        <div className="text-xs text-gray-500">{qualityLabels[review.quality]}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {review.ease_factor_before?.toFixed(2) ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {review.interval_before ?? "—"} days
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No reviews yet. Start your first review!</p>
        </div>
      )}
    </div>
  );
}
