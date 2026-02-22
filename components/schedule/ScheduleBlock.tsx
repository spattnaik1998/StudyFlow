"use client";

import { formatTime } from "@/lib/utils";
import type { ScheduleBlock } from "@/types/database";

interface ScheduleBlockComponentProps {
  block: ScheduleBlock;
}

const blockTypeColors: Record<string, { border: string; bg: string; text: string }> = {
  study:   { border: "#6366f1", bg: "rgba(99,102,241,0.25)",  text: "#a5b4fc" },
  class:   { border: "#3b82f6", bg: "rgba(59,130,246,0.25)",  text: "#93c5fd" },
  exam:    { border: "#ef4444", bg: "rgba(239,68,68,0.25)",   text: "#fca5a5" },
  break:   { border: "#22c55e", bg: "rgba(34,197,94,0.25)",   text: "#86efac" },
  blocked: { border: "#64748b", bg: "rgba(100,116,139,0.25)", text: "#94a3b8" },
};

export function ScheduleBlock({ block }: ScheduleBlockComponentProps) {
  const colors = blockTypeColors[block.block_type] || blockTypeColors.study;
  const displayColor = block.color || colors.border;

  // Determine background color with 18% opacity for better visibility on dark bg
  const bgColor = hexToRgb(displayColor);
  const bgStyle = bgColor
    ? `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.18)`
    : colors.bg;

  const startTime = formatTime(block.start_time);
  const endTime = formatTime(block.end_time);

  return (
    <div
      className="h-full p-2 rounded border-l-4 cursor-pointer hover:brightness-110 transition flex flex-col gap-1 overflow-hidden"
      style={{
        borderLeftColor: displayColor,
        backgroundColor: bgStyle,
      }}
    >
      {/* Title */}
      <div className="font-semibold text-sm text-white leading-tight line-clamp-2">
        {block.title}
      </div>

      {/* Time range */}
      <div className="text-xs font-medium text-zinc-300">
        {startTime} – {endTime}
      </div>

      {/* Block type badge */}
      <div className="mt-auto pt-1">
        <span
          className="inline-block px-2 py-0.5 text-xs font-semibold rounded capitalize"
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
