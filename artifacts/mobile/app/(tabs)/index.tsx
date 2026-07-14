import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useAppStore } from '@/store/useAppStore';
import { formatCalories } from '@/utils/format';

const TODAY_WORKOUT = {
  name: 'Upper Body Strength',
  duration: 45,
  exercises: 8,
  difficulty: 'Intermediate',
};

const WEEKLY_STATS = {
  calories: 2840,
  workouts: 4,
  streak: 7,
  minutes: 180,
};

const RECENT_WORKOUTS = [
  { id: '1', name: 'HIIT Cardio', duration: 30, calories: 380, date: '2 hours ago' },
  { id: '2', name: 'Leg Day', duration: 55, calories: 420, date: 'Yesterday' },
  { id: '3', name: 'Core & Abs', duration: 25, calories: 210, date: '2 days ago' },
];

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEK_LEVELS = [0.8, 0.0, 1.0, 0.6, 0.4, 0.0, 0.0];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Day index: Mon=0 … Sun=6
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text
            style={[styles.greeting, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}
          >
            {greeting},
          </Text>
          <Text style={[styles.userName, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            {user?.name ?? 'Athlete'} 💪
          </Text>
        </View>
        <TouchableOpacity>
          <Avatar name={user?.name ?? 'A'} size="md" />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard icon="zap" label="Calories" value={formatCalories(WEEKLY_STATS.calories)} accent={colors.primary} colors={colors} />
        <StatCard icon="activity" label="Workouts" value={`${WEEKLY_STATS.workouts}`} accent={colors.accent} colors={colors} />
        <StatCard icon="award" label="Streak" value={`${WEEKLY_STATS.streak}d`} accent="#F59E0B" colors={colors} />
      </View>

      {/* Today's Plan */}
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        Today's Plan
      </Text>
      <Card style={styles.todayCard} variant="elevated">
        <View style={[styles.diffBadge, { backgroundColor: colors.primary + '22' }]}>
          <Feather name="zap" size={11} color={colors.primary} />
          <Text
            style={[styles.diffText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}
          >
            {TODAY_WORKOUT.difficulty}
          </Text>
        </View>
        <Text style={[styles.workoutName, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          {TODAY_WORKOUT.name}
        </Text>
        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={colors.textSecondary} />
            <Text
              style={[styles.metaText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}
            >
              {TODAY_WORKOUT.duration} min
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="list" size={14} color={colors.textSecondary} />
            <Text
              style={[styles.metaText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}
            >
              {TODAY_WORKOUT.exercises} exercises
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          activeOpacity={0.85}
        >
          <Feather name="play" size={16} color={colors.primaryForeground} />
          <Text
            style={[
              styles.startBtnText,
              { color: colors.primaryForeground, fontFamily: 'Inter_700Bold' },
            ]}
          >
            Start Workout
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Weekly Progress */}
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        This Week
      </Text>
      <Card style={styles.weekCard}>
        {/* Bar chart */}
        <View style={styles.barChart}>
          {WEEK_DAYS.map((day, i) => (
            <View key={i} style={styles.barCol}>
              <View style={[styles.barBg, { backgroundColor: colors.background }]}>
                <View style={{ flex: 1 - (WEEK_LEVELS[i] || 0.001) }} />
                <View
                  style={[
                    styles.barFill,
                    {
                      flex: WEEK_LEVELS[i] || 0.001,
                      backgroundColor:
                        i === todayIdx
                          ? colors.primary
                          : i < todayIdx && WEEK_LEVELS[i] > 0
                            ? colors.accent
                            : colors.border,
                      opacity: WEEK_LEVELS[i] > 0 ? 1 : 0.3,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barDay,
                  {
                    color: i === todayIdx ? colors.primary : colors.mutedForeground,
                    fontFamily: 'Inter_500Medium',
                  },
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Stat row */}
        <View style={styles.weekStatRow}>
          <WeekStat label="Active min" value={`${WEEKLY_STATS.minutes}`} unit="min" colors={colors} />
          <View style={[styles.weekDivider, { backgroundColor: colors.border }]} />
          <WeekStat label="Burned" value={formatCalories(WEEKLY_STATS.calories)} unit="kcal" colors={colors} />
        </View>
      </Card>

      {/* Recent Workouts */}
      <View style={styles.recentHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, fontFamily: 'Inter_700Bold', marginBottom: 0 },
          ]}
        >
          Recent
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      {RECENT_WORKOUTS.map((w) => (
        <TouchableOpacity key={w.id} activeOpacity={0.8} style={styles.recentTouch}>
          <Card style={styles.recentCard}>
            <View style={[styles.recentIcon, { backgroundColor: colors.primary + '22' }]}>
              <Feather name="activity" size={20} color={colors.primary} />
            </View>
            <View style={styles.recentInfo}>
              <Text
                style={[styles.recentName, { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}
              >
                {w.name}
              </Text>
              <Text
                style={[
                  styles.recentMeta,
                  { color: colors.textSecondary, fontFamily: 'Inter_400Regular' },
                ]}
              >
                {w.duration} min · {w.calories} kcal
              </Text>
            </View>
            <Text
              style={[
                styles.recentDate,
                { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
              ]}
            >
              {w.date}
            </Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: accent + '22' }]}>
        <Feather name={icon as 'zap'} size={18} color={accent} />
      </View>
      <Text style={[styles.statValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
        {label}
      </Text>
    </Card>
  );
}

function WeekStat({
  label,
  value,
  unit,
  colors,
}: {
  label: string;
  value: string;
  unit: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.weekStatItem}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
        <Text style={[styles.weekValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          {value}
        </Text>
        <Text style={[styles.weekUnit, { color: colors.accent, fontFamily: 'Inter_500Medium' }]}>
          {unit}
        </Text>
      </View>
      <Text style={[styles.weekLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 14 },
  userName: { fontSize: 24, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, gap: 8, padding: 14, alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
  sectionTitle: { fontSize: 18, marginBottom: 14 },
  todayCard: { marginBottom: 28, gap: 12 },
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
  workoutName: { fontSize: 22 },
  workoutMeta: { flexDirection: 'row', gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  startBtnText: { fontSize: 15 },
  weekCard: { marginBottom: 28, gap: 16 },
  barChart: { flexDirection: 'row', gap: 8, height: 72 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barBg: { flex: 1, width: '100%', borderRadius: 5, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 5 },
  barDay: { fontSize: 11 },
  weekStatRow: { flexDirection: 'row' },
  weekStatItem: { flex: 1, alignItems: 'center', gap: 4 },
  weekValue: { fontSize: 20 },
  weekUnit: { fontSize: 13 },
  weekLabel: { fontSize: 12 },
  weekDivider: { width: 1, marginVertical: 4 },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAll: { fontSize: 14 },
  recentTouch: { marginBottom: 10 },
  recentCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  recentIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1, gap: 4 },
  recentName: { fontSize: 15 },
  recentMeta: { fontSize: 13 },
  recentDate: { fontSize: 12 },
});
