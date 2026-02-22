"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { TopicForm } from "@/components/topics/TopicForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Topic } from "@/types/database";

export default function EditTopicPage() {
  const params = useParams();
  const supabase = createClient();
  const topicId = params.id as string;

  const { data: topic, isLoading } = useQuery({
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

  if (isLoading) {
    return <div className="text-center py-12 text-zinc-400">Loading topic...</div>;
  }

  if (!topic) {
    return <div className="text-center py-12 text-zinc-400">Topic not found</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/topics/${topicId}`}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 w-fit"
        >
          <ArrowLeft size={18} />
          Back to topic
        </Link>

        <h1 className="text-3xl font-bold text-white">Edit Topic</h1>
        <p className="text-zinc-400 mt-2">Update topic details</p>
      </div>

      <div className="max-w-2xl bg-zinc-900 rounded-xl border border-white/10 p-8">
        <TopicForm topic={topic} />
      </div>
    </div>
  );
}
