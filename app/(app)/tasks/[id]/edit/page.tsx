"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { TaskForm } from "@/components/tasks/TaskForm";
import type { Task } from "@/types/database";

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", params.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      return data as Task;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Task not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
        <p className="text-gray-600 mt-2">Update task details</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg shadow p-8">
        <TaskForm task={task} />
      </div>
    </div>
  );
}
