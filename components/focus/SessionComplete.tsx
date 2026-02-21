"use client";

import { useState } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { Star } from "lucide-react";

export function SessionComplete() {
  const { state, elapsedSeconds, distractionCount, endSession, resetSession } =
    useFocusStore();
  const [quality, setQuality] = useState(3);
  const [journal, setJournal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (state !== "completed") return null;

  const handleSubmit = async () => {
    setSubmitted(true);
    await endSession(quality, journal);
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {!submitted ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Session Complete! 🎉
            </h2>

            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600 uppercase">Time Focused</p>
                <p className="text-2xl font-bold text-gray-900">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Distractions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {distractionCount}
                </p>
              </div>
            </div>

            {/* Quality rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Session Quality
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setQuality(star)}
                    className="p-2 rounded-lg transition hover:bg-gray-100"
                  >
                    <Star
                      size={32}
                      className={
                        star <= quality
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Journal */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reflection (Optional)
              </label>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="What did you accomplish? Any blockers?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetSession}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Save Session
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Session saved! 🚀
            </p>
            <p className="text-sm text-gray-600">
              You'll be redirected shortly...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
