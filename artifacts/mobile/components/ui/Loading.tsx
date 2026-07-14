import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

// ─── Skeleton ───────────────────────────────────────────────────────────────

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const colors = useColors();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: width as ViewStyle['width'],
          height,
          borderRadius,
          backgroundColor: colors.card,
        },
        style,
      ]}
    />
  );
}

// ─── Spinner ────────────────────────────────────────────────────────────────

export interface SpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function Spinner({ size = 36, color, style }: SpinnerProps) {
  const colors = useColors();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ringColor = color ?? colors.primary;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={[
          animatedStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: Math.max(2, size * 0.1),
            borderColor: ringColor + '33',
            borderTopColor: ringColor,
          },
        ]}
      />
    </View>
  );
}

// ─── Loading Screen ──────────────────────────────────────────────────────────

export function LoadingScreen({ message }: { message?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Spinner size={48} />
      {message && (
        <Text
          style={[
            styles.message,
            { color: colors.textSecondary, fontFamily: 'Inter_400Regular' },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

/** Convenience alias — renders a Spinner */
export function Loading({ size = 36, color }: { size?: number; color?: string }) {
  return <Spinner size={size} color={color} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  message: { fontSize: 15, marginTop: 4 },
});

export default Loading;
