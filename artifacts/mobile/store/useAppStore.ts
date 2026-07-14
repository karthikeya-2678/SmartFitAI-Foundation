import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '@/types/user';
import type { WorkoutLog } from '@/types/fitness';

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (data: Partial<UserProfile>) => void;

  // Workout logs (local cache, synced to backend)
  workoutLogs: WorkoutLog[];
  addWorkoutLog: (log: WorkoutLog) => void;
  removeWorkoutLog: (id: string) => void;

  // Active session
  activeWorkoutId: string | null;
  setActiveWorkoutId: (id: string | null) => void;

  // Onboarding
  hasOnboarded: boolean;
  setHasOnboarded: (value: boolean) => void;

  // Reset all state
  reset: () => void;
}

const initialState: Pick<
  AppState,
  'user' | 'workoutLogs' | 'activeWorkoutId' | 'hasOnboarded'
> = {
  user: null,
  workoutLogs: [],
  activeWorkoutId: null,
  hasOnboarded: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      addWorkoutLog: (log) =>
        set((state) => ({
          workoutLogs: [log, ...state.workoutLogs].slice(0, 100),
        })),

      removeWorkoutLog: (id) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.filter((l) => l.id !== id),
        })),

      setActiveWorkoutId: (id) => set({ activeWorkoutId: id }),

      setHasOnboarded: (value) => set({ hasOnboarded: value }),

      reset: () => set(initialState),
    }),
    {
      name: 'smartfitai-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user-facing data, not UI state
      partialize: (state) => ({
        user: state.user,
        workoutLogs: state.workoutLogs,
        hasOnboarded: state.hasOnboarded,
      }),
    }
  )
);
