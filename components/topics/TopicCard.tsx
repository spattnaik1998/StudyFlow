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
    <Link href={`/app/topics/${topic.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition h-full flex flex-col cursor-pointer">
        {/* Header with project */}
        {project && (
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs font-medium text-gray-600">{project.name}</span>
          </div>
        )}

        {/* Topic name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{topic.name}</h3>

        {/* Description */}
        {topic.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
            {topic.description}
          </p>
        )}

        {/* Mastery badge */}
        <div className="mb-3">
          <MasteryBadge level={topic.mastery_level} size="sm" />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <div>
            {isDueNow ? (
              <span className="font-medium text-red-600">Due now!</span>
            ) : nextReview ? (
              <span className="text-gray-600">
                In {daysUntilReview} day{daysUntilReview !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-gray-500">Not started</span>
            )}
          </div>
          <span className="text-gray-500">{intervalLabel}</span>
        </div>
      </div>
    </Link>
  );
}
