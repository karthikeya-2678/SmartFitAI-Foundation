export interface NutritionMetric {
  consumed: number;
  target: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'ai';
  isRead: boolean;
  createdAt: string;
}

export interface UpcomingWorkout {
  id: string;
  name: string;
  scheduledDate: string; // ISO string
  durationMinutes: number;
  category: string;
  difficulty: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route?: string;
  color: string;
}

export type MembershipTier = 'free' | 'pro' | 'elite';

export interface DashboardData {
  membership: MembershipTier;
  calories: NutritionMetric;
  protein: NutritionMetric;
  water: NutritionMetric;
  streak: number;
  longestStreak: number;
  bmi: number | null;
  weight: number | null; // kg
  aiRecommendation: string | null;
  upcomingWorkout: UpcomingWorkout | null;
  notifications: DashboardNotification[];
  weeklyActivity: number[]; // 0-1 per day Mon-Sun
  totalWeeklyMinutes: number;
  totalWeeklyCalories: number;
}
