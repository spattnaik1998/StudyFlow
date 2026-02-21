"use client";

import { useAmbientSound } from "@/hooks/useAmbientSound";
import { Volume2 } from "lucide-react";

export function AmbientSounds() {
  const { play, stop, setVolume, active, volume } = useAmbientSound();

  const sounds = [
    { type: "rain" as const, emoji: "🌧", label: "Rain" },
    { type: "cafe" as const, emoji: "☕", label: "Cafe" },
    { type: "forest" as const, emoji: "🌲", label: "Forest" },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Ambient Sounds</h3>

      {/* Sound buttons */}
      <div className="flex gap-2 mb-4">
        {sounds.map((sound) => (
          <button
            key={sound.type}
            onClick={() => (active === sound.type ? stop() : play(sound.type))}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition text-sm ${
              active === sound.type
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {sound.emoji} {sound.label}
          </button>
        ))}

        <button
          onClick={stop}
          className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
            !active
              ? "bg-gray-300 text-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Off
        </button>
      </div>

      {/* Volume slider */}
      {active && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Volume2 size={18} className="text-gray-600" />
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-xs font-medium text-gray-600 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
