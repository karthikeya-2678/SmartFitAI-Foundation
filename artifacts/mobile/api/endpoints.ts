export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  // User
  user: {
    profile: '/users/me',
    updateProfile: '/users/me',
    measurements: '/users/me/measurements',
    stats: '/users/me/stats',
  },

  // Workouts
  workouts: {
    list: '/workouts',
    byId: (id: string) => `/workouts/${id}`,
    featured: '/workouts/featured',
    search: '/workouts/search',
  },

  // Workout Logs
  logs: {
    list: '/logs',
    create: '/logs',
    byId: (id: string) => `/logs/${id}`,
    stats: '/logs/stats',
    streak: '/logs/streak',
    weekly: '/logs/weekly',
  },

  // Exercises
  exercises: {
    list: '/exercises',
    byId: (id: string) => `/exercises/${id}`,
    byMuscleGroup: (group: string) => `/exercises?muscleGroup=${group}`,
  },

  // Health
  health: '/healthz',
} as const;
