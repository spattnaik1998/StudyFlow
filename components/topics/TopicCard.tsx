"use client";

import Link from "next/link";
import { MasteryBadge } from "./MasteryBadge";
import type { Topic } from "@/types/database";

interface TopicCardProps {
  topic: Topic & { projects?: { name: string; color: string; emoji?: string } };
  onClick?: () => void;
}

export function TopicCard({ topic }: TopicCardProps) {
  const project = topic.projects;
  const now = new Date();
  const nextReview = topic.next_review_at ? new Date(topic.next_review_at) : null;
  const isDueNow = nextReview && nextReview <= now;
  const daysUntilReview = nextReview
    ? Math.ceil((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const intervalLabel =
    topic.sm2_interval === 0
      ? "No interval"
      : topic.sm2_interval === 1
      ? "Every day"
      : `Every ${topic.sm2_interval} days`;

  return (
    <Link href={`/topics/${topic.id}`}>
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 hover:border-white/20 hover:shadow-lg transition h-full flex flex-col cursor-pointer">
        {/* Header with project */}
        {project && (
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs font-medium text-zinc-400">{project.name}</span>
          </div>
        )}

        {/* Topic name */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{topic.name}</h3>

        {/* Description */}
        {topic.description && (
          <p className="text-sm text-zinc-400 mb-3 line-clamp-2 flex-grow">
            {topic.description}
          </p>
        )}

        {/* Mastery badge */}
        <div className="mb-3">
          <MasteryBadge level={topic.mastery_level} size="sm" />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
          <div>
            {isDueNow ? (
              <span className="font-medium text-red-400">Due now!</span>
            ) : nextReview ? (
              <span className="text-zinc-400">
                In {daysUntilReview} day{daysUntilReview !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-zinc-500">Not started</span>
            )}
          </div>
          <span className="text-zinc-500">{intervalLabel}</span>
        </div>
      </div>
    </Link>
  );
}
