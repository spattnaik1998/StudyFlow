import { createServerClient_ } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerClient_();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profile = null;
  if (session) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    profile = data;
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
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Tasks Completed
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Current Streak
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
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
