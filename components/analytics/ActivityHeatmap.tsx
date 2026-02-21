"use client";

import { useState } from "react";
import { eachDayOfInterval, format, subDays } from "date-fns";

interface ActivityHeatmapProps {
  data: Record<string, number>; // date -> minutes
  streak?: number;
}

const getColor = (minutes: number): string => {
  if (minutes === 0) return "bg-gray-100";
  if (minutes < 30) return "bg-green-100";
  if (minutes < 90) return "bg-green-300";
  if (minutes < 180) return "bg-green-500";
  return "bg-green-700";
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
        <div className="inline-block bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
          <span className="text-sm font-semibold text-orange-700">
            🔥 {streak}-day streak
          </span>
        </div>
      )}

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Legend */}
          <div className="flex items-center gap-2 mb-4 text-xs">
            <span className="text-gray-600">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => {
                const colors = [
                  "#f3f4f6",
                  "#bbf7d0",
                  "#6ee7b7",
                  "#10b981",
                  "#047857",
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
            <span className="text-gray-600">More</span>
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
                          getColor(minutes) || "bg-gray-100"
                        } ${
                          isToday
                            ? "ring-2 ring-blue-500 ring-offset-1"
                            : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
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
                className="fixed bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-50"
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
