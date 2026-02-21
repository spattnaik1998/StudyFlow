import { TopicForm } from "@/components/topics/TopicForm";

export default function NewTopicPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Topic</h1>
        <p className="text-gray-600 mt-2">Add a topic to your learning library</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg shadow p-8">
        <TopicForm />
      </div>
    </div>
  );
}
