"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated blur orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
      <div
        className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm">
            <span className="text-sm font-medium text-indigo-300">
              ✨ AI-Powered Student Productivity
            </span>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="gradient-text">Study Smarter.</span>
          <br />
          <span className="text-white">Not Harder.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Master any subject with AI-powered task breakdown, spaced repetition learning, and Pomodoro focus sessions. Transform overwhelm into flow.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
          >
            Get Started
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass border border-white/20 text-white font-semibold hover:border-indigo-400/40 transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex items-center justify-center gap-2 text-sm text-zinc-500"
        >
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 border-2 border-background flex items-center justify-center text-xs text-white font-bold"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <span>
            Join 1000+ students mastering their studies
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
