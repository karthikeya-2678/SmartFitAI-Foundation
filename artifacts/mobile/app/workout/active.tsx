import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { SetRow, RestTimer, WorkoutTimer } from '@/components/workout';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_CONFIG } from '@/constants/workout';

export default function ActiveWorkoutScreen() {
  const colors = useColors();
  const {
    session,
    nextExercise,
    prevExercise,
    completeSet,
    stopRest,
    getLoggedSet,
    getCompletedSetsCount,
    getTotalCompletedSets,
  } = useWorkoutStore();
  const { workoutLogs } = useAppStore();

  // Cache session on mount so we still have it after endSession is called
  const [cachedSession] = useState(() => session);

  useEffect(() => {
    if (!session) {
      router.replace('/(tabs)/workouts' as any);
    }
  }, []);

  const handleFinish = useCallback(() => {
    Alert.alert(
      'Finish Workout?',
      'End the session and save your progress.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: () => router.push('/workout/complete'),
        },
      ],
    );
  }, []);

  const handleQuit = useCallback(() => {
    Alert.alert(
      'Quit Workout?',
      'Your progress will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            useWorkoutStore.getState().endSession();
            router.replace('/(tabs)/workouts' as any);
          },
        },
      ],
    );
  }, []);

  const activeSession = session ?? cachedSession;
  if (!activeSession) return null;

  const { workout, currentExerciseIndex, startedAt, isResting, restDuration } = activeSession;
  const currentWE = workout.exercises[currentExerciseIndex];
  const catCfg = CATEGORY_CONFIG[workout.category];
  const isFirst = currentExerciseIndex === 0;
  const isLast = currentExerciseIndex === workout.exercises.length - 1;
  const completedSets = getCompletedSetsCount(currentWE.id);
  const totalSetsForExercise = currentWE.sets.length;
  const exerciseDone = completedSets >= totalSetsForExercise;

  // Determine if sets are time-based
  const isTimeBased = !!(currentWE.sets[0]?.duration && !currentWE.sets[0]?.reps);

  // Previous performance from logs for this exercise
  function getPreviousLabel(setIndex: number): string | undefined {
    for (const log of workoutLogs) {
      if (!log.exercises) continue;
      const matchingEx = log.exercises.find((e) => e.exerciseId === currentWE.exercise.id);
      if (matchingEx?.sets?.[setIndex]) {
        const s = matchingEx.sets[setIndex];
        if (s.reps && s.weight) return `${s.reps} × ${s.weight}kg`;
        if (s.reps) return `${s.reps} reps`;
        if (s.duration) return `${s.duration}s`;
      }
    }
    return undefined;
  }

  const handleSetComplete = (setIndex: number, reps: number, weight: number) => {
    const restTime = currentWE.sets[setIndex]?.restTime ?? 90;
    completeSet(currentWE.id, setIndex, reps, weight, restTime);
  };

  const handleRestComplete = () => stopRest();
  const handleRestSkip = () => stopRest();

  const totalSets = workout.exercises.reduce((s, we) => s + we.sets.length, 0);
  const totalCompleted = getTotalCompletedSets();
  const overallProgress = totalSets > 0 ? totalCompleted / totalSets : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top bar */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.topBar}>
        <TouchableOpacity
          onPress={handleQuit}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        <View style={styles.topCenter}>
          <Text style={[styles.workoutName, { color: colors.text, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
            {workout.name}
          </Text>
          <WorkoutTimer startedAt={startedAt} paused={isResting} />
        </View>

        <TouchableOpacity
          onPress={handleFinish}
          style={[styles.finishBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.finishText, { fontFamily: 'Inter_700Bold' }]}>Finish</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: catCfg.color, width: `${overallProgress * 100}%` }]}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Exercise nav */}
        <Animated.View entering={FadeInDown.duration(350)} style={styles.exNav}>
          <TouchableOpacity
            onPress={prevExercise}
            disabled={isFirst}
            style={[styles.navBtn, { opacity: isFirst ? 0.3 : 1 }]}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.exInfo}>
            <Text style={[styles.exCounter, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
            </Text>
            <Text style={[styles.exName, { color: colors.text, fontFamily: 'Inter_700Bold' }]} numberOfLines={2}>
              {currentWE.exercise.name}
            </Text>
            {currentWE.notes ? (
              <Text style={[styles.exNotes, { color: colors.primary, fontFamily: 'Inter_400Regular' }]}>
                💡 {currentWE.notes}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => nextExercise()}
            disabled={isLast && !exerciseDone}
            style={[styles.navBtn, { opacity: isLast ? 0.3 : 1 }]}
            activeOpacity={0.7}
          >
            <Feather name="chevron-right" size={22} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Sets table */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thNum, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>SET</Text>
            <Text style={[styles.thPrev, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>PREV</Text>
            {isTimeBased ? (
              <Text style={[styles.thInput, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>SEC</Text>
            ) : (
              <>
                <Text style={[styles.thInput, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>KG</Text>
                <Text style={[styles.thInput, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>REPS</Text>
              </>
            )}
            <Text style={[styles.thCheck, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>✓</Text>
          </View>

          <View style={[styles.setsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {currentWE.sets.map((set, i) => {
              const logged = getLoggedSet(currentWE.id, i);
              return (
                <SetRow
                  key={`${currentWE.id}-${i}`}
                  setNumber={i + 1}
                  previousLabel={getPreviousLabel(i)}
                  initialReps={set.reps ?? 10}
                  initialWeight={set.weight ?? 0}
                  initialDuration={set.duration}
                  isTimeBased={isTimeBased}
                  completed={logged?.completed ?? false}
                  onComplete={(reps, weight) => handleSetComplete(i, reps, weight)}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Next exercise button */}
        {exerciseDone && !isLast && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.nextBtnWrap}>
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: catCfg.color }]}
              onPress={() => nextExercise()}
              activeOpacity={0.8}
            >
              <Text style={[styles.nextBtnText, { fontFamily: 'Inter_700Bold' }]}>
                Next Exercise
              </Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {exerciseDone && isLast && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.nextBtnWrap}>
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/workout/complete')}
              activeOpacity={0.8}
            >
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={[styles.nextBtnText, { fontFamily: 'Inter_700Bold' }]}>
                Complete Workout
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Rest Timer overlay */}
      <RestTimer
        visible={isResting}
        duration={restDuration}
        onComplete={handleRestComplete}
        onSkip={handleRestSkip}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  topCenter: { flex: 1, alignItems: 'center', gap: 2 },
  workoutName: { fontSize: 14 },
  finishBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  finishText: { color: '#fff', fontSize: 13 },
  progressTrack: { height: 3, marginHorizontal: 16, borderRadius: 2, marginBottom: 4 },
  progressFill: { height: 3, borderRadius: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 12 },
  exNav: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  exInfo: { flex: 1, alignItems: 'center', gap: 4 },
  exCounter: { fontSize: 12 },
  exName: { fontSize: 22, textAlign: 'center' },
  exNotes: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, marginBottom: 8, gap: 8 },
  thNum: { width: 24, fontSize: 11, textAlign: 'center' },
  thPrev: { flex: 1, fontSize: 11, textAlign: 'center' },
  thInput: { width: 79, fontSize: 11, textAlign: 'center' },
  thCheck: { width: 34, fontSize: 11, textAlign: 'center' },
  setsContainer: { borderRadius: 14, borderWidth: 1, padding: 10 },
  nextBtnWrap: { marginTop: 24 },
  nextBtn: { borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  nextBtnText: { color: '#fff', fontSize: 16 },
});
