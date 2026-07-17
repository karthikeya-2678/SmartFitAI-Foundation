import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Avatar } from '@/components/ui/Avatar';
import type { UserProfile } from '@/types/user';
import type { MembershipTier } from '@/types/dashboard';

const TIER_LABEL: Record<MembershipTier, string> = {
  free: 'Free',
  pro: 'Pro',
  elite: 'Elite',
};

const TIER_COLOR: Record<MembershipTier, string> = {
  free: '#94A3B8',
  pro: '#22C55E',
  elite: '#F59E0B',
};

interface GreetingHeaderProps {
  user: UserProfile | null;
  membership: MembershipTier;
  unreadCount: number;
  onNotificationPress: () => void;
  onAvatarPress: () => void;
}

export function GreetingHeader({
  user,
  membership,
  unreadCount,
  onNotificationPress,
  onAvatarPress,
}: GreetingHeaderProps) {
  const colors = useColors();

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const tierColor = TIER_COLOR[membership];

  const bellScale = useSharedValue(1);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
  }));

  const handleBellPress = () => {
    bellScale.value = withSpring(0.8, {}, () => {
      bellScale.value = withSpring(1);
    });
    onNotificationPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(0)}
      style={styles.container}
    >
      {/* Left: greeting + name + badge */}
      <View style={styles.left}>
        <Text style={[styles.greeting, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
          {greeting},
        </Text>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text, fontFamily: 'Inter_700Bold' }]} numberOfLines={1}>
            {user?.name ?? 'Athlete'} 💪
          </Text>
          <View style={[styles.tierBadge, { backgroundColor: tierColor + '22', borderColor: tierColor + '44' }]}>
            <Text style={[styles.tierText, { color: tierColor, fontFamily: 'Inter_600SemiBold' }]}>
              {TIER_LABEL[membership]}
            </Text>
          </View>
        </View>
        <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {/* Right: notification bell + avatar */}
      <View style={styles.right}>
        <TouchableOpacity onPress={handleBellPress} style={styles.bellBtn} activeOpacity={0.8}>
          <Animated.View style={bellStyle}>
            <Feather name="bell" size={22} color={colors.text} />
          </Animated.View>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
              <Text style={[styles.badgeText, { fontFamily: 'Inter_700Bold' }]}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.85}>
          <Avatar
            name={user?.name ?? 'A'}
            size="md"
            source={user?.avatar ? { uri: user.avatar } : undefined}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  left: { flex: 1, gap: 2 },
  greeting: { fontSize: 13 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 22 },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  tierText: { fontSize: 10 },
  sub: { fontSize: 12, marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9 },
});
