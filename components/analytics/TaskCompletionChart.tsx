"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TaskCompletionData {
  week: string;
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

interface TaskCompletionChartProps {
  data: TaskCompletionData[];
}

const priorityColors = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  urgent: "#991b1b",
};

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="week"
          stroke="#9ca3af"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#6b7280" }}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#6b7280" }}
          label={{ value: "Tasks", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="low" stackId="a" fill={priorityColors.low} name="Low" />
        <Bar dataKey="medium" stackId="a" fill={priorityColors.medium} name="Medium" />
        <Bar dataKey="high" stackId="a" fill={priorityColors.high} name="High" />
        <Bar dataKey="urgent" stackId="a" fill={priorityColors.urgent} name="Urgent" />
      </BarChart>
    </ResponsiveContainer>
  );
}
