import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface SetRowProps {
  setNumber: number;
  previousLabel?: string; // e.g. "10 × 60 kg"
  initialReps?: number;
  initialWeight?: number;
  completed?: boolean;
  isTimeBased?: boolean; // true for duration-based sets (yoga, cardio)
  initialDuration?: number; // seconds
  onComplete: (reps: number, weight: number) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.View;

export function SetRow({
  setNumber,
  previousLabel,
  initialReps = 10,
  initialWeight = 0,
  completed = false,
  isTimeBased = false,
  initialDuration,
  onComplete,
}: SetRowProps) {
  const colors = useColors();
  const [reps, setReps] = useState(String(initialReps));
  const [weight, setWeight] = useState(String(initialWeight));
  const [duration, setDuration] = useState(String(initialDuration ?? 30));

  const checkScale = useSharedValue(1);
  const completionProgress = useSharedValue(completed ? 1 : 0);

  const animCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const rowBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      completionProgress.value,
      [0, 1],
      ['transparent', colors.primary + '18'],
    ),
  }));

  const handleComplete = useCallback(() => {
    if (completed) return;
    checkScale.value = withSpring(1.25, { damping: 8, stiffness: 300 }, () => {
      checkScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    completionProgress.value = withTiming(1, { duration: 250 });
    const r = isTimeBased ? Number(duration) : Number(reps);
    const w = Number(weight);
    onComplete(r, isNaN(w) ? 0 : w);
  }, [completed, reps, weight, duration, isTimeBased, onComplete, checkScale, completionProgress]);

  const inputStyle = {
    backgroundColor: completed ? 'transparent' : colors.surface,
    borderColor: completed ? 'transparent' : colors.border,
    color: completed ? colors.mutedForeground : colors.text,
  };

  return (
    <AnimatedView style={[styles.row, rowBgStyle]}>
      {/* Set # */}
      <View style={styles.numCol}>
        <Text style={[styles.num, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
          {setNumber}
        </Text>
      </View>

      {/* Previous */}
      <View style={styles.prevCol}>
        <Text style={[styles.prev, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {previousLabel ?? '—'}
        </Text>
      </View>

      {/* Inputs */}
      {isTimeBased ? (
        <View style={styles.inputCol}>
          <TextInput
            style={[styles.input, inputStyle, { fontFamily: 'Inter_600SemiBold' }]}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            editable={!completed}
            selectTextOnFocus
          />
          <Text style={[styles.unit, { color: colors.mutedForeground }]}>s</Text>
        </View>
      ) : (
        <>
          <View style={styles.inputCol}>
            <TextInput
              style={[styles.input, inputStyle, { fontFamily: 'Inter_600SemiBold' }]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              editable={!completed}
              selectTextOnFocus
            />
            <Text style={[styles.unit, { color: colors.mutedForeground }]}>kg</Text>
          </View>
          <View style={styles.inputCol}>
            <TextInput
              style={[styles.input, inputStyle, { fontFamily: 'Inter_600SemiBold' }]}
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
              editable={!completed}
              selectTextOnFocus
            />
            <Text style={[styles.unit, { color: colors.mutedForeground }]}>reps</Text>
          </View>
        </>
      )}

      {/* Complete button */}
      <AnimatedTouchable
        style={[
          styles.checkBtn,
          animCheckStyle,
          {
            backgroundColor: completed ? colors.primary : 'transparent',
            borderColor: completed ? colors.primary : colors.border,
            borderWidth: 1.5,
          },
        ]}
        onPress={handleComplete}
        disabled={completed}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        {completed ? (
          <Feather name="check" size={14} color={colors.primaryForeground} />
        ) : (
          <View style={[styles.checkInner, { backgroundColor: colors.border + '60' }]} />
        )}
      </AnimatedTouchable>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  numCol: { width: 24, alignItems: 'center' },
  num: { fontSize: 14 },
  prevCol: { flex: 1 },
  prev: { fontSize: 12, textAlign: 'center' },
  inputCol: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  input: {
    width: 52,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
  },
  unit: { fontSize: 11, width: 24 },
  checkBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  checkInner: { width: 10, height: 10, borderRadius: 5 },
});
