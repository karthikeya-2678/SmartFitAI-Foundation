import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loading';

interface AIRecommendationCardProps {
  recommendation: string | null;
  isLoading: boolean;
  delay?: number;
}

export function AIRecommendationCard({ recommendation, isLoading, delay = 400 }: AIRecommendationCardProps) {
  const colors = useColors();
  const glow = useSharedValue(0.6);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  if (isLoading) {
    return (
      <Card style={{ marginBottom: 20, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Skeleton width={32} height={32} borderRadius={10} />
          <Skeleton width="50%" height={14} />
        </View>
        <Skeleton height={14} />
        <Skeleton height={14} width="85%" />
        <Skeleton height={14} width="70%" />
      </Card>
    );
  }

  if (!recommendation) return null;

  const PURPLE = '#8B5CF6';

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <Card style={{ marginBottom: 20, overflow: 'hidden' }}>
        {/* Subtle gradient tint top-left */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: PURPLE,
              borderRadius: 12,
            },
            glowStyle,
          ]}
          pointerEvents="none"
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card, opacity: 0.94, borderRadius: 12 }]} pointerEvents="none" />

        {/* Content */}
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: PURPLE + '33' }]}>
            <Animated.View style={glowStyle}>
              <Feather name="cpu" size={16} color={PURPLE} />
            </Animated.View>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              AI Coach Insight
            </Text>
            <Text style={[styles.sub, { color: PURPLE, fontFamily: 'Inter_500Medium' }]}>
              Personalized for you
            </Text>
          </View>
        </View>

        <Text style={[styles.body, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
          {recommendation}
        </Text>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerText: { gap: 2 },
  title: { fontSize: 15 },
  sub: { fontSize: 11 },
  body: { fontSize: 14, lineHeight: 21 },
});
