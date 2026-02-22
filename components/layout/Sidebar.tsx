"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { Menu, X, Plus, LayoutDashboard, Calendar, BookOpen, Settings, Timer, Brain, BarChart2, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types/database";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) return null;
      return data;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-400"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#0f0f17]/90 backdrop-blur-xl border-r border-white/5 z-40 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              StudyFlow
            </h1>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition border-l-2 ${
                pathname === "/dashboard"
                  ? "bg-indigo-500/15 text-white border-l-indigo-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-transparent"
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/tasks"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition border-l-2 ${
                pathname === "/tasks"
                  ? "bg-indigo-500/15 text-white border-l-indigo-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-transparent"
              }`}
            >
              <BookOpen size={20} />
              <span>Tasks</span>
            </Link>

            <Link
              href="/schedule"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition border-l-2 ${
                pathname === "/schedule"
                  ? "bg-indigo-500/15 text-white border-l-indigo-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-transparent"
              }`}
            >
              <Calendar size={20} />
              <span>Schedule</span>
            </Link>

            <Link
              href="/focus"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition border-l-2 ${
                pathname === "/focus"
                  ? "bg-indigo-500/15 text-white border-l-indigo-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-transparent"
              }`}
            >
              <Timer size={20} />
              <span>Focus</span>
            </Link>

            <Link
              href="/topics"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition border-l-2 ${
                pathname === "/topics"
                  ? "bg-indigo-500/15 text-white border-l-indigo-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-transparent"
              }`}
            >
              <Brain size={20} />
              <span>Learn</span>
            </Link>

            <Link
              href="/analytics"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition border-l-2 ${
                pathname === "/analytics"
                  ? "bg-indigo-500/15 text-white border-l-indigo-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-transparent"
              }`}
            >
              <BarChart2 size={20} />
              <span>Analytics</span>
            </Link>

            {/* Projects Section */}
            <div className="mt-8 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Projects</h3>
                <Link
                  href="/projects/new"
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  title="New project"
                >
                  <Plus size={16} />
                </Link>
              </div>

              <div className="space-y-1">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm border-l-2 ${
                      pathname === `/projects/${project.id}`
                        ? "bg-indigo-500/15 text-white border-l-indigo-400"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-transparent"
                    }`}
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
          <div className="px-4 py-4 border-t border-white/5 space-y-3">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition border-l-2 ${
                pathname === "/settings"
                  ? "bg-indigo-500/15 text-white border-l-indigo-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white border-l-transparent"
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>

            {/* User Profile Section */}
            {profile && (
              <div className="pt-3 border-t border-white/5">
                <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-lg">
                  <p className="text-sm font-medium text-white truncate">
                    {profile.full_name || "Student"}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-1">
                    {profile.email || ""}
                  </p>
                </div>
              </div>
            )}

            {/* Logout: always visible */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition w-full"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
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
