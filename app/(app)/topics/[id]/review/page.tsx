"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { MasteryBadge } from "@/components/topics/MasteryBadge";
import { computeSM2 } from "@/lib/sm2";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { Topic } from "@/types/database";

type ReviewPhase = "studying" | "rating" | "done";

export default function ReviewSessionPage() {
  const params = useParams();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const topicId = params.id as string;
  const [phase, setPhase] = useState<ReviewPhase>("studying");
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);

  // Fetch topic
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("id", topicId)
        .single();

      if (error) throw error;
      return data as Topic;
    },
  });

  // Submit review mutation
  const submitMutation = useMutation({
    mutationFn: async (quality: number) => {
      if (!topic) throw new Error("Topic not found");

      // Get current user
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id ?? "dev";

      // Compute SM-2 result
      const sm2Result = computeSM2(
        quality,
        topic.sm2_ease_factor,
        topic.sm2_interval,
        topic.sm2_repetitions
      );

      // Update topic with new SM-2 values
      const { error: updateError } = await supabase
        .from("topics")
        .update({
          sm2_ease_factor: sm2Result.ease_factor,
          sm2_interval: sm2Result.interval,
          sm2_repetitions: sm2Result.repetitions,
          next_review_at: sm2Result.next_review_at.toISOString(),
          last_reviewed_at: new Date().toISOString(),
          mastery_level: sm2Result.mastery_level,
        })
        .eq("id", topicId);

      if (updateError) throw updateError;

      // Record review in topic_reviews table
      const { error: reviewError } = await supabase.from("topic_reviews").insert([
        {
          topic_id: topicId,
          user_id: userId,
          quality,
          ease_factor_before: topic.sm2_ease_factor,
          interval_before: topic.sm2_interval,
          reviewed_at: new Date().toISOString(),
        } as any,
      ]);

      if (reviewError) throw reviewError;

      return sm2Result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic", topicId] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      setPhase("done");
    },
  });

  const handleSubmitQuality = async () => {
    if (selectedQuality === null) return;
    await submitMutation.mutateAsync(selectedQuality);
  };

  const qualityOptions = [
    {
      value: 0,
      label: "0 — Complete blackout",
      description: "Total failure to recall",
    },
    {
      value: 1,
      label: "1 — Incorrect answer",
      description: "But recognized the correct answer",
    },
    {
      value: 2,
      label: "2 — Incorrect, felt easy",
      description: "The correct answer felt easy",
    },
    {
      value: 3,
      label: "3 — Correct, with difficulty",
      description: "Correct answer after some struggle",
    },
    {
      value: 4,
      label: "4 — Correct, with hesitation",
      description: "Correct with minor hesitation",
    },
    {
      value: 5,
      label: "5 — Perfect recall",
      description: "Instant recall with confidence",
    },
  ];

  if (topicLoading) {
    return <div className="text-center py-12 text-gray-600">Loading topic...</div>;
  }

  if (!topic) {
    return <div className="text-center py-12 text-gray-600">Topic not found</div>;
  }

  return (
    <div>
      <Link
        href={`/app/topics/${topicId}`}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 w-fit"
      >
        <ArrowLeft size={18} />
        Back to topic
      </Link>

      <div className="max-w-2xl mx-auto">
        {/* Studying Phase */}
        {phase === "studying" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Review Session
              </h2>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{topic.name}</h1>

              {topic.description && (
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {topic.description}
                </p>
              )}

              <div className="mb-6">
                <MasteryBadge level={topic.mastery_level} />
              </div>

              <button
                onClick={() => setPhase("rating")}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-lg"
              >
                I've reviewed this topic →
              </button>
            </div>
          </div>
        )}

        {/* Rating Phase */}
        {phase === "rating" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                How well did you know this?
              </h2>

              <div className="space-y-3 mb-8">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedQuality(option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      selectedQuality === option.value
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmitQuality}
                disabled={selectedQuality === null || submitMutation.isPending}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitMutation.isPending ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        )}

        {/* Done Phase */}
        {phase === "done" && topic && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Review Complete! 🎉
              </h2>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">Great work!</h1>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">Your new mastery level:</p>
                <MasteryBadge level={topic.mastery_level} />
              </div>

              {topic.next_review_at && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Next review:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(topic.next_review_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Link
                  href="/app/topics"
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium text-center"
                >
                  Back to Topics
                </Link>

                <Link
                  href="/app/topics"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-center"
                >
                  Review Another Topic
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
