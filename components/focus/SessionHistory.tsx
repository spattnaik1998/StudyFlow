"use client";

import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";

interface CompactSession {
  date: string;
  duration: number;
  quality: number;
  task?: string;
  distractions: number;
}

export function SessionHistory() {
  const [sessions, setSessions] = useState<CompactSession[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("sf_session_history");
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load session history", e);
      }
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm("Clear all session history?")) {
      localStorage.removeItem("sf_session_history");
      setSessions([]);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No sessions yet. Start your first focus session to track progress!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
        <button
          onClick={handleClearHistory}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
        >
          <Trash2 size={16} />
          <span className="text-sm">Clear</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Duration
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Quality
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Distractions
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 text-gray-700">
                  {formatDate(session.date)}
                </td>
                <td className="py-3 px-4 font-mono text-gray-900">
                  {formatDuration(session.duration)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= session.quality
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {session.distractions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Showing last {sessions.length} sessions (max 50 stored locally)
      </p>
    </div>
  );
}
