"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StudyHourChartData {
  date: string;
  hours: number;
}

interface StudyHoursChartProps {
  data: StudyHourChartData[];
}

export function StudyHoursChart({ data }: StudyHoursChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#9ca3af"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#6b7280" }}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#6b7280" }}
          label={{ value: "Hours", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          formatter={(value: number | undefined) => {
            if (value === undefined) return ["0 hours", "Study Time"];
            return [`${value.toFixed(1)} hours`, "Study Time"];
          }}
        />
        <Area
          type="monotone"
          dataKey="hours"
          stroke="#4f46e5"
          fillOpacity={1}
          fill="url(#colorHours)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
