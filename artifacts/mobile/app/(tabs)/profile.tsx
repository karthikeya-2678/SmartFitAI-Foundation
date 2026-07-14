import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useAppStore } from '@/store/useAppStore';

const MENU_SECTIONS = [
  {
    title: 'Fitness',
    items: [
      { icon: 'target', label: 'My Goals' },
      { icon: 'bar-chart-2', label: 'Statistics' },
      { icon: 'calendar', label: 'Workout History' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: 'user', label: 'Edit Profile' },
      { icon: 'bell', label: 'Notifications' },
      { icon: 'lock', label: 'Privacy' },
    ],
  },
  {
    title: 'More',
    items: [
      { icon: 'help-circle', label: 'Help & Support' },
      { icon: 'star', label: 'Rate SmartFitAI' },
      { icon: 'info', label: 'About' },
    ],
  },
];

const PROFILE_STATS = [
  { label: 'Workouts', value: '24' },
  { label: 'Streak', value: '7d' },
  { label: 'Hours', value: '18h' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const reset = useAppStore((s) => s.reset);

  const displayName = user?.name ?? 'Alex Johnson';
  const displayEmail = user?.email ?? 'alex@smartfitai.app';
  const displayGoal = user?.goal ?? 'Build Muscle';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        Profile
      </Text>

      {/* Profile card */}
      <Card style={styles.profileCard} padding="none">
        <View style={styles.profileInfo}>
          <Avatar name={displayName} size="xl" />
          <View style={styles.nameBlock}>
            <Text style={[styles.name, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              {displayName}
            </Text>
            <Text
              style={[styles.email, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}
            >
              {displayEmail}
            </Text>
            <View style={[styles.goalBadge, { backgroundColor: colors.primary + '22' }]}>
              <Feather name="target" size={11} color={colors.primary} />
              <Text
                style={[styles.goalText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}
              >
                {displayGoal}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="edit-2" size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          {PROFILE_STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              )}
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}
                >
                  {s.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: colors.textSecondary, fontFamily: 'Inter_400Regular' },
                  ]}
                >
                  {s.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </Card>

      {/* Menu sections */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text
            style={[
              styles.menuSectionTitle,
              { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' },
            ]}
          >
            {section.title.toUpperCase()}
          </Text>
          <Card style={styles.menuCard} padding="none">
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  idx < section.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primary + '18' }]}>
                  <Feather name={item.icon as 'target'} size={16} color={colors.primary} />
                </View>
                <Text
                  style={[styles.menuLabel, { color: colors.text, fontFamily: 'Inter_500Medium' }]}
                >
                  {item.label}
                </Text>
                <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      {/* Sign Out */}
      <TouchableOpacity
        style={[
          styles.signOut,
          { backgroundColor: colors.destructive + '15', borderRadius: colors.radius },
        ]}
        activeOpacity={0.8}
        onPress={() => reset()}
      >
        <Feather name="log-out" size={17} color={colors.destructive} />
        <Text
          style={[styles.signOutText, { color: colors.destructive, fontFamily: 'Inter_600SemiBold' }]}
        >
          Sign Out
        </Text>
      </TouchableOpacity>

      <Text
        style={[styles.version, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}
      >
        SmartFitAI v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, marginBottom: 18 },
  profileCard: { marginBottom: 28 },
  profileInfo: { flexDirection: 'row', gap: 16, padding: 20, alignItems: 'center' },
  nameBlock: { flex: 1, gap: 6 },
  name: { fontSize: 20 },
  email: { fontSize: 13 },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  goalText: { fontSize: 12 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, marginVertical: 6 },
  menuSection: { marginBottom: 20 },
  menuSectionTitle: { fontSize: 11, letterSpacing: 1, marginBottom: 8, marginLeft: 2 },
  menuCard: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    marginBottom: 20,
  },
  signOutText: { fontSize: 15 },
  version: { fontSize: 12, textAlign: 'center', marginBottom: 10 },
});
