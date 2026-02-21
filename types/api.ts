import type { Task, Project, Topic } from "./database";

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Project operations
export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  emoji?: string;
  exam_date?: string;
  course_code?: string;
  instructor?: string;
  credit_hours?: number;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

// Task operations
export interface CreateTaskRequest {
  project_id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  due_time?: string;
  tags?: string[];
  estimated_duration_mins?: number;
  parent_task_id?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
  status?: "todo" | "in_progress" | "done";
}

export interface BulkUpdateTasksRequest {
  task_ids: string[];
  updates: Partial<{
    status: string;
    priority: string;
    tags: string[];
    project_id: string;
  }>;
}

// Focus session
export interface CreateSessionRequest {
  task_id?: string;
  duration_mins: number;
  quality_rating?: number;
  journal_entry?: string;
  distraction_count?: number;
}

// AI requests
export interface GenerateStudyPlanRequest {
  project_id: string;
  exam_date: string;
  chapters: string[];
  total_study_hours?: number;
}

export interface ParseNLTaskRequest {
  input: string;
  project_id: string;
}

// Analytics/Dashboard
export interface DashboardStats {
  total_study_hours: number;
  projects_count: number;
  tasks_completed: number;
  current_streak: number;
  average_session_quality: number;
  exam_readiness: Record<string, number>; // project_id -> score
}

export interface StudyHeatmapData {
  [date: string]: number; // date -> minutes studied
}
