import { openai } from "@/lib/openai";
import { ParseNLTaskRequest } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: ParseNLTaskRequest = await request.json();
    const { input, project_id } = body;

    if (!input || !project_id) {
      return NextResponse.json(
        { error: "Missing input or project_id" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data: {
        title: parsed.title || "",
        description: parsed.description || undefined,
        priority: parsed.priority || undefined,
        due_date: parsed.due_date || undefined,
        estimated_duration_mins: parsed.estimated_duration_mins || undefined,
        tags: parsed.tags || [],
      },
    });
  } catch (error) {
    console.error("Parse task error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse task",
      },
      { status: 500 }
    );
  }
}
