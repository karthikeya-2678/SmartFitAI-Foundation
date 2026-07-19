---
name: Workout module architecture
description: Structure and key decisions for the SmartFitAI workout module
---

## Key Files

**Data layer** (local seed — API falls back to these):
- `data/exercises.ts` — 36 exercises across strength/HIIT/cardio/core/yoga/flexibility
- `data/workouts.ts` — 8 workouts; `filterWorkouts()` + `getWorkoutById()` helpers

**State**:
- `store/useWorkoutStore.ts` — Zustand + AsyncStorage; persists `favoriteIds` only; `session` is ephemeral (cleared on app restart)
- Session key format: `${workoutExerciseId}_${setIndex}` for `loggedSets`

**Services**:
- `services/exercises.ts` — wraps API with local seed fallback; use `getLocalById()` for sync lookups

**Components** (`components/workout/index.ts` barrel):
- `WorkoutCard`, `CategoryBanner`, `ExerciseListItem`, `SetRow`, `RestTimer`, `WorkoutTimer`, `HistoryCard`

**Screens**:
- `app/(tabs)/workouts.tsx` — browse tab (search + filters + favorites + history teaser)
- `app/workout/[id].tsx` — detail + start
- `app/workout/active.tsx` — live session; reads `session` from store; redirects if null
- `app/workout/complete.tsx` — caches session with `useState(() => session)` before `endSession()`
- `app/exercise/[id].tsx` — exercise detail with instructions
- `app/workout/history.tsx` — grouped by date + weekly stats

## WorkoutLog type (types/fitness.ts)

`WorkoutLog.exercises` is `LoggedExerciseRecord[]` (lightweight) — NOT `WorkoutExercise[]`.
`userId` and `startedAt` are optional. `completedAt` and `durationMinutes` are required.
Added `totalSets`, `totalReps`, `totalVolume` optional fields.

## Navigation flow

workouts tab → `/workout/[id]` → `startSession(workout)` → `/workout/active` → `/workout/complete` → replace `/(tabs)/workouts`

`active.tsx` and `complete.tsx` both use `gestureEnabled: false` (registered in `_layout.tsx`) to prevent swiping back mid-session.

**Why:** Swiping back during active session would leave the Zustand session running with no way to resume or clean it up.

## SetRow behavior

Rest timer is LOCAL state in `active.tsx` (not in store). After `completeSet()`, `isResting` flag on the store session drives `<RestTimer>` visibility. `stopRest()` clears it.
