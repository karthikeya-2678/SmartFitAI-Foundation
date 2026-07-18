import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { ExerciseCategory } from '@/types/fitness';
import { CATEGORY_CONFIG } from '@/constants/workout';
import { WORKOUTS } from '@/data/workouts';

interface CategoryBannerProps {
  category: ExerciseCategory;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function CategoryBanner({ category, onPress }: CategoryBannerProps) {
  const colors = useColors();
  const cfg = CATEGORY_CONFIG[category];
  const scale = useSharedValue(1);

  const count = WORKOUTS.filter((w) => w.category === category).length;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  }, [scale]);
  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  return (
    <AnimatedTouchable
      style={[styles.container, animStyle]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: cfg.color + '40',
            borderWidth: 1,
          },
        ]}
      >
        {/* Background glow */}
        <View style={[styles.glow, { backgroundColor: cfg.color + '18' }]} />

        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: cfg.color + '25' }]}>
          <Feather name={cfg.icon as 'zap'} size={22} color={cfg.color} />
        </View>

        <Text style={[styles.label, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          {cfg.label}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
          {cfg.description}
        </Text>
        <Text style={[styles.count, { color: cfg.color, fontFamily: 'Inter_600SemiBold' }]}>
          {count} workout{count !== 1 ? 's' : ''}
        </Text>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: { width: 150, marginRight: 12 },
  card: {
    borderRadius: 14,
    padding: 14,
    overflow: 'hidden',
    gap: 6,
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: { fontSize: 15 },
  description: { fontSize: 11, lineHeight: 15 },
  count: { fontSize: 12, marginTop: 4 },
});
