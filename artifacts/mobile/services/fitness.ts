import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { Workout, WorkoutLog, WorkoutStreak, WeeklyStats } from '@/types/fitness';

export const fitnessService = {
  async getWorkouts(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Workout[]> {
    const query: Record<string, string> = {};
    if (params?.category) query.category = params.category;
    if (params?.difficulty) query.difficulty = params.difficulty;
    if (params?.search) query.search = params.search;
    return apiClient.get<Workout[]>(API_ENDPOINTS.workouts.list, query);
  },

  async getWorkoutById(id: string): Promise<Workout> {
    return apiClient.get<Workout>(API_ENDPOINTS.workouts.byId(id));
  },

  async getFeaturedWorkouts(): Promise<Workout[]> {
    return apiClient.get<Workout[]>(API_ENDPOINTS.workouts.featured);
  },

  async createWorkoutLog(
    data: Omit<WorkoutLog, 'id' | 'userId'>
  ): Promise<WorkoutLog> {
    return apiClient.post<WorkoutLog>(API_ENDPOINTS.logs.create, data);
  },

  async getWorkoutLogs(): Promise<WorkoutLog[]> {
    return apiClient.get<WorkoutLog[]>(API_ENDPOINTS.logs.list);
  },

  async getWorkoutStreak(): Promise<WorkoutStreak> {
    return apiClient.get<WorkoutStreak>(API_ENDPOINTS.logs.streak);
  },

  async getWeeklyStats(): Promise<WeeklyStats> {
    return apiClient.get<WeeklyStats>(API_ENDPOINTS.logs.weekly);
  },

  async completeWorkout(
    logId: string,
    data: Partial<WorkoutLog>
  ): Promise<WorkoutLog> {
    return apiClient.patch<WorkoutLog>(API_ENDPOINTS.logs.byId(logId), data);
  },
};
