import { openai } from "@/lib/openai";
import { createServerClient_ } from "@/lib/supabase/server";
import { GenerateStudyPlanRequest } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient_();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateStudyPlanRequest = await request.json();
    const { project_id, exam_date, chapters, total_study_hours } = body;

    if (!project_id || !exam_date || !chapters || chapters.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch project from Supabase
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("name")
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const hoursPerDay = total_study_hours ? total_study_hours / 7 : 3; // Default 3 hours/day
    const examDate = new Date(exam_date);
    const today = new Date();
    const daysUntilExam = Math.ceil(
      (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a study plan generator. Create a schedule of study blocks from today until the exam date.
You MUST respond with only valid JSON matching this schema:
{
  "blocks": [
    {
      "title": "string (study topic/chapter)",
      "start_time": "string (ISO 8601 datetime)",
      "end_time": "string (ISO 8601 datetime)",
      "block_type": "string (one of: lecture, practice, review, test)",
      "color": "string (hex color #RRGGBB)"
    }
  ]
}

Context:
- Project: ${project.name}
- Exam Date: ${exam_date}
- Days until exam: ${daysUntilExam}
- Study topics/chapters: ${chapters.join(", ")}
- Target hours per day: ${hoursPerDay.toFixed(1)}
- Today: ${today.toISOString().split("T")[0]}

Generate a balanced study schedule that:
1. Distributes topics evenly across available days
2. Allocates ~${hoursPerDay.toFixed(1)} hours per day
3. Includes review blocks before the exam
4. Varies block types (lecture, practice, review)
5. Uses distinct colors for different block types

Return ONLY the JSON object with the blocks array.`,
        },
        {
          role: "user",
          content: `Generate a study plan for ${project.name} with these topics: ${chapters.join(", ")}. Exam is on ${exam_date}.`,
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
        blocks: parsed.blocks || [],
      },
    });
  } catch (error) {
    console.error("Generate plan error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate study plan",
      },
      { status: 500 }
    );
  }
}
