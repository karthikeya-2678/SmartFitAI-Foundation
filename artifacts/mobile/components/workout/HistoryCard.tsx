import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { WorkoutLog } from '@/types/fitness';
import { CATEGORY_CONFIG } from '@/constants/workout';
import { WORKOUTS } from '@/data/workouts';

interface HistoryCardProps {
  log: WorkoutLog;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function HistoryCard({ log }: HistoryCardProps) {
  const colors = useColors();

  const workout = WORKOUTS.find((w) => w.id === log.workoutId);
  const category = workout?.category ?? 'strength';
  const cfg = CATEGORY_CONFIG[category];

  const dateObj = new Date(log.completedAt);
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const moodMap: Record<number, string> = { 1: '😩', 2: '😕', 3: '😐', 4: '😊', 5: '🔥' };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Accent */}
      <View style={[styles.accent, { backgroundColor: cfg.color }]} />

      <View style={styles.inner}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, { backgroundColor: cfg.color + '20' }]}>
            <Feather name={cfg.icon as 'zap'} size={16} color={cfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text, fontFamily: 'Inter_700Bold' }]} numberOfLines={1}>
              {log.workoutName}
            </Text>
            <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {dateStr} · {timeStr}
            </Text>
          </View>
          {log.mood ? (
            <Text style={styles.mood}>{moodMap[log.mood] ?? ''}</Text>
          ) : null}
        </View>

        {/* Stats row */}
        <View style={styles.stats}>
          <StatChip icon="clock" label={formatDuration(log.durationMinutes)} colors={colors} />
          {log.totalSets != null ? (
            <StatChip icon="repeat" label={`${log.totalSets} sets`} colors={colors} />
          ) : null}
          {log.totalReps != null ? (
            <StatChip icon="trending-up" label={`${log.totalReps} reps`} colors={colors} />
          ) : null}
          {log.totalVolume != null ? (
            <StatChip icon="layers" label={`${log.totalVolume.toLocaleString()} kg vol`} colors={colors} />
          ) : null}
          {log.caloriesBurned != null ? (
            <StatChip icon="zap" label={`${log.caloriesBurned} kcal`} colors={colors} />
          ) : null}
        </View>

        {/* Notes */}
        {log.notes ? (
          <Text style={[styles.notes, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>
            {log.notes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function StatChip({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: colors.surface }]}>
      <Feather name={icon as 'clock'} size={11} color={colors.mutedForeground} />
      <Text style={[styles.chipText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    flexDirection: 'row',
  },
  accent: { width: 3 },
  inner: { flex: 1, padding: 14, gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 15 },
  date: { fontSize: 11, marginTop: 1 },
  mood: { fontSize: 22 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: { fontSize: 11 },
  notes: { fontSize: 12, lineHeight: 17 },
});
