import { openai } from "@/lib/openai";
import { createServerClient_ } from "@/lib/supabase/server";
import { apiSuccess, apiError, ERROR_CODES } from "@/lib/api-response";
export async function GET() {
  try {
    const supabase = await createServerClient_();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Check cache: look for today's daily_brief in ai_insights
    const { data: cached } = await supabase
      .from("ai_insights")
      .select("content, generated_at")
      .eq("user_id", user.id)
      .eq("insight_type", "daily_brief")
      .gte("expires_at", new Date().toISOString())
      .order("generated_at", { ascending: false })
      .limit(1);

    if (cached && cached.length > 0) {
      return apiSuccess({
        brief: cached[0].content.brief,
        generated_at: cached[0].generated_at,
        cached: true,
      });
    }

    // Fetch context from Supabase
    const { data: todaysTasks } = await supabase
      .from("tasks")
      .select("title, priority, due_date")
      .eq("user_id", user.id)
      .eq("status", "todo")
      .lte("due_date", todayStr)
      .order("priority");

    const { data: upcomingExams } = await supabase
      .from("projects")
      .select("name, exam_date")
      .eq("user_id", user.id)
      .gte("exam_date", todayStr)
      .lt("exam_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0])
      .order("exam_date");

    const { data: recentSessions } = await supabase
      .from("task_sessions")
      .select("duration_minutes, quality_rating, started_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(3);

    // Generate brief via GPT-4o
    const tasksText =
      todaysTasks && todaysTasks.length > 0
        ? todaysTasks.map((t) => `- ${t.title} (${t.priority || "medium"})`).join("\n")
        : "No tasks due today.";

    const examsText =
      upcomingExams && upcomingExams.length > 0
        ? upcomingExams.map((p) => `- ${p.name} on ${p.exam_date}`).join("\n")
        : "No upcoming exams in the next 7 days.";

    const avgQuality =
      recentSessions && recentSessions.length > 0
        ? (
            recentSessions.reduce((sum, s) => sum + (s.quality_rating || 0), 0) /
            recentSessions.length
          ).toFixed(1)
        : "No sessions";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a motivational study companion. Generate a brief, encouraging daily study brief.
Write 2-3 short paragraphs:
1. Summarize today's tasks and priorities
2. Mention upcoming exams if any
3. Provide one motivational tip or study technique

Be concise, warm, and action-oriented. Avoid repetition.`,
        },
        {
          role: "user",
          content: `Today's tasks:\n${tasksText}\n\nUpcoming exams (next 7 days):\n${examsText}\n\nRecent focus quality: ${avgQuality}/5\n\nGenerate today's study brief.`,
        },
      ],
    });

    const brief = response.choices[0].message.content || "";

    // Save to ai_insights
    const midnight = new Date(today);
    midnight.setDate(midnight.getDate() + 1);

    await supabase.from("ai_insights").insert({
      user_id: user.id,
      insight_type: "daily_brief",
      content: { brief },
      expires_at: midnight.toISOString(),
    });

    return apiSuccess({
      brief,
      generated_at: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error("Daily brief error:", error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred", 500);
  }
}
