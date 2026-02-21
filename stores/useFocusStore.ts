import { create } from "zustand";

type SessionState = "idle" | "running" | "paused" | "break" | "completed";

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

  endSession: async (quality: number, journal: string) => {
    set({
      state: "completed",
      qualityRating: quality,
      journalEntry: journal,
    });
    // TODO: Save to database
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
