export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'glutes'
  | 'calves'
  | 'full_body';

export type ExerciseCategory =
  | 'strength'
  | 'cardio'
  | 'hiit'
  | 'yoga'
  | 'flexibility'
  | 'core';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type EquipmentType =
  | 'none'
  | 'dumbbells'
  | 'barbell'
  | 'machine'
  | 'cables'
  | 'resistance_band'
  | 'bodyweight'
  | 'kettlebell'
  | 'pull_up_bar';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  instructions?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds
  distance?: number; // meters
  restTime?: number; // seconds
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  estimatedCalories?: number;
  exercises: WorkoutExercise[];
  isCustom: boolean;
  thumbnailUrl?: string;
  createdAt: string;
}

/** Lightweight per-set record stored inside a WorkoutLog. */
export interface LoggedSetRecord {
  reps?: number;
  weight?: number;
  duration?: number;
  completed: boolean;
}

/** Lightweight per-exercise record stored inside a WorkoutLog. */
export interface LoggedExerciseRecord {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSetRecord[];
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  userId?: string;
  startedAt?: string;
  completedAt: string;
  durationMinutes: number;
  caloriesBurned?: number;
  totalSets?: number;
  totalReps?: number;
  totalVolume?: number;
  exercises?: LoggedExerciseRecord[];
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface WorkoutStreak {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: string;
}

export interface WeeklyStats {
  weekStart: string;
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  completionRate: number;
}

// ─── Active Workout Session ───────────────────────────────────────────────────

/** A single set result logged during an active session. */
export interface LoggedSet {
  reps: number;
  weight: number; // kg
  completed: boolean;
  completedAt?: string;
}

/** Full state of an in-progress workout session. */
export interface WorkoutSession {
  workout: Workout;
  startedAt: string;
  currentExerciseIndex: number;
  /** key: `${workoutExerciseId}_${setIndex}` */
  loggedSets: Record<string, LoggedSet>;
  isResting: boolean;
  restDuration: number; // seconds
}
