import type { Workout, WorkoutExercise, WorkoutSet } from '@/types/fitness';
import { EXERCISES } from './exercises';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ex(id: string) {
  const found = EXERCISES.find((e) => e.id === id);
  if (!found) throw new Error(`Exercise "${id}" not found in seed data`);
  return found;
}

function sets(
  weId: string,
  exerciseId: string,
  count: number,
  opts: { reps?: number; weight?: number; duration?: number; restTime?: number } = {},
): WorkoutSet[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${weId}-s${i + 1}`,
    exerciseId,
    reps: opts.reps,
    weight: opts.weight ?? 0,
    duration: opts.duration,
    restTime: opts.restTime ?? 90,
    completed: false,
  }));
}

function we(
  workoutId: string,
  order: number,
  exerciseId: string,
  workoutSets: WorkoutSet[],
  notes?: string,
): WorkoutExercise {
  const id = `${workoutId}-ex${order}`;
  return { id, exercise: ex(exerciseId), sets: workoutSets, order, notes };
}

// ─── Workouts ────────────────────────────────────────────────────────────────

export const WORKOUTS: Workout[] = [
  // ── W1: Full Body Strength ──────────────────────────────────────────────────
  {
    id: 'w-01',
    name: 'Full Body Strength',
    description: 'A balanced compound session that hits every major muscle group in one efficient workout.',
    category: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 45,
    estimatedCalories: 380,
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    exercises: [
      we('w-01', 1, 'ex-01', sets('w-01-ex1', 'ex-01', 4, { reps: 8, weight: 80, restTime: 90 }),
        'Focus on depth — get thighs parallel.'),
      we('w-01', 2, 'ex-04', sets('w-01-ex2', 'ex-04', 4, { reps: 8, weight: 60, restTime: 90 })),
      we('w-01', 3, 'ex-07', sets('w-01-ex3', 'ex-07', 4, { reps: 10, weight: 60, restTime: 90 }),
        'Keep your back flat throughout.'),
      we('w-01', 4, 'ex-06', sets('w-01-ex4', 'ex-06', 3, { reps: 10, weight: 40, restTime: 75 })),
      we('w-01', 5, 'ex-12', sets('w-01-ex5', 'ex-12', 3, { reps: 12, weight: 16, restTime: 60 }),
        '12 reps per leg.'),
    ],
  },

  // ── W2: HIIT Blast ──────────────────────────────────────────────────────────
  {
    id: 'w-02',
    name: 'HIIT Blast',
    description: 'Five brutal intervals that torch calories and boost your metabolism for hours.',
    category: 'hiit',
    difficulty: 'advanced',
    durationMinutes: 25,
    estimatedCalories: 450,
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    exercises: [
      we('w-02', 1, 'ex-16', sets('w-02-ex1', 'ex-16', 4, { reps: 15, restTime: 30 }),
        'Explode on every jump. No lazy reps.'),
      we('w-02', 2, 'ex-17', sets('w-02-ex2', 'ex-17', 4, { reps: 20, restTime: 30 })),
      we('w-02', 3, 'ex-18', sets('w-02-ex3', 'ex-18', 4, { duration: 30, restTime: 30 }),
        '30 seconds max effort.'),
      we('w-02', 4, 'ex-21', sets('w-02-ex4', 'ex-21', 3, { duration: 30, restTime: 45 }),
        'Alternate wave pattern each set.'),
      we('w-02', 5, 'ex-20', sets('w-02-ex5', 'ex-20', 3, { reps: 20, restTime: 45 })),
    ],
  },

  // ── W3: Morning Yoga Flow ───────────────────────────────────────────────────
  {
    id: 'w-03',
    name: 'Morning Yoga Flow',
    description: 'A gentle sequence to wake up your body, improve mobility, and set a calm tone for the day.',
    category: 'yoga',
    difficulty: 'beginner',
    durationMinutes: 30,
    estimatedCalories: 120,
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    exercises: [
      we('w-03', 1, 'ex-36', sets('w-03-ex1', 'ex-36', 2, { duration: 60, restTime: 10 }),
        'Breathe deeply — let the movement be led by your breath.'),
      we('w-03', 2, 'ex-32', sets('w-03-ex2', 'ex-32', 3, { duration: 45, restTime: 10 })),
      we('w-03', 3, 'ex-33', sets('w-03-ex3', 'ex-33', 3, { duration: 45, restTime: 15 }),
        'Hold each side for 45 seconds.'),
      we('w-03', 4, 'ex-34', sets('w-03-ex4', 'ex-34', 2, { duration: 60, restTime: 15 }),
        'Each side — 60 seconds per side.'),
      we('w-03', 5, 'ex-35', sets('w-03-ex5', 'ex-35', 2, { duration: 60, restTime: 10 }),
        'Rest completely — focus on breathing.'),
    ],
  },

  // ── W4: Sprint Intervals ────────────────────────────────────────────────────
  {
    id: 'w-04',
    name: 'Sprint Intervals',
    description: 'Eight rounds of maximum-effort sprints with recovery walks to spike your cardio capacity.',
    category: 'cardio',
    difficulty: 'advanced',
    durationMinutes: 35,
    estimatedCalories: 520,
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    exercises: [
      we('w-04', 1, 'ex-22',
        [
          ...Array.from({ length: 3 }, (_, i) => ({
            id: `w-04-ex1-s${i + 1}`,
            exerciseId: 'ex-22',
            duration: 120,
            restTime: 120,
            completed: false,
          })),
        ],
        'Warm-up: 3 × 2 min at easy jog pace.',
      ),
      we('w-04', 2, 'ex-22',
        [
          ...Array.from({ length: 8 }, (_, i) => ({
            id: `w-04-ex2-s${i + 1}`,
            exerciseId: 'ex-22',
            duration: 30,
            restTime: 60,
            completed: false,
          })),
        ],
        '30 sec max effort sprint, 60 sec recovery walk. Repeat 8 times.',
      ),
      we('w-04', 3, 'ex-22',
        [
          ...Array.from({ length: 2 }, (_, i) => ({
            id: `w-04-ex3-s${i + 1}`,
            exerciseId: 'ex-22',
            duration: 180,
            restTime: 30,
            completed: false,
          })),
        ],
        'Cool-down: 2 × 3 min at easy walk.',
      ),
    ],
  },

  // ── W5: Core Crusher ────────────────────────────────────────────────────────
  {
    id: 'w-05',
    name: 'Core Crusher',
    description: 'Five targeted core exercises that build strength, endurance, and visible definition.',
    category: 'core',
    difficulty: 'intermediate',
    durationMinutes: 20,
    estimatedCalories: 200,
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    exercises: [
      we('w-05', 1, 'ex-26', sets('w-05-ex1', 'ex-26', 3, { duration: 45, restTime: 45 }),
        'Perfect form over duration.'),
      we('w-05', 2, 'ex-27', sets('w-05-ex2', 'ex-27', 3, { reps: 20, restTime: 45 }),
        '20 reps = 10 each side.'),
      we('w-05', 3, 'ex-28', sets('w-05-ex3', 'ex-28', 3, { reps: 12, restTime: 60 })),
      we('w-05', 4, 'ex-30', sets('w-05-ex4', 'ex-30', 3, { reps: 10, restTime: 60 }),
        'Go only as far as you can maintain a neutral spine.'),
      we('w-05', 5, 'ex-31', sets('w-05-ex5', 'ex-31', 2, { duration: 30, restTime: 30 }),
        '30 seconds each side.'),
    ],
  },

  // ── W6: Upper Body Power ────────────────────────────────────────────────────
  {
    id: 'w-06',
    name: 'Upper Body Power',
    description: 'A strength-focused upper-body session with heavy compounds and finishing accessory work.',
    category: 'strength',
    difficulty: 'advanced',
    durationMinutes: 55,
    estimatedCalories: 430,
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    exercises: [
      we('w-06', 1, 'ex-04', sets('w-06-ex1', 'ex-04', 5, { reps: 5, weight: 80, restTime: 120 }),
        'Work up to a challenging 5RM weight.'),
      we('w-06', 2, 'ex-06', sets('w-06-ex2', 'ex-06', 4, { reps: 6, weight: 50, restTime: 90 })),
      we('w-06', 3, 'ex-08', sets('w-06-ex3', 'ex-08', 4, { reps: 8, restTime: 90 }),
        'Add weight if bodyweight is easy.'),
      we('w-06', 4, 'ex-07', sets('w-06-ex4', 'ex-07', 4, { reps: 8, weight: 70, restTime: 90 })),
      we('w-06', 5, 'ex-09', sets('w-06-ex5', 'ex-09', 3, { reps: 12, weight: 12, restTime: 60 })),
      we('w-06', 6, 'ex-10', sets('w-06-ex6', 'ex-10', 3, { reps: 15, weight: 20, restTime: 60 })),
    ],
  },

  // ── W7: Lower Body Power ────────────────────────────────────────────────────
  {
    id: 'w-07',
    name: 'Lower Body Power',
    description: 'A comprehensive leg session that builds size and strength from quads to calves.',
    category: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 55,
    estimatedCalories: 390,
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    exercises: [
      we('w-07', 1, 'ex-01', sets('w-07-ex1', 'ex-01', 5, { reps: 5, weight: 100, restTime: 120 }),
        'These are your heaviest sets of the day.'),
      we('w-07', 2, 'ex-03', sets('w-07-ex2', 'ex-03', 4, { reps: 8, weight: 70, restTime: 90 })),
      we('w-07', 3, 'ex-02', sets('w-07-ex3', 'ex-02', 3, { reps: 5, weight: 120, restTime: 120 }),
        'Focus on form. Lower the weight before form breaks.'),
      we('w-07', 4, 'ex-11', sets('w-07-ex4', 'ex-11', 4, { reps: 12, weight: 80, restTime: 75 })),
      we('w-07', 5, 'ex-12', sets('w-07-ex5', 'ex-12', 3, { reps: 10, weight: 16, restTime: 60 }),
        '10 reps per leg.'),
    ],
  },

  // ── W8: Mobility & Recovery ─────────────────────────────────────────────────
  {
    id: 'w-08',
    name: 'Mobility & Recovery',
    description: 'A low-intensity session to promote recovery, reduce soreness, and improve long-term mobility.',
    category: 'flexibility',
    difficulty: 'beginner',
    durationMinutes: 30,
    estimatedCalories: 100,
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    exercises: [
      we('w-08', 1, 'ex-36', sets('w-08-ex1', 'ex-36', 2, { duration: 90, restTime: 10 }),
        'The perfect opener — breathe and move with the rhythm.'),
      we('w-08', 2, 'ex-32', sets('w-08-ex2', 'ex-32', 3, { duration: 60, restTime: 15 })),
      we('w-08', 3, 'ex-34', sets('w-08-ex3', 'ex-34', 3, { duration: 60, restTime: 15 }),
        '60 seconds each side.'),
      we('w-08', 4, 'ex-31', sets('w-08-ex4', 'ex-31', 2, { duration: 30, restTime: 20 }),
        '30 seconds each side.'),
      we('w-08', 5, 'ex-35', sets('w-08-ex5', 'ex-35', 2, { duration: 90, restTime: 10 }),
        'End here — let your body fully relax.'),
    ],
  },
];

/** Quick lookup by ID. */
export function getWorkoutById(id: string): Workout | undefined {
  return WORKOUTS.find((w) => w.id === id);
}

/** Filter workouts by category and/or difficulty. */
export function filterWorkouts(opts: {
  category?: string;
  difficulty?: string;
  search?: string;
}): Workout[] {
  return WORKOUTS.filter((w) => {
    if (opts.category && opts.category !== 'all' && w.category !== opts.category) return false;
    if (opts.difficulty && opts.difficulty !== 'all' && w.difficulty !== opts.difficulty) return false;
    if (opts.search) {
      const q = opts.search.toLowerCase();
      if (!w.name.toLowerCase().includes(q) && !w.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
