"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  color = "from-indigo-600 to-purple-600",
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let currentValue = 0;
    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      currentValue = Math.floor(value * progress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-subtle rounded-xl p-6 border border-white/5 hover:border-indigo-500/20"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-white">{displayValue}</p>
            {unit && <span className="text-sm text-zinc-500">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div
            className={`bg-gradient-to-br ${color} p-3 rounded-lg text-white`}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
