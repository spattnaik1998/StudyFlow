import { TaskFormWrapper } from "./TaskFormWrapper";

export default function NewTaskPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-gray-600 mt-2">Add a new study task</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg shadow p-8">
        <TaskFormWrapper />
      </div>
    </div>
  );
}
