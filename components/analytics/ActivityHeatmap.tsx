"use client";

import { useState } from "react";
import { eachDayOfInterval, format, subDays } from "date-fns";

interface ActivityHeatmapProps {
  data: Record<string, number>; // date -> minutes
  streak?: number;
}

const getColor = (minutes: number): string => {
  if (minutes === 0) return "bg-white/5";
  if (minutes < 30) return "bg-green-900/40";
  if (minutes < 90) return "bg-green-800/60";
  if (minutes < 180) return "bg-green-700/80";
  return "bg-green-600";
};

const getHexColor = (minutes: number): string => {
  if (minutes === 0) return "#f3f4f6";
  if (minutes < 30) return "#bbf7d0";
  if (minutes < 90) return "#6ee7b7";
  if (minutes < 180) return "#10b981";
  return "#047857";
};

export function ActivityHeatmap({ data, streak = 0 }: ActivityHeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const endDate = new Date();
  const startDate = subDays(endDate, 89); // 90 days including today

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Group days into weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const handleCellHover = (
    date: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    setHoveredDate(date);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  return (
    <div className="space-y-4">
      {/* Streak badge */}
      {streak > 0 && (
        <div className="inline-block bg-orange-500/15 border border-orange-500/30 rounded-full px-4 py-2">
          <span className="text-sm font-semibold text-orange-300">
            🔥 {streak}-day streak
          </span>
        </div>
      )}

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Legend */}
          <div className="flex items-center gap-2 mb-4 text-xs">
            <span className="text-zinc-500">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => {
                const colors = [
                  "rgba(255,255,255,0.05)",
                  "#1b4332",
                  "#2d6a4f",
                  "#40916c",
                  "#52b788",
                ];
                return (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: colors[i] }}
                  />
                );
              })}
            </div>
            <span className="text-zinc-500">More</span>
          </div>

          {/* Grid */}
          <div className="relative">
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const minutes = data[dateStr] || 0;
                    const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

                    return (
                      <div
                        key={dateStr}
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${
                          getColor(minutes) || "bg-white/5"
                        } ${
                          isToday
                            ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-background"
                            : "hover:ring-2 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-background"
                        }`}
                        style={{ backgroundColor: getHexColor(minutes) }}
                        onMouseEnter={(e) => handleCellHover(dateStr, e)}
                        onMouseLeave={() => setHoveredDate(null)}
                        title={`${dateStr}: ${minutes} minutes`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Tooltip */}
            {hoveredDate && tooltipPos && (
              <div
                className="fixed bg-background text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-50 border border-white/10 shadow-lg"
                style={{
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                  transform: "translate(-50%, -100%)",
                }}
              >
                {hoveredDate}: {data[hoveredDate] || 0} minutes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
