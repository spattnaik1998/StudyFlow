import type { Topic } from "@/types/database";

interface MasteryBadgeProps {
  level: Topic["mastery_level"];
  size?: "sm" | "md";
}

const config = {
  not_started: {
    label: "Not Started",
    bg: "bg-gray-100",
    text: "text-gray-600",
  },
  learning: {
    label: "Learning",
    bg: "bg-red-100",
    text: "text-red-700",
  },
  familiar: {
    label: "Familiar",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  proficient: {
    label: "Proficient",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  mastered: {
    label: "Mastered",
    bg: "bg-green-100",
    text: "text-green-700",
  },
};

export function MasteryBadge({ level, size = "md" }: MasteryBadgeProps) {
  const badgeConfig = config[level];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-block ${sizeClasses} rounded font-medium ${badgeConfig.bg} ${badgeConfig.text}`}
    >
      {badgeConfig.label}
    </span>
  );
}
