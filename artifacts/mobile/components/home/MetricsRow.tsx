import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loading';

interface MetricsRowProps {
  streak: number;
  longestStreak: number;
  bmi: number | null;
  weight: number | null;
  isLoading: boolean;
  delay?: number;
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6' };
  if (bmi < 25) return { label: 'Normal', color: '#22C55E' };
  if (bmi < 30) return { label: 'Overweight', color: '#F59E0B' };
  return { label: 'Obese', color: '#EF4444' };
}

export function MetricsRow({ streak, longestStreak, bmi, weight, isLoading, delay = 300 }: MetricsRowProps) {
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={styles.row}>
        <Skeleton height={90} style={{ flex: 1 }} borderRadius={12} />
        <Skeleton height={90} style={{ flex: 1 }} borderRadius={12} />
        <Skeleton height={90} style={{ flex: 1 }} borderRadius={12} />
      </View>
    );
  }

  const bmiInfo = bmi ? bmiCategory(bmi) : null;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={styles.row}>
      {/* Streak */}
      <Card style={styles.metricCard}>
        <View style={[styles.iconWrap, { backgroundColor: '#F59E0B22' }]}>
          <Feather name="zap" size={16} color="#F59E0B" />
        </View>
        <Text style={[styles.value, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          {streak}
          <Text style={[styles.unit, { color: '#F59E0B', fontFamily: 'Inter_500Medium' }]}> d</Text>
        </Text>
        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
          Streak
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Best: {longestStreak}d
        </Text>
      </Card>

      {/* BMI */}
      <Card style={styles.metricCard}>
        <View style={[styles.iconWrap, { backgroundColor: (bmiInfo?.color ?? colors.primary) + '22' }]}>
          <Feather name="activity" size={16} color={bmiInfo?.color ?? colors.primary} />
        </View>
        {bmi ? (
          <>
            <Text style={[styles.value, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              {bmi}
            </Text>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              BMI
            </Text>
            <Text style={[styles.sub, { color: bmiInfo?.color, fontFamily: 'Inter_500Medium' }]}>
              {bmiInfo?.label}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.value, { color: colors.mutedForeground, fontFamily: 'Inter_700Bold' }]}>
              —
            </Text>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              BMI
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Add height & weight
            </Text>
          </>
        )}
      </Card>

      {/* Weight */}
      <Card style={styles.metricCard}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accent + '22' }]}>
          <Feather name="trending-down" size={16} color={colors.accent} />
        </View>
        {weight ? (
          <>
            <Text style={[styles.value, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              {weight}
              <Text style={[styles.unit, { color: colors.accent, fontFamily: 'Inter_500Medium' }]}> kg</Text>
            </Text>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              Weight
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.value, { color: colors.mutedForeground, fontFamily: 'Inter_700Bold' }]}>
              —
            </Text>
            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              Weight
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Log weight
            </Text>
          </>
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: { flex: 1, gap: 3, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'flex-start' },
  iconWrap: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  value: { fontSize: 18 },
  unit: { fontSize: 12 },
  label: { fontSize: 11 },
  sub: { fontSize: 10 },
});
