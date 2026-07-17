import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loading';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface WeeklyProgressCardProps {
  weeklyActivity: number[]; // 0-1 per day Mon-Sun
  totalMinutes: number;
  totalCalories: number;
  isLoading: boolean;
  delay?: number;
}

interface AnimatedBarProps {
  level: number;
  isToday: boolean;
  isPast: boolean;
  day: string;
  colors: ReturnType<typeof useColors>;
  animDelay: number;
}

function AnimatedBar({ level, isToday, isPast, day, colors, animDelay }: AnimatedBarProps) {
  const fillFlex = useSharedValue(0.001);

  useEffect(() => {
    fillFlex.value = withTiming(level || 0.001, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [level]);

  const fillStyle = useAnimatedStyle(() => ({ flex: fillFlex.value }));

  const barColor = isToday
    ? colors.primary
    : isPast && level > 0
    ? colors.accent
    : colors.border;

  return (
    <View style={styles.barCol}>
      <View style={[styles.barBg, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1 - (level || 0.001) }} />
        <Animated.View
          style={[
            fillStyle,
            {
              width: '100%',
              borderRadius: 5,
              backgroundColor: barColor,
              opacity: level > 0 ? 1 : 0.25,
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.barDay,
          {
            color: isToday ? colors.primary : colors.mutedForeground,
            fontFamily: isToday ? 'Inter_700Bold' : 'Inter_500Medium',
          },
        ]}
      >
        {day}
      </Text>
    </View>
  );
}

export function WeeklyProgressCard({
  weeklyActivity,
  totalMinutes,
  totalCalories,
  isLoading,
  delay = 250,
}: WeeklyProgressCardProps) {
  const colors = useColors();

  // Mon=0 … Sun=6; JS getDay() Sun=0
  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  if (isLoading) {
    return (
      <Card style={{ marginBottom: 20, gap: 14 }}>
        <Skeleton height={14} width="35%" />
        <View style={{ flexDirection: 'row', gap: 8, height: 72 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} style={{ flex: 1 }} height={72} borderRadius={5} />
          ))}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Skeleton height={30} style={{ flex: 1 }} borderRadius={8} />
          <Skeleton height={30} style={{ flex: 1, marginLeft: 16 }} borderRadius={8} />
        </View>
      </Card>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <Card style={{ marginBottom: 20, gap: 14 }}>
        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter_600SemiBold' }]}>
          THIS WEEK
        </Text>

        {/* Bar chart */}
        <View style={styles.barChart}>
          {DAY_LABELS.map((day, i) => (
            <AnimatedBar
              key={i}
              level={weeklyActivity[i] ?? 0}
              isToday={i === todayIdx}
              isPast={i < todayIdx}
              day={day}
              colors={colors}
              animDelay={delay + i * 60}
            />
          ))}
        </View>

        {/* Summary stats */}
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              {totalMinutes}
              <Text style={[styles.statUnit, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}> min</Text>
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              Active time
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              {totalCalories.toLocaleString()}
              <Text style={[styles.statUnit, { color: colors.accent, fontFamily: 'Inter_500Medium' }]}> kcal</Text>
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              Burned
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, letterSpacing: 0.8 },
  barChart: { flexDirection: 'row', gap: 8, height: 80 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barBg: { flex: 1, width: '100%', borderRadius: 5, overflow: 'hidden' },
  barDay: { fontSize: 11 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statVal: { fontSize: 20 },
  statUnit: { fontSize: 13 },
  statLabel: { fontSize: 12 },
  divider: { width: 1, height: 36, marginHorizontal: 8 },
});
