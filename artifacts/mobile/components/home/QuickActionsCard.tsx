import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsCardProps {
  actions: QuickAction[];
  delay?: number;
}

function ActionButton({ action }: { action: QuickAction }) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animStyle, styles.actionWrap]}>
      <TouchableOpacity
        onPressIn={() => { scale.value = withSpring(0.9); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={action.onPress}
        activeOpacity={1}
        style={styles.actionTouch}
      >
        <View style={[styles.actionIcon, { backgroundColor: action.color + '22' }]}>
          <Feather name={action.icon as 'zap'} size={20} color={action.color} />
        </View>
        <Text style={[styles.actionLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]} numberOfLines={2}>
          {action.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function QuickActionsCard({ actions, delay = 500 }: QuickActionsCardProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: 'Inter_600SemiBold' }]}>
        QUICK ACTIONS
      </Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <ActionButton key={action.id} action={action} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 11, letterSpacing: 0.8, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionWrap: { width: '22%', minWidth: 74 },
  actionTouch: { alignItems: 'center', gap: 8 },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, textAlign: 'center' },
});
