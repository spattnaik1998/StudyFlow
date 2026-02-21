"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUIStore } from "@/stores/useUIStore";
import { Menu, X, Plus, LayoutDashboard, Calendar, BookOpen, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types/database";

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const supabase = createClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              StudyFlow
            </h1>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <Link
              href="/app/dashboard"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/app/tasks"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              <BookOpen size={20} />
              <span>Tasks</span>
            </Link>

            <Link
              href="/app/schedule"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              <Calendar size={20} />
              <span>Schedule</span>
            </Link>

            {/* Projects Section */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Projects</h3>
                <Link
                  href="/app/projects/new"
                  className="p-1 rounded hover:bg-gray-100 transition"
                  title="New project"
                >
                  <Plus size={16} />
                </Link>
              </div>

              <div className="space-y-1">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/app/projects/${project.id}`}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
                  >
                    {project.emoji ? (
                      <span className="text-lg">{project.emoji}</span>
                    ) : (
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: project.color }}
                      />
                    )}
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Bottom Navigation */}
          <div className="px-4 py-4 border-t border-gray-200">
            <Link
              href="/app/settings"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Content margin */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-0"}`}
      />
    </>
  );
}
