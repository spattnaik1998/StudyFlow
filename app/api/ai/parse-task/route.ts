import { openai } from "@/lib/openai";
import { createServerClient_ } from "@/lib/supabase/server";
import { apiSuccess, apiError, ERROR_CODES } from "@/lib/api-response";
import { ParseNLTaskRequest } from "@/types/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient_();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
    }

    const body: ParseNLTaskRequest = await request.json();
    const { input, project_id } = body;

    if (!input || !project_id) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, "Missing input or project_id", 400);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a task parsing assistant. Extract task information from natural language.
You MUST respond with only valid JSON matching this schema:
{
  "title": "string (required, task name)",
  "description": "string (optional, task details)",
  "priority": "string (optional, one of: low, medium, high, urgent)",
  "due_date": "string (optional, ISO 8601 date YYYY-MM-DD, infer from 'tomorrow', 'next week', etc.)",
  "estimated_duration_mins": "number (optional, duration in minutes)",
  "tags": "array of strings (optional, topic keywords)"
}

Today's date is ${new Date().toISOString().split("T")[0]}.
Extract and infer all relevant fields. Be concise and accurate.`,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return apiError(ERROR_CODES.INTERNAL_ERROR, "No response from OpenAI", 500);
    }

    const parsed = JSON.parse(content);

    return apiSuccess({
      title: parsed.title || "",
      description: parsed.description || undefined,
      priority: parsed.priority || undefined,
      due_date: parsed.due_date || undefined,
      estimated_duration_mins: parsed.estimated_duration_mins || undefined,
      tags: parsed.tags || [],
    });
  } catch (error) {
    console.error("Parse task error:", error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred", 500);
  }
}
