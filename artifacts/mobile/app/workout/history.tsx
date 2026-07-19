import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { HistoryCard } from '@/components/workout';
import { useAppStore } from '@/store/useAppStore';
import type { WorkoutLog } from '@/types/fitness';

function groupByDate(logs: WorkoutLog[]): { label: string; logs: WorkoutLog[] }[] {
  const map: Record<string, WorkoutLog[]> = {};
  for (const log of logs) {
    const d = new Date(log.completedAt);
    const key = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!map[key]) map[key] = [];
    map[key].push(log);
  }
  return Object.entries(map).map(([label, logs]) => ({ label, logs }));
}

export default function WorkoutHistoryScreen() {
  const colors = useColors();
  const { workoutLogs } = useAppStore();

  const groups = useMemo(() => groupByDate(workoutLogs), [workoutLogs]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = workoutLogs.filter((l) => new Date(l.completedAt).getTime() > oneWeekAgo);
    const totalMinutes = thisWeek.reduce((s, l) => s + l.durationMinutes, 0);
    const totalSets = thisWeek.reduce((s, l) => s + (l.totalSets ?? 0), 0);
    const totalVol = thisWeek.reduce((s, l) => s + (l.totalVolume ?? 0), 0);
    return { count: thisWeek.length, totalMinutes, totalSets, totalVolume: totalVol };
  }, [workoutLogs]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          Workout History
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Weekly summary */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <View style={[styles.weekCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.weekHeader}>
              <Feather name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.weekTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
                This Week
              </Text>
            </View>
            <View style={styles.weekStats}>
              <WeekStat label="Workouts" value={String(weeklyStats.count)} icon="activity" color={colors.primary} colors={colors} />
              <WeekStat label="Minutes" value={String(weeklyStats.totalMinutes)} icon="clock" color="#8B5CF6" colors={colors} />
              <WeekStat label="Sets" value={String(weeklyStats.totalSets)} icon="repeat" color="#F59E0B" colors={colors} />
              <WeekStat
                label="Volume"
                value={weeklyStats.totalVolume > 0 ? `${Math.round(weeklyStats.totalVolume / 1000)}k` : '0'}
                icon="layers"
                color="#10B981"
                colors={colors}
              />
            </View>
          </View>
        </Animated.View>

        {/* Log groups */}
        {groups.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.emptyWrap}>
            <Feather name="clipboard" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}>
              No workouts yet
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              Complete a workout and it'll show up here.
            </Text>
            <TouchableOpacity
              style={[styles.browseBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={[styles.browseBtnText, { fontFamily: 'Inter_700Bold' }]}>Browse Workouts</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          groups.map((group, gi) => (
            <Animated.View
              key={group.label}
              entering={FadeInDown.delay(80 + gi * 50).duration(350)}
            >
              <Text style={[styles.groupLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                {group.label}
              </Text>
              {group.logs.map((log) => (
                <HistoryCard key={log.id} log={log} />
              ))}
            </Animated.View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekStat({
  label, value, icon, color, colors,
}: {
  label: string; value: string; icon: string; color: string; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.weekStat}>
      <View style={[styles.weekStatIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon as 'clock'} size={14} color={color} />
      </View>
      <Text style={[styles.weekStatValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>{value}</Text>
      <Text style={[styles.weekStatLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  topTitle: { fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  weekCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24, gap: 14 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekTitle: { fontSize: 15 },
  weekStats: { flexDirection: 'row', justifyContent: 'space-between' },
  weekStat: { alignItems: 'center', gap: 6, flex: 1 },
  weekStatIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  weekStatValue: { fontSize: 18 },
  weekStatLabel: { fontSize: 10 },
  groupLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18 },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  browseBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  browseBtnText: { color: '#fff', fontSize: 15 },
});
