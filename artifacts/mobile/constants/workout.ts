import type { ExerciseCategory, DifficultyLevel, MuscleGroup, EquipmentType } from '@/types/fitness';

export const CATEGORY_CONFIG: Record<
  ExerciseCategory,
  { label: string; color: string; bg: string; icon: string; description: string }
> = {
  strength: {
    label: 'Strength',
    color: '#22C55E',
    bg: '#22C55E18',
    icon: 'trending-up',
    description: 'Build muscle & power',
  },
  cardio: {
    label: 'Cardio',
    color: '#3B82F6',
    bg: '#3B82F618',
    icon: 'heart',
    description: 'Improve endurance',
  },
  hiit: {
    label: 'HIIT',
    color: '#F97316',
    bg: '#F9731618',
    icon: 'zap',
    description: 'High-intensity intervals',
  },
  yoga: {
    label: 'Yoga',
    color: '#A855F7',
    bg: '#A855F718',
    icon: 'wind',
    description: 'Flexibility & mindfulness',
  },
  flexibility: {
    label: 'Flexibility',
    color: '#06B6D4',
    bg: '#06B6D418',
    icon: 'rotate-cw',
    description: 'Mobility & recovery',
  },
  core: {
    label: 'Core',
    color: '#F59E0B',
    bg: '#F59E0B18',
    icon: 'target',
    description: 'Strengthen your center',
  },
};

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: '#22C55E' },
  intermediate: { label: 'Intermediate', color: '#F59E0B' },
  advanced: { label: 'Advanced', color: '#EF4444' },
};

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
  glutes: 'Glutes',
  calves: 'Calves',
  full_body: 'Full Body',
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  none: 'No Equipment',
  dumbbells: 'Dumbbells',
  barbell: 'Barbell',
  machine: 'Machine',
  cables: 'Cables',
  resistance_band: 'Resistance Band',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
  pull_up_bar: 'Pull-Up Bar',
};

export const CATEGORY_FILTER_OPTIONS: Array<{ label: string; value: ExerciseCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Strength', value: 'strength' },
  { label: 'HIIT', value: 'hiit' },
  { label: 'Cardio', value: 'cardio' },
  { label: 'Core', value: 'core' },
  { label: 'Yoga', value: 'yoga' },
  { label: 'Flexibility', value: 'flexibility' },
];

export const DIFFICULTY_FILTER_OPTIONS: Array<{ label: string; value: DifficultyLevel | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export const DEFAULT_REST_TIME = 90; // seconds
export const DEFAULT_REPS = 10;
export const DEFAULT_WEIGHT = 20; // kg
