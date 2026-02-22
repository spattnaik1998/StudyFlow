"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Zap,
  BarChart3,
  Calendar,
  Sparkles,
  Command,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Task Parsing",
    description:
      "Just type. Our AI breaks down your confusing assignment into bite-sized, actionable subtasks.",
    color: "from-indigo-500/20 to-indigo-500/10",
    borderColor: "border-indigo-500/20",
  },
  {
    icon: Zap,
    title: "Pomodoro Focus",
    description:
      "Built-in timer with ambient sounds. Track study sessions and build your focus momentum.",
    color: "from-violet-500/20 to-violet-500/10",
    borderColor: "border-violet-500/20",
  },
  {
    icon: Brain,
    title: "Spaced Repetition",
    description:
      "SM-2 algorithm learns your strengths. Review topics at optimal intervals for lasting mastery.",
    color: "from-purple-500/20 to-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Calendar,
    title: "Weekly Calendar",
    description:
      "Visualize your study blocks by day and time. Plan around your classes and commitments.",
    color: "from-blue-500/20 to-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time insights: study hours, task completion, streaks, and topic mastery heatmap.",
    color: "from-cyan-500/20 to-cyan-500/10",
    borderColor: "border-cyan-500/20",
  },
  {
    icon: Command,
    title: "Command Palette",
    description:
      "⌘K to summon the power. Quick navigation, instant task creation, focus session launch.",
    color: "from-pink-500/20 to-pink-500/10",
    borderColor: "border-pink-500/20",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Everything you need to
            <br />
            <span className="gradient-text">dominate your studies</span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Integrated tools designed for the way students actually study.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ borderColor: "#4f46e5", y: -4 }}
                className={`group glass-subtle rounded-xl p-6 border ${feature.borderColor} hover:border-indigo-500/40 transition-all duration-300`}
              >
                {/* Icon background */}
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-indigo-300" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-4 h-0.5 w-0 bg-gradient-to-r from-indigo-500 to-violet-500 group-hover:w-8 transition-all duration-300"></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
