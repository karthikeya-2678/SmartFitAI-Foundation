import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface WorkoutTimerProps {
  startedAt: string; // ISO string
  paused?: boolean;
  style?: object;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function WorkoutTimer({ startedAt, paused = false, style }: WorkoutTimerProps) {
  const colors = useColors();
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt, paused]);

  return (
    <Text style={[styles.timer, { color: colors.primary, fontFamily: 'Inter_700Bold' }, style]}>
      {formatTime(elapsed)}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: { fontSize: 16, letterSpacing: 1 },
});
