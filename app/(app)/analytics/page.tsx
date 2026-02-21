import { createServerClient_ } from "@/lib/supabase/server";
import { format, subDays, startOfWeek } from "date-fns";
import { StatCard } from "@/components/analytics/StatCard";
import { StudyHoursChart } from "@/components/analytics/StudyHoursChart";
import { TaskCompletionChart } from "@/components/analytics/TaskCompletionChart";
import { MasteryRadar } from "@/components/analytics/MasteryRadar";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Clock, CheckCircle2, Zap } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createServerClient_();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Please log in to view analytics</p>
      </div>
    );
  }

  const userId = session.user.id;

  // === Study Hours Data ===
  const thirtyDaysAgo = subDays(new Date(), 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const { data: sessionsLast30 } = await supabase
    .from("task_sessions")
    .select("started_at, actual_duration_minutes")
    .eq("user_id", userId)
    .gte("started_at", thirtyDaysAgo.toISOString());

  const studyHoursByDay: Record<string, number> = {};
  sessionsLast30?.forEach((session) => {
    const date = format(new Date(session.started_at), "MMM dd");
    const minutes = session.actual_duration_minutes || 0;
    studyHoursByDay[date] = (studyHoursByDay[date] || 0) + minutes / 60;
  });

  const studyHoursData = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(new Date(), 29 - i);
    const dateStr = format(day, "MMM dd");
    return {
      date: dateStr,
      hours: parseFloat((studyHoursByDay[dateStr] || 0).toFixed(2)),
    };
  });

  // === Task Completion Data ===
  const fourWeeksAgo = subDays(new Date(), 28);
  fourWeeksAgo.setHours(0, 0, 0, 0);

  const { data: completedTasks } = await supabase
    .from("tasks")
    .select("completed_at, priority")
    .eq("user_id", userId)
    .eq("status", "done")
    .gte("completed_at", fourWeeksAgo.toISOString());

  const tasksByWeek: Record<string, Record<string, number>> = {};
  completedTasks?.forEach((task) => {
    const weekStart = startOfWeek(new Date(task.completed_at));
    const weekStr = format(weekStart, "MMM dd");
    if (!tasksByWeek[weekStr]) {
      tasksByWeek[weekStr] = { low: 0, medium: 0, high: 0, urgent: 0 };
    }
    const priority = (task.priority || "low") as keyof typeof tasksByWeek[string];
    if (priority in tasksByWeek[weekStr]) {
      tasksByWeek[weekStr][priority]++;
    }
  });

  const taskCompletionData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = subDays(new Date(), 21 - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekStr = format(weekStart, "MMM dd");
    return {
      week: weekStr,
      ...tasksByWeek[weekStr],
      low: tasksByWeek[weekStr]?.low || 0,
      medium: tasksByWeek[weekStr]?.medium || 0,
      high: tasksByWeek[weekStr]?.high || 0,
      urgent: tasksByWeek[weekStr]?.urgent || 0,
    };
  });

  // === Mastery by Topic ===
  const { data: topics } = await supabase
    .from("topics")
    .select("title, mastery_level")
    .eq("user_id", userId)
    .order("mastery_level", { ascending: false })
    .limit(6);

  const masteryLevelMap: Record<string, number> = {
    not_started: 0,
    learning: 25,
    familiar: 50,
    proficient: 75,
    mastered: 100,
  };

  const masteryData = (topics || []).map((topic) => ({
    name: topic.title.substring(0, 15),
    mastery: masteryLevelMap[topic.mastery_level] || 0,
  }));

  // === Activity Heatmap (90 days) ===
  const ninetyDaysAgo = subDays(new Date(), 90);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  const { data: allSessions } = await supabase
    .from("task_sessions")
    .select("started_at, actual_duration_minutes")
    .eq("user_id", userId)
    .gte("started_at", ninetyDaysAgo.toISOString());

  const activityByDate: Record<string, number> = {};
  allSessions?.forEach((session) => {
    const dateStr = format(new Date(session.started_at), "yyyy-MM-dd");
    const minutes = session.actual_duration_minutes || 0;
    activityByDate[dateStr] = (activityByDate[dateStr] || 0) + minutes;
  });

  // === Calculate Streak ===
  let streak = 0;
  const sessionDates = new Set<string>();
  allSessions?.forEach((s) => {
    const date = new Date(s.started_at);
    date.setHours(0, 0, 0, 0);
    sessionDates.add(date.toISOString().split("T")[0]);
  });

  const dates = Array.from(sessionDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length > 0) {
    const expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const date of dates) {
      if (date.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // === Summary Stats ===
  const totalHours = Math.round(
    (sessionsLast30?.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) || 0) / 60
  );

  const topicsData = topics || [];
  const masteredCount = topicsData.filter((t) => t.mastery_level === "mastered").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Track your study progress and performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Study Hours (30d)"
          value={totalHours}
          unit="hours"
          icon={<Clock size={24} />}
          color="from-blue-600 to-cyan-600"
        />
        <StatCard
          label="Tasks Completed (30d)"
          value={completedTasks?.length || 0}
          unit="tasks"
          icon={<CheckCircle2 size={24} />}
          color="from-green-600 to-emerald-600"
        />
        <StatCard
          label="Current Streak"
          value={streak}
          unit="days"
          icon={<Zap size={24} />}
          color="from-orange-600 to-red-600"
        />
        <StatCard
          label="Topics Mastered"
          value={masteredCount}
          unit={`of ${topicsData.length}`}
          icon={<BarChart3 size={24} />}
          color="from-purple-600 to-pink-600"
        />
      </div>

      {/* Study Hours Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Study Hours</h2>
        <Tabs defaultValue="30d" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>

          <TabsContent value="7d" className="mt-4">
            <StudyHoursChart
              data={studyHoursData.slice(-7)}
            />
          </TabsContent>

          <TabsContent value="30d" className="mt-4">
            <StudyHoursChart
              data={studyHoursData}
            />
          </TabsContent>

          <TabsContent value="90d" className="mt-4">
            <StudyHoursChart
              data={studyHoursData}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Task Completion by Priority</h2>
          <TaskCompletionChart data={taskCompletionData} />
        </div>

        {/* Mastery Radar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Topic Mastery</h2>
          {masteryData.length > 0 ? (
            <MasteryRadar data={masteryData} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No topics created yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Heatmap (90 Days)</h2>
        <ActivityHeatmap data={activityByDate} streak={streak} />
      </div>
    </div>
  );
}
