import { create } from 'zustand';
import type { DashboardData, DashboardNotification, MembershipTier } from '@/types/dashboard';
import type { WorkoutLog } from '@/types/fitness';

interface DashboardState {
  isLoading: boolean;
  data: DashboardData | null;
  recentActivity: WorkoutLog[];

  // Actions
  loadDashboard: () => Promise<void>;
  logWater: (ml: number) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

/** Derive BMI from weight (kg) and height (cm). Returns null if inputs missing. */
function calcBmi(weight?: number, height?: number): number | null {
  if (!weight || !height || height === 0) return null;
  const h = height / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

/** Build realistic seed data; in production these come from the API. */
function buildSeedData(
  weight?: number,
  height?: number,
  membership: MembershipTier = 'pro',
): DashboardData {
  return {
    membership,
    calories: { consumed: 1420, target: 2100 },
    protein: { consumed: 98, target: 150 },
    water: { consumed: 1200, target: 2500 },
    streak: 7,
    longestStreak: 21,
    bmi: calcBmi(weight, height),
    weight: weight ?? null,
    aiRecommendation:
      'Your recovery looks good today 💪 Your last 3 sessions targeted upper body — consider a lower body or cardio session to balance your week and prevent overuse.',
    upcomingWorkout: {
      id: 'uw-1',
      name: 'Lower Body Power',
      scheduledDate: new Date(Date.now() + 86_400_000).toISOString(),
      durationMinutes: 50,
      category: 'strength',
      difficulty: 'Intermediate',
    },
    notifications: [
      {
        id: 'n1',
        title: 'Streak Milestone! 🔥',
        body: "You've hit a 7-day workout streak. Keep the momentum going!",
        type: 'success',
        isRead: false,
        createdAt: new Date(Date.now() - 1_800_000).toISOString(),
      },
      {
        id: 'n2',
        title: 'Hydration Reminder',
        body: "You're below your daily water goal. Aim for 2 more glasses.",
        type: 'warning',
        isRead: false,
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
      },
      {
        id: 'n3',
        title: 'AI Insight Ready',
        body: 'Your weekly performance analysis is available. Check your progress!',
        type: 'ai',
        isRead: true,
        createdAt: new Date(Date.now() - 7_200_000).toISOString(),
      },
    ],
    weeklyActivity: [0.8, 0.0, 1.0, 0.6, 0.4, 0.0, 0.0],
    totalWeeklyMinutes: 180,
    totalWeeklyCalories: 2840,
  };
}

function buildSeedActivity(): WorkoutLog[] {
  return [
    {
      id: 'log-1',
      workoutId: 'w-1',
      workoutName: 'HIIT Cardio Blast',
      userId: '',
      startedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      completedAt: new Date(Date.now() - 2 * 3600_000 + 30 * 60_000).toISOString(),
      durationMinutes: 30,
      caloriesBurned: 380,
      exercises: [],
    },
    {
      id: 'log-2',
      workoutId: 'w-2',
      workoutName: 'Leg Day',
      userId: '',
      startedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
      completedAt: new Date(Date.now() - 26 * 3600_000 + 55 * 60_000).toISOString(),
      durationMinutes: 55,
      caloriesBurned: 420,
      exercises: [],
    },
    {
      id: 'log-3',
      workoutId: 'w-3',
      workoutName: 'Core & Abs',
      userId: '',
      startedAt: new Date(Date.now() - 50 * 3600_000).toISOString(),
      completedAt: new Date(Date.now() - 50 * 3600_000 + 25 * 60_000).toISOString(),
      durationMinutes: 25,
      caloriesBurned: 210,
      exercises: [],
    },
  ];
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  isLoading: true,
  data: null,
  recentActivity: [],

  loadDashboard: async () => {
    set({ isLoading: true });
    // In production: call fitnessService & userService and merge results.
    // We simulate network latency so skeletons are visible and UX is tested.
    await new Promise((r) => setTimeout(r, 1400));

    // Pull weight/height from app store if available (imported lazily to avoid circular).
    let weight: number | undefined;
    let height: number | undefined;
    try {
      const { useAppStore } = await import('@/store/useAppStore');
      const user = useAppStore.getState().user;
      weight = user?.weight;
      height = user?.height;
    } catch {
      // ignore
    }

    set({
      isLoading: false,
      data: buildSeedData(weight, height),
      recentActivity: buildSeedActivity(),
    });
  },

  logWater: (ml) => {
    const { data } = get();
    if (!data) return;
    set({
      data: {
        ...data,
        water: {
          ...data.water,
          consumed: Math.min(data.water.consumed + ml, data.water.target * 1.5),
        },
      },
    });
  },

  markNotificationRead: (id) => {
    const { data } = get();
    if (!data) return;
    set({
      data: {
        ...data,
        notifications: data.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      },
    });
  },

  markAllNotificationsRead: () => {
    const { data } = get();
    if (!data) return;
    set({
      data: {
        ...data,
        notifications: data.notifications.map((n) => ({ ...n, isRead: true })),
      },
    });
  },
}));
