import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loading';
import type { UpcomingWorkout } from '@/types/dashboard';

interface UpcomingWorkoutCardProps {
  workout: UpcomingWorkout | null;
  isLoading: boolean;
  onPress?: () => void;
  delay?: number;
}

function formatScheduled(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.round(diffMs / 3_600_000);
  if (diffH < 24) return `In ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Tomorrow';
  return `In ${diffD} days`;
}

const CATEGORY_ICON: Record<string, string> = {
  strength: 'trending-up',
  cardio: 'heart',
  hiit: 'zap',
  yoga: 'wind',
  flexibility: 'wind',
  core: 'circle',
};

export function UpcomingWorkoutCard({ workout, isLoading, onPress, delay = 450 }: UpcomingWorkoutCardProps) {
  const colors = useColors();

  if (isLoading) {
    return <Card style={{ marginBottom: 20, gap: 10 }}>
      <Skeleton height={14} width="45%" />
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Skeleton width={44} height={44} borderRadius={12} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton height={16} width="70%" />
          <Skeleton height={12} width="50%" />
        </View>
        <Skeleton width={50} height={26} borderRadius={8} />
      </View>
    </Card>;
  }

  if (!workout) return null;

  const iconName = CATEGORY_ICON[workout.category] ?? 'activity';
  const whenLabel = formatScheduled(workout.scheduledDate);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <Card style={{ marginBottom: 20 }}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter_600SemiBold' }]}>
            UPCOMING WORKOUT
          </Text>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.accent + '22' }]}>
              <Feather name={iconName as 'activity'} size={20} color={colors.accent} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
                {workout.name}
              </Text>
              <Text style={[styles.meta, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                {workout.durationMinutes} min · {workout.difficulty}
              </Text>
            </View>
            <View style={[styles.whenBadge, { backgroundColor: colors.accent + '22' }]}>
              <Feather name="clock" size={11} color={colors.accent} />
              <Text style={[styles.whenText, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>
                {whenLabel}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, letterSpacing: 0.8, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15 },
  meta: { fontSize: 12 },
  whenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  whenText: { fontSize: 11 },
});
