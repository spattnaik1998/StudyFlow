"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface MasteryData {
  name: string;
  mastery: number;
}

interface MasteryRadarProps {
  data: MasteryData[];
}

export function MasteryRadar({ data }: MasteryRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <PolarRadiusAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          domain={[0, 100]}
        />
        <Radar
          name="Mastery Level"
          dataKey="mastery"
          stroke="#4f46e5"
          fill="#4f46e5"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
