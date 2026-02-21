export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  pomodoro_work_mins: number;
  pomodoro_break_mins: number;
  theme: "light" | "dark" | "auto";
  energy_pattern: "morning" | "afternoon" | "evening";
  work_hours_start: number;
  work_hours_end: number;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  emoji: string | null;
  exam_date: string | null;
  course_code: string | null;
  instructor: string | null;
  credit_hours: number | null;
  status: "active" | "archived" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  due_time: string | null;
  tags: string[];
  estimated_duration_mins: number | null;
  ai_complexity_score: number | null;
  parent_task_id: string | null;
  position: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskSession {
  id: string;
  task_id: string | null;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  actual_duration_minutes: number | null;
  quality_rating: number | null;
  journal_entry: string | null;
  distraction_count: number;
  session_type: "work" | "break";
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  description: string | null;
  mastery_level: "not_started" | "learning" | "familiar" | "proficient" | "mastered";
  sm2_ease_factor: number;
  sm2_interval: number;
  sm2_repetitions: number;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TopicReview {
  id: string;
  topic_id: string;
  user_id: string;
  quality: number;
  ease_factor_before: number | null;
  interval_before: number | null;
  scheduled_for: string | null;
  reviewed_at: string;
  created_at: string;
}

export interface ScheduleBlock {
  id: string;
  user_id: string;
  project_id: string | null;
  task_id: string | null;
  title: string;
  block_type: "study" | "break" | "blocked" | "exam" | "class";
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: "weekly_narrative" | "daily_brief" | "study_pattern";
  content: Record<string, any>;
  generated_at: string;
  expires_at: string;
  created_at: string;
}
