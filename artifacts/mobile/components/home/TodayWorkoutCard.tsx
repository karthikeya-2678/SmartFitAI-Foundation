import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/home/SkeletonCard';

interface TodayWorkoutData {
  name: string;
  durationMinutes: number;
  exercises: number;
  difficulty: string;
  category: string;
  estimatedCalories?: number;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#22C55E',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

interface TodayWorkoutCardProps {
  workout: TodayWorkoutData | null;
  isLoading: boolean;
  onStart: () => void;
  delay?: number;
}

export function TodayWorkoutCard({ workout, isLoading, onStart, delay = 100 }: TodayWorkoutCardProps) {
  const colors = useColors();
  const btnScale = useSharedValue(1);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handlePressIn = () => {
    btnScale.value = withSpring(0.96);
  };
  const handlePressOut = () => {
    btnScale.value = withSpring(1);
  };

  if (isLoading) {
    return <SkeletonCard rowHeights={[18, 30, 16, 48]} style={{ marginBottom: 28 }} />;
  }

  if (!workout) {
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
        <Card style={[styles.card, { marginBottom: 28 }]}>
          <View style={[styles.restIcon, { backgroundColor: colors.accent + '22' }]}>
            <Feather name="moon" size={28} color={colors.accent} />
          </View>
          <Text style={[styles.restTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Rest Day
          </Text>
          <Text style={[styles.restSub, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            Recovery is part of the process. You've earned it.
          </Text>
        </Card>
      </Animated.View>
    );
  }

  const difficultyKey = workout.difficulty.toLowerCase();
  const diffColor = DIFFICULTY_COLOR[difficultyKey] ?? colors.primary;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <Card style={[styles.card, { marginBottom: 28 }]} variant="elevated">
        {/* Top row: badge + calories */}
        <View style={styles.topRow}>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + '22' }]}>
            <Feather name="zap" size={11} color={diffColor} />
            <Text style={[styles.diffText, { color: diffColor, fontFamily: 'Inter_600SemiBold' }]}>
              {workout.difficulty}
            </Text>
          </View>
          {workout.estimatedCalories ? (
            <Text style={[styles.calsBadge, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              ~{workout.estimatedCalories} kcal
            </Text>
          ) : null}
        </View>

        {/* Name */}
        <Text style={[styles.name, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          {workout.name}
        </Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <MetaItem icon="clock" label={`${workout.durationMinutes} min`} colors={colors} />
          <MetaItem icon="list" label={`${workout.exercises} exercises`} colors={colors} />
          <MetaItem icon="tag" label={workout.category} colors={colors} />
        </View>

        {/* Start button */}
        <Animated.View style={btnStyle}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onStart}
          >
            <Feather name="play" size={16} color={colors.primaryForeground} />
            <Text style={[styles.startText, { color: colors.primaryForeground, fontFamily: 'Inter_700Bold' }]}>
              Start Workout
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Card>
    </Animated.View>
  );
}

function MetaItem({ icon, label, colors }: { icon: string; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon as 'clock'} size={13} color={colors.textSecondary} />
      <Text style={[styles.metaText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  diffText: { fontSize: 11 },
  calsBadge: { fontSize: 12 },
  name: { fontSize: 22 },
  metaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  startText: { fontSize: 15 },
  restIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  restTitle: { fontSize: 20, textAlign: 'center' },
  restSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
