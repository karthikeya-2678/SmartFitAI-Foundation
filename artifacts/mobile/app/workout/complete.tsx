import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_CONFIG } from '@/constants/workout';
import type { WorkoutLog } from '@/types/fitness';

const MOODS = [
  { value: 1, emoji: '😩', label: 'Tough' },
  { value: 2, emoji: '😕', label: 'Hard' },
  { value: 3, emoji: '😐', label: 'OK' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🔥', label: 'Great' },
];

export default function WorkoutCompleteScreen() {
  const colors = useColors();

  // Cache the session immediately so it survives endSession()
  const [cachedSession] = useState(() => useWorkoutStore.getState().session);
  const { endSession, getTotalCompletedSets } = useWorkoutStore();
  const { addWorkoutLog } = useAppStore();

  const [mood, setMood] = useState<number>(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!cachedSession) {
    // Nothing to show — session was already cleared
    router.replace('/(tabs)/workouts' as any);
    return null;
  }

  const { workout, startedAt, loggedSets } = cachedSession;
  const catCfg = CATEGORY_CONFIG[workout.category];

  // Compute stats
  const endedAt = new Date();
  const startDate = new Date(startedAt);
  const durationMinutes = Math.max(1, Math.round((endedAt.getTime() - startDate.getTime()) / 60000));

  const completedSetKeys = Object.keys(loggedSets).filter((k) => loggedSets[k]?.completed);
  const totalSets = completedSetKeys.length;

  let totalReps = 0;
  let totalVolume = 0;
  for (const key of completedSetKeys) {
    const s = loggedSets[key]!;
    totalReps += s.reps ?? 0;
    totalVolume += (s.reps ?? 0) * (s.weight ?? 0);
  }

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const log: WorkoutLog = {
        id: `log-${Date.now()}`,
        workoutId: workout.id,
        workoutName: workout.name,
        completedAt: endedAt.toISOString(),
        startedAt,
        durationMinutes,
        totalSets,
        totalReps,
        totalVolume: Math.round(totalVolume),
        caloriesBurned: workout.estimatedCalories
          ? Math.round((workout.estimatedCalories * durationMinutes) / workout.durationMinutes)
          : undefined,
        mood: mood as 1 | 2 | 3 | 4 | 5,
        notes: notes.trim() || undefined,
        exercises: workout.exercises.map((we) => ({
          exerciseId: we.exercise.id,
          exerciseName: we.exercise.name,
          sets: we.sets.map((_, i) => {
            const ls = loggedSets[`${we.id}_${i}`];
            return {
              reps: ls?.reps,
              weight: ls?.weight,
              completed: ls?.completed ?? false,
            };
          }),
        })),
      };

      addWorkoutLog(log);
      endSession();
      router.replace('/(tabs)/workouts' as any);
    } catch (e) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
      setSaving(false);
    }
  }, [saving, mood, notes, workout, durationMinutes, totalSets, totalReps, totalVolume, loggedSets, endSession, addWorkoutLog]);

  const handleDiscard = useCallback(() => {
    Alert.alert('Discard Workout?', 'Your session data will not be saved.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          endSession();
          router.replace('/(tabs)/workouts' as any);
        },
      },
    ]);
  }, [endSession]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Celebration header */}
        <Animated.View entering={ZoomIn.delay(100).springify()} style={styles.celebrationWrap}>
          <View style={[styles.celebrationIcon, { backgroundColor: catCfg.color + '20' }]}>
            <Text style={styles.celebrationEmoji}>🏆</Text>
          </View>
          <Text style={[styles.celebrationTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Workout Complete!
          </Text>
          <Text style={[styles.celebrationSub, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            {workout.name}
          </Text>
        </Animated.View>

        {/* Stats grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.statsGrid}>
            <StatBox icon="clock" label="Duration" value={`${durationMinutes}`} unit="min" color={catCfg.color} colors={colors} />
            <StatBox icon="repeat" label="Sets Done" value={String(totalSets)} unit="sets" color={colors.primary} colors={colors} />
            <StatBox icon="trending-up" label="Total Reps" value={String(totalReps)} unit="reps" color="#8B5CF6" colors={colors} />
            <StatBox icon="layers" label="Volume" value={totalVolume > 0 ? String(Math.round(totalVolume)) : '—'} unit="kg" color="#F59E0B" colors={colors} />
          </View>
        </Animated.View>

        {/* Mood picker */}
        <Animated.View entering={FadeInDown.delay(280).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            How did it feel?
          </Text>
          <View style={[styles.moodRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.moodBtn,
                  mood === m.value && {
                    backgroundColor: catCfg.color + '25',
                    borderColor: catCfg.color,
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => setMood(m.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, { color: mood === m.value ? catCfg.color : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Notes */}
        <Animated.View entering={FadeInDown.delay(340).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Notes (optional)
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text, fontFamily: 'Inter_400Regular' },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How was the session? Any PRs or notes for next time…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <Feather name="loader" size={18} color="#fff" />
            ) : (
              <Feather name="check-circle" size={18} color="#fff" />
            )}
            <Text style={[styles.saveBtnText, { fontFamily: 'Inter_700Bold' }]}>
              {saving ? 'Saving…' : 'Save Workout'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.discardBtn, { borderColor: colors.border }]}
            onPress={handleDiscard}
            activeOpacity={0.7}
          >
            <Text style={[styles.discardText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Discard
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({
  icon, label, value, unit, color, colors,
}: {
  icon: string; label: string; value: string; unit: string; color: string; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon as 'clock'} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>{value}</Text>
      <Text style={[styles.statUnit, { color: color, fontFamily: 'Inter_600SemiBold' }]}>{unit}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  celebrationWrap: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  celebrationIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  celebrationEmoji: { fontSize: 40 },
  celebrationTitle: { fontSize: 28 },
  celebrationSub: { fontSize: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statBox: {
    flex: 1,
    minWidth: '44%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statValue: { fontSize: 26 },
  statUnit: { fontSize: 12 },
  statLabel: { fontSize: 11 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 24,
  },
  moodBtn: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 10, gap: 5 },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10 },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 28,
  },
  actions: { gap: 12, paddingBottom: 40 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
  },
  saveBtnText: { color: '#fff', fontSize: 17 },
  discardBtn: { borderWidth: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  discardText: { fontSize: 14 },
});
