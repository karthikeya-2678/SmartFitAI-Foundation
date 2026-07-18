import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Workout } from '@/types/fitness';
import { CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '@/constants/workout';

interface WorkoutCardProps {
  workout: Workout;
  isFavorite?: boolean;
  onPress: () => void;
  onToggleFavorite?: (id: string) => void;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function WorkoutCard({
  workout,
  isFavorite = false,
  onPress,
  onToggleFavorite,
  index = 0,
}: WorkoutCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const catCfg = CATEGORY_CONFIG[workout.category];
  const diffCfg = DIFFICULTY_CONFIG[workout.difficulty];

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handleFavorite = useCallback(() => {
    heartScale.value = withSpring(1.3, { damping: 10, stiffness: 300 }, () => {
      heartScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    onToggleFavorite?.(workout.id);
  }, [heartScale, onToggleFavorite, workout.id]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const totalSets = workout.exercises.reduce((sum, we) => sum + we.sets.length, 0);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <AnimatedTouchable
        style={[animStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Category accent bar */}
          <View style={[styles.accentBar, { backgroundColor: catCfg.color }]} />

          {/* Header row */}
          <View style={styles.header}>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: catCfg.bg }]}>
                <Feather name={catCfg.icon as 'zap'} size={11} color={catCfg.color} />
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

            {onToggleFavorite && (
              <AnimatedTouchable
                style={[styles.heartBtn, heartStyle]}
                onPress={handleFavorite}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Feather
                  name={isFavorite ? 'heart' : 'heart'}
                  size={20}
                  color={isFavorite ? '#EF4444' : colors.mutedForeground}
                />
              </AnimatedTouchable>
            )}
          </View>

          {/* Title */}
          <Text style={[styles.name, { color: colors.text, fontFamily: 'Inter_700Bold' }]} numberOfLines={2}>
            {workout.name}
          </Text>

          {workout.description ? (
            <Text style={[styles.description, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>
              {workout.description}
            </Text>
          ) : null}

          {/* Meta row */}
          <View style={styles.meta}>
            <MetaItem icon="clock" label={`${workout.durationMinutes} min`} colors={colors} />
            <MetaItem icon="layers" label={`${workout.exercises.length} exercises`} colors={colors} />
            <MetaItem icon="repeat" label={`${totalSets} sets`} colors={colors} />
            {workout.estimatedCalories ? (
              <MetaItem icon="zap" label={`${workout.estimatedCalories} kcal`} colors={colors} />
            ) : null}
          </View>

          {/* CTA */}
          <View style={[styles.cta, { backgroundColor: catCfg.color, borderRadius: colors.radius - 4 }]}>
            <Text style={[styles.ctaText, { fontFamily: 'Inter_700Bold' }]}>Start Workout</Text>
            <Feather name="arrow-right" size={15} color="#fff" />
          </View>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
}

function MetaItem({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon as 'clock'} size={12} color={colors.mutedForeground} />
      <Text style={[styles.metaText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  accentBar: { height: 3, width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingHorizontal: 16,
  },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11 },
  heartBtn: { padding: 4 },
  name: { fontSize: 20, paddingHorizontal: 16, marginTop: 10 },
  description: { fontSize: 13, lineHeight: 18, paddingHorizontal: 16, marginTop: 5 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 16, marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    paddingVertical: 12,
  },
  ctaText: { color: '#fff', fontSize: 14 },
});
