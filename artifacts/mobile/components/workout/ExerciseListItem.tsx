import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Exercise } from '@/types/fitness';
import { CATEGORY_CONFIG, MUSCLE_LABELS } from '@/constants/workout';

interface ExerciseListItemProps {
  exercise: Exercise;
  /** Shown on the right — e.g. "4 × 10 reps" or "3 × 30 sec" */
  setsLabel?: string;
  showMuscles?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}

export function ExerciseListItem({
  exercise,
  setsLabel,
  showMuscles = true,
  isLast = false,
  onPress,
}: ExerciseListItemProps) {
  const colors = useColors();
  const cfg = CATEGORY_CONFIG[exercise.category];

  const topMuscles = exercise.muscleGroups.slice(0, 3);

  const inner = (
    <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      {/* Icon bubble */}
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + '1A' }]}>
        <Feather name={cfg.icon as 'zap'} size={18} color={cfg.color} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
          {exercise.name}
        </Text>
        {showMuscles && (
          <Text style={[styles.muscles, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {topMuscles.map((m) => MUSCLE_LABELS[m]).join(' · ')}
          </Text>
        )}
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {setsLabel ? (
          <Text style={[styles.setsLabel, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            {setsLabel}
          </Text>
        ) : null}
        {onPress ? (
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

function formatSetsLabel(we: { sets: { reps?: number; duration?: number }[] }): string {
  const s = we.sets[0];
  const count = we.sets.length;
  if (s?.duration) return `${count} × ${s.duration}s`;
  if (s?.reps) return `${count} × ${s.reps}`;
  return `${count} sets`;
}

ExerciseListItem.formatSetsLabel = formatSetsLabel;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 14 },
  muscles: { fontSize: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setsLabel: { fontSize: 13 },
});
