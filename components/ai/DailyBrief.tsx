"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DailyBrief() {
  const { data, isLoading } = useQuery({
    queryKey: ["daily_brief"],
    queryFn: async () => {
      const response = await fetch("/api/ai/daily-brief");
      if (!response.ok) throw new Error("Failed to fetch brief");
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="glass-subtle rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Today's Brief</h2>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded animate-pulse"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!data?.success || !data?.data?.brief) {
    return null;
  }

  const { brief, generated_at, cached } = data.data;

  return (
    <div className="glass-subtle rounded-xl border border-white/5 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-bold text-white">Today's Brief</h2>
      </div>
      <div className="space-y-3">
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {brief}
        </p>
        <p className="text-xs text-zinc-500">
          {cached ? "Cached" : "Generated"}{" "}
          {formatDistanceToNow(new Date(generated_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
