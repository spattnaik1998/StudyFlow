import { TaskFormWrapper } from "./TaskFormWrapper";

export default function NewTaskPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Task</h1>
        <p className="text-zinc-400 mt-2">Add a new study task</p>
      </div>

      <div className="max-w-2xl bg-zinc-900 rounded-xl border border-white/10 p-8">
        <TaskFormWrapper />
      </div>
    </div>
  );
}
