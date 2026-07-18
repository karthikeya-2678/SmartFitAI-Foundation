import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 72;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip: () => void;
  visible: boolean;
}

export function RestTimer({ duration, onComplete, onSkip, visible }: RestTimerProps) {
  const colors = useColors();
  const progress = useSharedValue(0); // 0 → 1 over `duration` seconds
  const secondsLeft = useRef(duration);
  const [displaySeconds, setDisplaySeconds] = React.useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) return;
    secondsLeft.current = duration;
    setDisplaySeconds(duration);
    progress.value = 0;

    progress.value = withTiming(1, {
      duration: duration * 1000,
      easing: Easing.linear,
    });

    intervalRef.current = setInterval(() => {
      secondsLeft.current -= 1;
      setDisplaySeconds(secondsLeft.current);
      if (secondsLeft.current <= 0) {
        clearInterval(intervalRef.current!);
        onComplete();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, duration]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: progress.value * CIRCUMFERENCE,
  }));

  const minutesDisplay = Math.floor(displaySeconds / 60);
  const secondsDisplay = displaySeconds % 60;
  const timeStr =
    minutesDisplay > 0
      ? `${minutesDisplay}:${String(secondsDisplay).padStart(2, '0')}`
      : `${displaySeconds}`;

  const overlayStyle = useAnimatedStyle(() => ({ opacity: 1 }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <Animated.View
        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.82)' }]}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, overlayStyle]}>
          <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Rest Time
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            Great set! Take a breath 💪
          </Text>

          {/* Circular timer */}
          <View style={styles.timerWrap}>
            <Svg width={RADIUS * 2 + STROKE_WIDTH * 2} height={RADIUS * 2 + STROKE_WIDTH * 2}>
              {/* Background track */}
              <Circle
                cx={RADIUS + STROKE_WIDTH}
                cy={RADIUS + STROKE_WIDTH}
                r={RADIUS}
                stroke={colors.border}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              {/* Progress arc */}
              <AnimatedCircle
                cx={RADIUS + STROKE_WIDTH}
                cy={RADIUS + STROKE_WIDTH}
                r={RADIUS}
                stroke={colors.primary}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                animatedProps={animatedProps}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RADIUS + STROKE_WIDTH}, ${RADIUS + STROKE_WIDTH}`}
              />
            </Svg>
            <View style={styles.timerCenter}>
              <Text style={[styles.timeText, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
                {timeStr}
              </Text>
              <Text style={[styles.secLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {minutesDisplay > 0 ? 'min' : 'sec'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.skipBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <Feather name="skip-forward" size={16} color={colors.primary} />
            <Text style={[styles.skipText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Skip Rest
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  title: { fontSize: 22 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  timerWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  timerCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeText: { fontSize: 48 },
  secLabel: { fontSize: 13, marginTop: -4 },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    borderWidth: 1,
    marginTop: 8,
  },
  skipText: { fontSize: 15 },
});
