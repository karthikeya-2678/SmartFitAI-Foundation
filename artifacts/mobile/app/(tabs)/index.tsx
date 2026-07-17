import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAppStore } from '@/store/useAppStore';
import { useDashboardStore } from '@/store/useDashboardStore';

import {
  GreetingHeader,
  TodayWorkoutCard,
  NutritionCard,
  MetricsRow,
  AIRecommendationCard,
  UpcomingWorkoutCard,
  QuickActionsCard,
  RecentActivityCard,
  NotificationsCard,
  WeeklyProgressCard,
} from '@/components/home';

// ─── Today's Workout ─────────────────────────────────────────────────────────
// In a real app this comes from the API (e.g. a scheduled plan).
// We derive it from a rotating schedule so it changes daily.
const SCHEDULED_WORKOUTS = [
  { name: 'Upper Body Strength', durationMinutes: 45, exercises: 8, difficulty: 'Intermediate', category: 'strength', estimatedCalories: 320 },
  { name: 'HIIT Cardio Blast', durationMinutes: 30, exercises: 6, difficulty: 'Advanced', category: 'hiit', estimatedCalories: 450 },
  null, // rest day
  { name: 'Lower Body Power', durationMinutes: 55, exercises: 10, difficulty: 'Intermediate', category: 'strength', estimatedCalories: 380 },
  { name: 'Core & Mobility', durationMinutes: 25, exercises: 7, difficulty: 'Beginner', category: 'core', estimatedCalories: 180 },
  { name: 'Full Body Burn', durationMinutes: 40, exercises: 9, difficulty: 'Intermediate', category: 'hiit', estimatedCalories: 410 },
  null, // rest day
] as const;

function getTodayWorkout() {
  const jsDay = new Date().getDay(); // 0=Sun…6=Sat
  // Rotate Mon–Sun to index 0–6
  const idx = jsDay === 0 ? 6 : jsDay - 1;
  return SCHEDULED_WORKOUTS[idx] ?? null;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAppStore((s) => s.user);

  const { isLoading, data, recentActivity, loadDashboard, logWater, markNotificationRead, markAllNotificationsRead } =
    useDashboardStore();

  const [refreshing, setRefreshing] = useState(false);
  const todayWorkout = getTodayWorkout();

  // Initial load
  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  const handleStartWorkout = useCallback(() => {
    // Navigate to workout start screen — stub for now
    Alert.alert('Starting Workout', `Get ready for ${todayWorkout?.name ?? 'your workout'}!`);
  }, [todayWorkout]);

  const handleLogWater = useCallback(() => {
    logWater(250);
  }, [logWater]);

  const unreadCount = data?.notifications.filter((n) => !n.isRead).length ?? 0;

  const quickActions = [
    { id: 'log', label: 'Log\nWorkout', icon: 'plus-circle', color: colors.primary, onPress: () => Alert.alert('Log Workout') },
    { id: 'water', label: 'Log\nWater', icon: 'droplet', color: '#3B82F6', onPress: handleLogWater },
    { id: 'measure', label: 'Log\nWeight', icon: 'trending-down', color: colors.accent, onPress: () => Alert.alert('Log Weight') },
    { id: 'ai', label: 'AI\nCoach', icon: 'cpu', color: '#8B5CF6', onPress: () => Alert.alert('AI Coach') },
  ] as const;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Greeting + Avatar + Notifications ─── */}
        <GreetingHeader
          user={user}
          membership={data?.membership ?? 'free'}
          unreadCount={unreadCount}
          onNotificationPress={() => {}}
          onAvatarPress={() => router.push('/(tabs)/profile')}
        />

        {/* ── Today's Workout ─── */}
        <SectionTitle title="Today's Plan" colors={colors} />
        <TodayWorkoutCard
          workout={todayWorkout}
          isLoading={false}
          onStart={handleStartWorkout}
          delay={80}
        />

        {/* ── Nutrition ─── */}
        {data ? (
          <NutritionCard
            calories={data.calories}
            protein={data.protein}
            water={data.water}
            isLoading={isLoading}
            onLogWater={handleLogWater}
            delay={160}
          />
        ) : (
          <NutritionCard
            calories={{ consumed: 0, target: 2100 }}
            protein={{ consumed: 0, target: 150 }}
            water={{ consumed: 0, target: 2500 }}
            isLoading={isLoading}
            onLogWater={handleLogWater}
            delay={160}
          />
        )}

        {/* ── Streak / BMI / Weight ─── */}
        <MetricsRow
          streak={data?.streak ?? 0}
          longestStreak={data?.longestStreak ?? 0}
          bmi={data?.bmi ?? null}
          weight={data?.weight ?? user?.weight ?? null}
          isLoading={isLoading}
          delay={240}
        />

        {/* ── Weekly Progress ─── */}
        <WeeklyProgressCard
          weeklyActivity={data?.weeklyActivity ?? [0, 0, 0, 0, 0, 0, 0]}
          totalMinutes={data?.totalWeeklyMinutes ?? 0}
          totalCalories={data?.totalWeeklyCalories ?? 0}
          isLoading={isLoading}
          delay={300}
        />

        {/* ── AI Recommendation ─── */}
        <AIRecommendationCard
          recommendation={data?.aiRecommendation ?? null}
          isLoading={isLoading}
          delay={360}
        />

        {/* ── Upcoming Workout ─── */}
        <UpcomingWorkoutCard
          workout={data?.upcomingWorkout ?? null}
          isLoading={isLoading}
          onPress={() => router.push('/(tabs)/workouts')}
          delay={420}
        />

        {/* ── Quick Actions ─── */}
        <QuickActionsCard
          actions={quickActions as unknown as Array<{ id: string; label: string; icon: string; color: string; onPress: () => void }>}
          delay={480}
        />

        {/* ── Recent Activity ─── */}
        <RecentActivityCard
          logs={recentActivity}
          isLoading={isLoading}
          onSeeAll={() => router.push('/(tabs)/workouts')}
          delay={540}
        />

        {/* ── Notifications ─── */}
        {data && (
          <NotificationsCard
            notifications={data.notifications}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
            delay={600}
          />
        )}
      </ScrollView>
    </Animated.View>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

function SectionTitle({ title, colors }: { title: string; colors: ReturnType<typeof useColors> }) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 14 },
});
