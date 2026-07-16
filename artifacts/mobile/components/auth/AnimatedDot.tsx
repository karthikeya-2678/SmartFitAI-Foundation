import React from 'react';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

interface AnimatedDotProps {
  index: number;
  scrollX: SharedValue<number>;
  screenWidth: number;
  activeColor: string;
}

export function AnimatedDot({ index, scrollX, screenWidth, activeColor }: AnimatedDotProps) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: activeColor }, dotStyle]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
