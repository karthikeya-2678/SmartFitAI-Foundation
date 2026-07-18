import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Workout, LoggedSet, WorkoutSession } from '@/types/fitness';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface WorkoutStoreState {
  // Active session (not persisted — cleared on app restart)
  session: WorkoutSession | null;

  // Persisted user data
  favoriteIds: string[];

  // ── Session actions ────────────────────────────────────────────────────────
  startSession: (workout: Workout) => void;
  endSession: () => void;
  goToExercise: (index: number) => void;
  nextExercise: () => boolean; // returns false if already at last exercise
  prevExercise: () => void;

  /**
   * Log the actual reps & weight for a set and mark it complete.
   * Optionally start the rest timer by passing restDuration > 0.
   */
  completeSet: (
    workoutExerciseId: string,
    setIndex: number,
    reps: number,
    weight: number,
    restDuration?: number,
  ) => void;
  startRest: (duration: number) => void;
  stopRest: () => void;

  // ── Read helpers ──────────────────────────────────────────────────────────
  getLoggedSet: (workoutExerciseId: string, setIndex: number) => LoggedSet | undefined;
  getCompletedSetsCount: (workoutExerciseId: string) => number;
  isExerciseComplete: (workoutExerciseId: string, totalSets: number) => boolean;
  getTotalCompletedSets: () => number;

  // ── Favorites ─────────────────────────────────────────────────────────────
  toggleFavorite: (workoutId: string) => void;
  isFavorite: (workoutId: string) => boolean;
}

// ─── Key helper ───────────────────────────────────────────────────────────────

function setKey(workoutExerciseId: string, setIndex: number) {
  return `${workoutExerciseId}_${setIndex}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWorkoutStore = create<WorkoutStoreState>()(
  persist(
    (set, get) => ({
      session: null,
      favoriteIds: [],

      // ── Session ────────────────────────────────────────────────────────────

      startSession: (workout) => {
        set({
          session: {
            workout,
            startedAt: new Date().toISOString(),
            currentExerciseIndex: 0,
            loggedSets: {},
            isResting: false,
            restDuration: 0,
          },
        });
      },

      endSession: () => set({ session: null }),

      goToExercise: (index) => {
        const { session } = get();
        if (!session) return;
        const max = session.workout.exercises.length - 1;
        set({
          session: {
            ...session,
            currentExerciseIndex: Math.max(0, Math.min(index, max)),
            isResting: false,
          },
        });
      },

      nextExercise: () => {
        const { session } = get();
        if (!session) return false;
        const next = session.currentExerciseIndex + 1;
        if (next >= session.workout.exercises.length) return false;
        set({
          session: { ...session, currentExerciseIndex: next, isResting: false },
        });
        return true;
      },

      prevExercise: () => {
        const { session } = get();
        if (!session) return;
        const prev = session.currentExerciseIndex - 1;
        if (prev < 0) return;
        set({
          session: { ...session, currentExerciseIndex: prev, isResting: false },
        });
      },

      completeSet: (workoutExerciseId, setIndex, reps, weight, restDuration = 0) => {
        const { session } = get();
        if (!session) return;
        const key = setKey(workoutExerciseId, setIndex);
        set({
          session: {
            ...session,
            loggedSets: {
              ...session.loggedSets,
              [key]: { reps, weight, completed: true, completedAt: new Date().toISOString() },
            },
            isResting: restDuration > 0,
            restDuration,
          },
        });
      },

      startRest: (duration) => {
        const { session } = get();
        if (!session) return;
        set({ session: { ...session, isResting: true, restDuration: duration } });
      },

      stopRest: () => {
        const { session } = get();
        if (!session) return;
        set({ session: { ...session, isResting: false, restDuration: 0 } });
      },

      // ── Read helpers ──────────────────────────────────────────────────────

      getLoggedSet: (workoutExerciseId, setIndex) => {
        return get().session?.loggedSets[setKey(workoutExerciseId, setIndex)];
      },

      getCompletedSetsCount: (workoutExerciseId) => {
        const { session } = get();
        if (!session) return 0;
        return Object.keys(session.loggedSets).filter(
          (k) => k.startsWith(`${workoutExerciseId}_`) && session.loggedSets[k]?.completed,
        ).length;
      },

      isExerciseComplete: (workoutExerciseId, totalSets) => {
        const { getCompletedSetsCount } = get();
        return getCompletedSetsCount(workoutExerciseId) >= totalSets;
      },

      getTotalCompletedSets: () => {
        const { session } = get();
        if (!session) return 0;
        return Object.values(session.loggedSets).filter((s) => s.completed).length;
      },

      // ── Favorites ─────────────────────────────────────────────────────────

      toggleFavorite: (workoutId) => {
        const { favoriteIds } = get();
        const already = favoriteIds.includes(workoutId);
        set({
          favoriteIds: already
            ? favoriteIds.filter((id) => id !== workoutId)
            : [...favoriteIds, workoutId],
        });
      },

      isFavorite: (workoutId) => get().favoriteIds.includes(workoutId),
    }),
    {
      name: 'smartfitai-workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist favorites — session is intentionally ephemeral
      partialize: (state) => ({ favoriteIds: state.favoriteIds }),
    },
  ),
);
