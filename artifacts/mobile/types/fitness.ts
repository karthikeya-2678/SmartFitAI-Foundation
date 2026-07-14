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
  | 'bodyweight';

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

export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  caloriesBurned?: number;
  exercises: WorkoutExercise[];
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
