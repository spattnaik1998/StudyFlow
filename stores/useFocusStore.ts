import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

type SessionState = "idle" | "running" | "paused" | "break" | "completed";

interface CompactSession {
  date: string;
  duration: number;
  quality: number;
  task?: string;
  distractions: number;
}

interface FocusSession {
  id?: string;
  taskId?: string;
  startedAt?: string;
  pausedAt?: number;
  elapsedSeconds: number;
  state: SessionState;
  distractionCount: number;
  workMinutes: number;
  breakMinutes: number;
  qualityRating?: number;
  journalEntry?: string;
}

interface FocusStore extends FocusSession {
  // Session control
  startSession: (taskId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  skipBreak: () => void;
  endSession: (quality: number, journal: string) => Promise<void>;
  resetSession: () => void;

  // Config
  setWorkMinutes: (mins: number) => void;
  setBreakMinutes: (mins: number) => void;

  // Updates
  tick: () => void;
  incrementDistraction: () => void;
  setQualityRating: (rating: number) => void;
  setJournalEntry: (entry: string) => void;

  // Persistence
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  state: "idle",
  elapsedSeconds: 0,
  distractionCount: 0,
  workMinutes: 25,
  breakMinutes: 5,

  startSession: (taskId?: string) => {
    set({
      state: "running",
      taskId,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      distractionCount: 0,
    });
    get().saveToLocalStorage();
  },

  pauseSession: () => {
    set({ state: "paused" });
    get().saveToLocalStorage();
  },

  resumeSession: () => {
    set({ state: "running" });
    get().saveToLocalStorage();
  },

  skipBreak: () => {
    set({ state: "idle", elapsedSeconds: 0 });
    get().saveToLocalStorage();
  },

  endSession: async (quality: number, journal: string) => {
    const state = get();
    set({
      state: "completed",
      qualityRating: quality,
      journalEntry: journal,
    });

    // Save to localStorage session history
    if (typeof window !== "undefined") {
      try {
        const history = JSON.parse(
          localStorage.getItem("sf_session_history") || "[]"
        ) as CompactSession[];

        const newSession: CompactSession = {
          date: new Date().toISOString(),
          duration: state.elapsedSeconds,
          quality,
          distractions: state.distractionCount,
        };

        // Keep max 50 sessions
        const updated = [newSession, ...history].slice(0, 50);
        localStorage.setItem("sf_session_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save session history", e);
      }
    }

    // Save to Supabase (gracefully skip if no auth)
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await supabase.from("task_sessions").insert({
          user_id: session.user.id,
          task_id: state.taskId || null,
          started_at: state.startedAt,
          ended_at: new Date().toISOString(),
          quality_rating: quality,
          journal_entry: journal,
          distraction_count: state.distractionCount,
          session_type: "work",
        });
      }
    } catch (error) {
      console.warn("Could not save session to database", error);
    }

    setTimeout(() => get().resetSession(), 2000);
  },

  resetSession: () => {
    set({
      state: "idle",
      elapsedSeconds: 0,
      distractionCount: 0,
      qualityRating: undefined,
      journalEntry: undefined,
      taskId: undefined,
    });
    localStorage.removeItem("focusSession");
  },

  setWorkMinutes: (mins: number) => set({ workMinutes: mins }),
  setBreakMinutes: (mins: number) => set({ breakMinutes: mins }),

  tick: () => {
    set((state) => {
      if (state.state === "running") {
        const newElapsed = state.elapsedSeconds + 1;
        const workSeconds = state.workMinutes * 60;

        if (newElapsed >= workSeconds) {
          return { state: "break", elapsedSeconds: 0 };
        }
        return { elapsedSeconds: newElapsed };
      } else if (state.state === "break") {
        const newElapsed = state.elapsedSeconds + 1;
        const breakSeconds = state.breakMinutes * 60;

        if (newElapsed >= breakSeconds) {
          return { state: "idle", elapsedSeconds: 0 };
        }
        return { elapsedSeconds: newElapsed };
      }
      return state;
    });
  },

  incrementDistraction: () => {
    set((state) => ({
      distractionCount: state.distractionCount + 1,
    }));
  },

  setQualityRating: (rating: number) => set({ qualityRating: rating }),
  setJournalEntry: (entry: string) => set({ journalEntry: entry }),

  loadFromLocalStorage: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("focusSession");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        set(data);
      } catch (e) {
        console.error("Failed to load focus session", e);
      }
    }
  },

  saveToLocalStorage: () => {
    if (typeof window === "undefined") return;
    const state = get();
    localStorage.setItem(
      "focusSession",
      JSON.stringify({
        state: state.state,
        elapsedSeconds: state.elapsedSeconds,
        distractionCount: state.distractionCount,
        taskId: state.taskId,
        startedAt: state.startedAt,
        workMinutes: state.workMinutes,
        breakMinutes: state.breakMinutes,
      })
    );
  },
}));
