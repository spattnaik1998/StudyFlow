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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    profile = data;

    // Study hours today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: sessions } = await supabase
      .from("task_sessions")
      .select("actual_duration_minutes")
      .eq("user_id", session.user.id)
      .gte("started_at", today.toISOString());
    studyHoursToday = Math.round(
      (sessions?.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) || 0) / 60
    );

    // Tasks completed today
    const { data: completedTasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("status", "done")
      .gte("completed_at", today.toISOString());
    tasksCompleted = completedTasks?.length || 0;

    // Current streak (consecutive days with focus sessions)
    const { data: allSessions } = await supabase
      .from("task_sessions")
      .select("started_at")
      .eq("user_id", session.user.id)
      .order("started_at", { ascending: false });

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

  const userName = profile?.full_name || session?.user?.email || "Student";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, {userName}! 🎉
        </h1>
        <p className="text-gray-600 mt-2">Let's make today a productive day.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Study Hours Today
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{studyHoursToday}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Tasks Completed
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{tasksCompleted}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Current Streak
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{currentStreak}</p>
        </div>
      </div>

      <div className="mt-8">
        <DailyBrief />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <ul className="space-y-3 text-gray-600">
          <li>✓ Create your first project (course/subject)</li>
          <li>✓ Add tasks to your project</li>
          <li>✓ Start a focus session with Pomodoro timer</li>
          <li>✓ Track your progress with analytics</li>
        </ul>
      </div>
    </div>
  );
}
