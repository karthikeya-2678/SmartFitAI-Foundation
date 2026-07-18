import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { Exercise } from '@/types/fitness';
import { EXERCISES, getExerciseById } from '@/data/exercises';

export const exerciseService = {
  async getExercises(params?: {
    category?: string;
    muscleGroup?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
    try {
      const query: Record<string, string> = {};
      if (params?.category) query.category = params.category;
      if (params?.muscleGroup) query.muscleGroup = params.muscleGroup;
      if (params?.difficulty) query.difficulty = params.difficulty;
      if (params?.search) query.search = params.search;
      return await apiClient.get<Exercise[]>(API_ENDPOINTS.exercises.list, query);
    } catch {
      // Fallback to local seed data while the API is not yet connected
      let result = [...EXERCISES];
      if (params?.category && params.category !== 'all') {
        result = result.filter((e) => e.category === params.category);
      }
      if (params?.muscleGroup) {
        result = result.filter((e) =>
          e.muscleGroups.includes(params.muscleGroup as Parameters<typeof e.muscleGroups.includes>[0]),
        );
      }
      if (params?.difficulty && params.difficulty !== 'all') {
        result = result.filter((e) => e.difficulty === params.difficulty);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q) ||
            e.muscleGroups.some((m) => m.toLowerCase().includes(q)),
        );
      }
      return result;
    }
  },

  async getExerciseById(id: string): Promise<Exercise | undefined> {
    try {
      return await apiClient.get<Exercise>(API_ENDPOINTS.exercises.byId(id));
    } catch {
      return getExerciseById(id);
    }
  },

  /** Synchronous local lookup — use when async is unnecessary (e.g. in store helpers). */
  getLocal(): Exercise[] {
    return EXERCISES;
  },

  getLocalById(id: string): Exercise | undefined {
    return getExerciseById(id);
  },
};
