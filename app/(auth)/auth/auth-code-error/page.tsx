import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
      <p className="text-gray-600 mb-6">
        There was an error processing your authentication request.
      </p>
      <Link
        href="/login"
        className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Back to Login
      </Link>
    </div>
  );
}
