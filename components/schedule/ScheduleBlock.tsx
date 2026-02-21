"use client";

import { formatTime } from "@/lib/utils";
import type { ScheduleBlock } from "@/types/database";

interface ScheduleBlockComponentProps {
  block: ScheduleBlock;
}

const blockTypeColors: Record<string, { border: string; bg: string; text: string }> = {
  study: { border: "#6366f1", bg: "#e0e7ff", text: "#4f46e5" },
  class: { border: "#3b82f6", bg: "#dbeafe", text: "#1e40af" },
  exam: { border: "#ef4444", bg: "#fee2e2", text: "#dc2626" },
  break: { border: "#22c55e", bg: "#dcfce7", text: "#16a34a" },
  blocked: { border: "#64748b", bg: "#f1f5f9", text: "#475569" },
};

export function ScheduleBlock({ block }: ScheduleBlockComponentProps) {
  const colors = blockTypeColors[block.block_type] || blockTypeColors.study;
  const displayColor = block.color || colors.border;

  // Determine background color with 10% opacity
  const bgColor = hexToRgb(displayColor);
  const bgStyle = bgColor
    ? `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.1)`
    : colors.bg;

  const startTime = formatTime(block.start_time);
  const endTime = formatTime(block.end_time);

  return (
    <div
      className="h-full p-2 rounded border-l-4 cursor-pointer hover:shadow-md transition flex flex-col"
      style={{
        borderLeftColor: displayColor,
        backgroundColor: bgStyle,
      }}
    >
      {/* Title */}
      <div className="font-semibold text-sm text-gray-900 truncate flex-1">
        {block.title}
      </div>

      {/* Time range */}
      <div className="text-xs text-gray-600 mt-1">
        {startTime} – {endTime}
      </div>

      {/* Block type badge */}
      <div className="mt-2">
        <span
          className="inline-block px-2 py-1 text-xs font-medium rounded capitalize"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {block.block_type}
        </span>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
