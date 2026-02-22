import { createServerClient_ } from "@/lib/supabase/server";
import { DailyBrief } from "@/components/ai/DailyBrief";

export default async function DashboardPage() {
  const supabase = await createServerClient_();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profile = null;
  let studyHoursToday = 0;
  let tasksCompleted = 0;
  let currentStreak = 0;

  if (session) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallelize all queries
    const [profileRes, sessionsRes, completedTasksRes, allSessionsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single(),
      supabase
        .from("task_sessions")
        .select("actual_duration_minutes")
        .eq("user_id", session.user.id)
        .gte("started_at", today.toISOString()),
      supabase
        .from("tasks")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("status", "done")
        .gte("completed_at", today.toISOString()),
      supabase
        .from("task_sessions")
        .select("started_at")
        .eq("user_id", session.user.id)
        .order("started_at", { ascending: false }),
    ]);

    profile = profileRes.data;
    const sessions = sessionsRes.data;
    const completedTasks = completedTasksRes.data;
    const allSessions = allSessionsRes.data;

    studyHoursToday = Math.round(
      (sessions?.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) || 0) / 60
    );

    tasksCompleted = completedTasks?.length || 0;

    if (allSessions && allSessions.length > 0) {
      const sessionDates = new Set<string>();
      allSessions.forEach((s) => {
        const date = new Date(s.started_at);
        date.setHours(0, 0, 0, 0);
        sessionDates.add(date.toISOString().split("T")[0]);
      });

      const dates = Array.from(sessionDates)
        .map((d) => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      currentStreak = 0;
      const expectedDate = new Date();
      expectedDate.setHours(0, 0, 0, 0);

      for (const date of dates) {
        if (date.getTime() === expectedDate.getTime()) {
          currentStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  const userName = profile?.full_name?.trim() || session?.user?.email || "Student";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Welcome back, <span className="gradient-text">{userName}</span>! 🎉
        </h1>
        <p className="text-zinc-400 mt-2">Let's make today a productive day.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats cards */}
        <div className="glass-subtle rounded-xl border border-white/5 hover:border-indigo-500/20 p-6 transition">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
            Study Hours Today
          </h3>
          <div className="flex items-baseline gap-4 mt-2">
            <p className="text-3xl font-bold text-white">{studyHoursToday}</p>
            <div className="h-0.5 w-12 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          </div>
        </div>

        <div className="glass-subtle rounded-xl border border-white/5 hover:border-indigo-500/20 p-6 transition">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
            Tasks Completed
          </h3>
          <div className="flex items-baseline gap-4 mt-2">
            <p className="text-3xl font-bold text-white">{tasksCompleted}</p>
            <div className="h-0.5 w-12 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          </div>
        </div>

        <div className="glass-subtle rounded-xl border border-white/5 hover:border-indigo-500/20 p-6 transition">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
            Current Streak
          </h3>
          <div className="flex items-baseline gap-4 mt-2">
            <p className="text-3xl font-bold text-white">{currentStreak}</p>
            <div className="h-0.5 w-12 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <DailyBrief />
      </div>

      <div className="mt-8 glass-subtle rounded-xl border border-white/5 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Getting Started</h2>
        <ul className="space-y-3 text-zinc-400">
          <li>✓ Create your first project (course/subject)</li>
          <li>✓ Add tasks to your project</li>
          <li>✓ Start a focus session with Pomodoro timer</li>
          <li>✓ Track your progress with analytics</li>
        </ul>
      </div>
    </div>
  );
}
