"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, Timer } from "lucide-react";

export function PreviewSection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-white mb-4">
            Your command center for
            <br />
            <span className="gradient-text">focused mastery</span>
          </h2>
          <p className="text-xl text-zinc-400">
            A beautiful dashboard that puts you in control.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          whileHover={{ y: -8 }}
          className="glass rounded-2xl border border-white/10 p-8 shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 animate-float"
        >
          {/* Mockup content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500"></div>
                <div>
                  <div className="h-3 w-24 bg-white/10 rounded"></div>
                  <div className="h-2 w-16 bg-white/5 rounded mt-1"></div>
                </div>
              </div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-indigo-500/40"></div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Study Hours", value: "12.5h", icon: Timer },
                { label: "Tasks Done", value: "24", icon: BookOpen },
                { label: "Streak", value: "7d", icon: LayoutDashboard },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (i + 1) }}
                    viewport={{ once: true }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-500 font-medium">
                        {stat.label}
                      </span>
                      <Icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Activity bar */}
            <div className="pt-4 border-t border-white/5">
              <div className="text-xs text-zinc-500 font-medium mb-3">
                Weekly activity
              </div>
              <div className="flex items-end gap-2 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t"
                    style={{ height: `${height}%`, minHeight: "4px" }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features list under mockup */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Real-time Insights",
              desc: "Track every study session, completed task, and mastery milestone.",
            },
            {
              title: "Smart Planning",
              desc: "AI generates optimal study schedules based on your goals.",
            },
            {
              title: "Accountability",
              desc: "Streaks and analytics keep you motivated and on track.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h4 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h4>
              <p className="text-zinc-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
