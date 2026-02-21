"use client";

import { Suspense } from "react";
import { TaskForm } from "@/components/tasks/TaskForm";

export function TaskFormWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskForm />
    </Suspense>
  );
}
