import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { exerciseService } from '@/services/exercises';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG, MUSCLE_LABELS, EQUIPMENT_LABELS } from '@/constants/workout';

export default function ExerciseDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const exercise = exerciseService.getLocalById(id ?? '');

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[{ color: colors.textSecondary, fontFamily: 'Inter_400Regular', fontSize: 15 }]}>
            Exercise not found.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const catCfg = CATEGORY_CONFIG[exercise.category];
  const diffCfg = DIFFICULTY_CONFIG[exercise.difficulty];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.text, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
          Exercise
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <View style={[styles.hero, { backgroundColor: catCfg.color + '15', borderColor: catCfg.color + '35', borderWidth: 1 }]}>
            <View style={[styles.heroIcon, { backgroundColor: catCfg.color + '25' }]}>
              <Feather name={catCfg.icon as 'zap'} size={34} color={catCfg.color} />
            </View>
            <Text style={[styles.name, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              {exercise.name}
            </Text>
            {exercise.description ? (
              <Text style={[styles.desc, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                {exercise.description}
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

        {/* Muscle groups */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Muscle Groups
          </Text>
          <View style={styles.chips}>
            {exercise.muscleGroups.map((m) => (
              <View key={m} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="target" size={12} color={colors.primary} />
                <Text style={[styles.chipText, { color: colors.text, fontFamily: 'Inter_500Medium' }]}>
                  {MUSCLE_LABELS[m]}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Equipment */}
        <Animated.View entering={FadeInDown.delay(130).duration(350)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Equipment
          </Text>
          <View style={styles.chips}>
            {exercise.equipment.map((eq) => (
              <View key={eq} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="tool" size={12} color={colors.secondary} />
                <Text style={[styles.chipText, { color: colors.text, fontFamily: 'Inter_500Medium' }]}>
                  {EQUIPMENT_LABELS[eq]}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(350)}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              How To Do It
            </Text>
            <View style={[styles.instructionList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {exercise.instructions.map((step, i) => (
                <View
                  key={i}
                  style={[
                    styles.step,
                    i < exercise.instructions!.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={[styles.stepNum, { backgroundColor: catCfg.color + '20' }]}>
                    <Text style={[styles.stepNumText, { color: catCfg.color, fontFamily: 'Inter_700Bold' }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.text, fontFamily: 'Inter_400Regular' }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  topTitle: { fontSize: 15 },
  scroll: { paddingHorizontal: 20 },
  hero: { borderRadius: 16, padding: 24, alignItems: 'center', gap: 10, marginBottom: 24 },
  heroIcon: { width: 68, height: 68, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 24, textAlign: 'center' },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  badges: { flexDirection: 'row', gap: 10, marginTop: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13 },
  instructionList: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14 },
  step: { flexDirection: 'row', gap: 14, paddingVertical: 14, alignItems: 'flex-start' },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 22 },
});
