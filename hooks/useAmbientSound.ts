"use client";

import { useEffect, useRef, useState } from "react";

type SoundType = "rain" | "cafe" | "forest" | null;

/**
 * Uses Web Audio API to generate ambient sounds.
 * No audio files needed — generates noise programmatically.
 */
export function useAmbientSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [activeSound, setActiveSound] = useState<SoundType>(null);
  const [volume, setVolumeState] = useState(0.3);

  // Initialize Web Audio context on first use
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }, []);

  const generateNoise = (type: "white" | "pink" | "brown") => {
    const context = audioContextRef.current;
    if (!context) return;

    // Stop existing sound
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }

    // Create buffer for noise
    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    let lastFilteredOut = 0;
    let filterConstant = 0.98;

    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;

      if (type === "pink") {
        // Simple pink noise filter
        lastFilteredOut =
          white * 0.049922035 + lastFilteredOut * 0.950177537;
        data[i] = lastFilteredOut * 0.5;
      } else if (type === "brown") {
        // Brown noise: integrate white noise
        lastOut = (white + lastOut * filterConstant) / (filterConstant + 1);
        data[i] = lastOut * 0.1;
      } else {
        // White noise
        data[i] = white * 0.3;
      }
    }

    // Create buffer source
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Setup gain
    if (!gainRef.current) {
      gainRef.current = context.createGain();
      gainRef.current.connect(context.destination);
    }

    gainRef.current.gain.setValueAtTime(volume, context.currentTime);
    source.connect(gainRef.current);
    source.start(0);
    oscillatorRef.current = source as any;
  };

  const play = (type: SoundType) => {
    if (!type) {
      stop();
      return;
    }

    setActiveSound(type);

    if (type === "rain") {
      generateNoise("white");
    } else if (type === "cafe") {
      generateNoise("pink");
    } else if (type === "forest") {
      generateNoise("brown");
    }
  };

  const stop = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    setActiveSound(null);
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);

    if (gainRef.current) {
      gainRef.current.gain.setValueAtTime(
        clamped,
        audioContextRef.current?.currentTime ?? 0
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, []);

  return {
    play,
    stop,
    setVolume,
    active: activeSound,
    volume,
  };
}
