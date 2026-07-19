import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ExerciseListItem } from '@/components/workout';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { getWorkoutById } from '@/data/workouts';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '@/constants/workout';

export default function WorkoutDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggleFavorite, startSession } = useWorkoutStore();

  const workout = getWorkoutById(id ?? '');
  const fav = isFavorite(id ?? '');
  const heartScale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
  const startStyle = useAnimatedStyle(() => ({ transform: [{ scale: startScale.value }] }));

  const handleToggleFavorite = useCallback(() => {
    heartScale.value = withSpring(1.3, { damping: 8, stiffness: 300 }, () => {
      heartScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    if (id) toggleFavorite(id);
  }, [id, toggleFavorite, heartScale]);

  const handleStart = useCallback(() => {
    if (!workout) return;
    startScale.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      startScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    startSession(workout);
    router.push('/workout/active');
  }, [workout, startSession, startScale]);

  if (!workout) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            Workout not found.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const catCfg = CATEGORY_CONFIG[workout.category];
  const diffCfg = DIFFICULTY_CONFIG[workout.difficulty];
  const totalSets = workout.exercises.reduce((s, we) => s + we.sets.length, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Custom header */}
      <View style={[styles.topBar]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <Animated.View style={heartStyle}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Feather name="heart" size={20} color={fav ? '#EF4444' : colors.mutedForeground} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero block */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.hero, { backgroundColor: catCfg.color + '18', borderColor: catCfg.color + '40', borderWidth: 1 }]}>
            <View style={[styles.heroIcon, { backgroundColor: catCfg.color + '25' }]}>
              <Feather name={catCfg.icon as 'zap'} size={32} color={catCfg.color} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              {workout.name}
            </Text>
            {workout.description ? (
              <Text style={[styles.heroDesc, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                {workout.description}
              </Text>
            ) : null}

            {/* Badges */}
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: catCfg.color + '25' }]}>
                <Feather name={catCfg.icon as 'zap'} size={12} color={catCfg.color} />
                <Text style={[styles.badgeText, { color: catCfg.color, fontFamily: 'Inter_600SemiBold' }]}>
                  {catCfg.label}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: diffCfg.color + '20' }]}>
                <Text style={[styles.badgeText, { color: diffCfg.color, fontFamily: 'Inter_600SemiBold' }]}>
                  {diffCfg.label}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stats strip */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <View style={[styles.statsStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <StatItem icon="clock" label="Duration" value={`${workout.durationMinutes} min`} colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatItem icon="layers" label="Exercises" value={String(workout.exercises.length)} colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatItem icon="repeat" label="Total Sets" value={String(totalSets)} colors={colors} />
            {workout.estimatedCalories ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <StatItem icon="zap" label="Est. kcal" value={String(workout.estimatedCalories)} colors={colors} />
              </>
            ) : null}
          </View>
        </Animated.View>

        {/* Exercise list */}
        <Animated.View entering={FadeInDown.delay(140).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Exercises
          </Text>
          <View style={[styles.exerciseList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {workout.exercises.map((we, i) => {
              const s = we.sets[0];
              let label = `${we.sets.length} sets`;
              if (s?.duration) label = `${we.sets.length} × ${s.duration}s`;
              else if (s?.reps) label = `${we.sets.length} × ${s.reps}`;

              return (
                <ExerciseListItem
                  key={we.id}
                  exercise={we.exercise}
                  setsLabel={label}
                  isLast={i === workout.exercises.length - 1}
                  onPress={() => router.push(`/exercise/${we.exercise.id}`)}
                />
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating start button */}
      <View style={[styles.ctaWrap, { backgroundColor: colors.background }]}>
        <Animated.View style={startStyle}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: catCfg.color }]}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Feather name="play" size={20} color="#fff" />
            <Text style={[styles.startBtnText, { fontFamily: 'Inter_700Bold' }]}>
              Start Workout
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function StatItem({
  icon, label, value, colors,
}: {
  icon: string; label: string; value: string; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon as 'clock'} size={14} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 15 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  scroll: { paddingHorizontal: 20 },
  hero: { borderRadius: 16, padding: 24, alignItems: 'center', gap: 10, marginBottom: 16 },
  heroIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 26, textAlign: 'center' },
  heroDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  badges: { flexDirection: 'row', gap: 10, marginTop: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12 },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 11 },
  divider: { width: 1, height: 40 },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  exerciseList: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14 },
  ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32 },
  startBtn: { borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  startBtnText: { color: '#fff', fontSize: 17 },
});
