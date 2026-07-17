import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loading';
import type { NutritionMetric } from '@/types/dashboard';

interface NutritionCardProps {
  calories: NutritionMetric;
  protein: NutritionMetric;
  water: NutritionMetric;
  isLoading: boolean;
  onLogWater: () => void;
  delay?: number;
}

export function NutritionCard({
  calories,
  protein,
  water,
  isLoading,
  onLogWater,
  delay = 200,
}: NutritionCardProps) {
  const colors = useColors();

  if (isLoading) {
    return (
      <Card style={{ marginBottom: 20, gap: 14 }}>
        <Skeleton height={14} width="40%" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton height={90} style={{ flex: 1 }} borderRadius={12} />
          <Skeleton height={90} style={{ flex: 1 }} borderRadius={12} />
          <Skeleton height={90} style={{ flex: 1 }} borderRadius={12} />
        </View>
      </Card>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <Card style={{ marginBottom: 20 }}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: 'Inter_600SemiBold' }]}>
          TODAY'S NUTRITION
        </Text>
        <View style={styles.row}>
          <NutritionPill
            icon="zap"
            label="Calories"
            consumed={calories.consumed}
            target={calories.target}
            unit="kcal"
            color={colors.primary}
            colors={colors}
          />
          <NutritionPill
            icon="shield"
            label="Protein"
            consumed={protein.consumed}
            target={protein.target}
            unit="g"
            color={colors.accent}
            colors={colors}
          />
          <WaterPill
            consumed={water.consumed}
            target={water.target}
            color="#3B82F6"
            colors={colors}
            onLog={onLogWater}
          />
        </View>
      </Card>
    </Animated.View>
  );
}

function NutritionPill({
  icon,
  label,
  consumed,
  target,
  unit,
  color,
  colors,
}: {
  icon: string;
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  const pct = Math.min(consumed / target, 1);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%` as `${number}%`,
  }));

  return (
    <View style={[styles.pill, { backgroundColor: colors.surface }]}>
      <View style={[styles.pillIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon as 'zap'} size={14} color={color} />
      </View>
      <Text style={[styles.pillValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        {consumed.toLocaleString()}
      </Text>
      <Text style={[styles.pillUnit, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        / {target.toLocaleString()} {unit}
      </Text>
      <Text style={[styles.pillLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
        {label}
      </Text>
      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.progressFill, barStyle, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function WaterPill({
  consumed,
  target,
  color,
  colors,
  onLog,
}: {
  consumed: number;
  target: number;
  color: string;
  colors: ReturnType<typeof useColors>;
  onLog: () => void;
}) {
  const pct = Math.min(consumed / target, 1);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%` as `${number}%`,
  }));

  const mlLeft = Math.max(0, target - consumed);
  const displayConsumed = consumed >= 1000 ? `${(consumed / 1000).toFixed(1)}L` : `${consumed}ml`;

  return (
    <View style={[styles.pill, { backgroundColor: colors.surface }]}>
      <View style={[styles.pillIcon, { backgroundColor: color + '22' }]}>
        <Feather name="droplet" size={14} color={color} />
      </View>
      <Text style={[styles.pillValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        {displayConsumed}
      </Text>
      <Text style={[styles.pillUnit, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        / {(target / 1000).toFixed(1)}L
      </Text>
      <Text style={[styles.pillLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
        Water
      </Text>
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.progressFill, barStyle, { backgroundColor: color }]} />
      </View>
      {mlLeft > 0 && (
        <TouchableOpacity
          onPress={onLog}
          style={[styles.logBtn, { backgroundColor: color + '22' }]}
          activeOpacity={0.75}
        >
          <Feather name="plus" size={11} color={color} />
          <Text style={[styles.logBtnText, { color: color, fontFamily: 'Inter_600SemiBold' }]}>
            250ml
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 11, letterSpacing: 0.8, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  pill: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    gap: 3,
    alignItems: 'flex-start',
  },
  pillIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pillValue: { fontSize: 15 },
  pillUnit: { fontSize: 9, lineHeight: 12 },
  pillLabel: { fontSize: 10, marginTop: 2 },
  progressBg: { width: '100%', height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  logBtnText: { fontSize: 10 },
});
