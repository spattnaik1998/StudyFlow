"use client";

import { ScheduleBlock as ScheduleBlockComponent } from "./ScheduleBlock";
import type { ScheduleBlock } from "@/types/database";

interface WeekCalendarProps {
  blocks: ScheduleBlock[];
  weekStart: Date;
  onSlotClick: (date: Date) => void;
  onBlockClick: (block: ScheduleBlock) => void;
}

const HOUR_HEIGHT = 64;
const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = END_HOUR - START_HOUR;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function WeekCalendar({
  blocks,
  weekStart,
  onSlotClick,
  onBlockClick,
}: WeekCalendarProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const blocksByDay = days.map((day) =>
    blocks.filter((block) => {
      const blockDate = new Date(block.start_time);
      return (
        blockDate.getFullYear() === day.getFullYear() &&
        blockDate.getMonth() === day.getMonth() &&
        blockDate.getDate() === day.getDate()
      );
    })
  );

  const handleDayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const hourClicked = START_HOUR + offsetY / HOUR_HEIGHT;
    const hour = Math.floor(hourClicked);
    const minute = Math.round((hourClicked - hour) * 60);

    const clickedDate = new Date(days[parseInt(e.currentTarget.dataset.dayIndex || "0")]);
    clickedDate.setHours(hour, minute, 0, 0);

    onSlotClick(clickedDate);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
      {/* Header row with day names */}
      <div className="flex" style={{ minWidth: "900px" }}>
        {/* Time column header */}
        <div style={{ width: 80, flexShrink: 0 }} className="border-b border-white/10 bg-white/5" />

        {/* Day headers */}
        {days.map((day, i) => (
          <div
            key={i}
            style={{ flex: 1, minWidth: 0 }}
            className={`border-b border-l border-white/10 p-3 text-center font-semibold ${
              isToday(day) ? "bg-indigo-900/20" : "bg-white/5"
            }`}
          >
            <div className="text-sm text-zinc-400">{DAYS[day.getDay() === 0 ? 6 : day.getDay() - 1]}</div>
            <div className={`text-lg ${isToday(day) ? "text-indigo-400" : "text-white"}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Body: time + day columns */}
      <div className="overflow-x-auto">
        <div className="flex" style={{ minWidth: "900px", height: HOURS * HOUR_HEIGHT }}>
          {/* Time label column */}
          <div style={{ width: 80, flexShrink: 0 }}>
            {Array.from({ length: HOURS }, (_, hourIndex) => {
              const hour = START_HOUR + hourIndex;
              return (
                <div
                  key={`time-${hour}`}
                  className="border-b border-white/5 pr-2 py-2 text-right text-xs text-zinc-500"
                  style={{ height: HOUR_HEIGHT }}
                >
                  {formatHour(hour)}
                </div>
              );
            })}
          </div>

          {/* Day columns with blocks */}
          {days.map((day, dayIndex) => (
            <div
              key={`day-${dayIndex}`}
              style={{ flex: 1, minWidth: 0, position: "relative", height: HOURS * HOUR_HEIGHT }}
              className="border-l border-white/10"
            >
              {/* Hour divider lines */}
              {Array.from({ length: HOURS }, (_, hourIndex) => (
                <div
                  key={`divider-${hourIndex}`}
                  style={{
                    position: "absolute",
                    top: hourIndex * HOUR_HEIGHT,
                    height: 1,
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                />
              ))}

              {/* Blocks positioned absolutely */}
              {blocksByDay[dayIndex]?.map((block) => {
                const startDate = new Date(block.start_time);
                const endDate = new Date(block.end_time);

                const startHour = startDate.getHours();
                const startMinute = startDate.getMinutes();
                const topOffset = ((startHour - START_HOUR) + startMinute / 60) * HOUR_HEIGHT;

                const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
                const height = Math.max(30, (durationMinutes / 60) * HOUR_HEIGHT);

                return (
                  <div
                    key={block.id}
                    style={{
                      position: "absolute",
                      top: topOffset,
                      left: 2,
                      right: 2,
                      height: height,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBlockClick(block);
                    }}
                  >
                    <ScheduleBlockComponent block={block} />
                  </div>
                );
              })}

              {/* Clickable overlay */}
              <div
                style={{ position: "absolute", inset: 0 }}
                data-day-index={dayIndex}
                onClick={handleDayClick}
                className="cursor-pointer hover:bg-indigo-500/5 transition"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}${period}`;
}
