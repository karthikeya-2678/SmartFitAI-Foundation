export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain'
  | 'improve_endurance'
  | 'increase_flexibility';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  gender?: Gender;
  goal?: string;
  fitnessGoal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
}
