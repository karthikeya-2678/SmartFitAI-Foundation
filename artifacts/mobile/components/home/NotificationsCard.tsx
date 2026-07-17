import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutRight, Layout } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import type { DashboardNotification } from '@/types/dashboard';

interface NotificationsCardProps {
  notifications: DashboardNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  delay?: number;
}

const TYPE_CONFIG = {
  info: { icon: 'info', color: '#3B82F6' },
  success: { icon: 'check-circle', color: '#22C55E' },
  warning: { icon: 'alert-triangle', color: '#F59E0B' },
  ai: { icon: 'cpu', color: '#8B5CF6' },
} as const;

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffM = Math.round(diffMs / 60_000);
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.round(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.round(diffH / 24)}d ago`;
}

export function NotificationsCard({ notifications, onMarkRead, onMarkAllRead, delay = 600 }: NotificationsCardProps) {
  const colors = useColors();
  const unread = notifications.filter((n) => !n.isRead);

  if (!notifications.length) return null;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={{ marginBottom: 24 }}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Notifications
          </Text>
          {unread.length > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.unreadText, { fontFamily: 'Inter_700Bold' }]}>
                {unread.length}
              </Text>
            </View>
          )}
        </View>
        {unread.length > 0 && (
          <TouchableOpacity onPress={onMarkAllRead}>
            <Text style={[styles.markAll, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ gap: 8 }}>
        {notifications.map((n, i) => {
          const cfg = TYPE_CONFIG[n.type];
          return (
            <Animated.View
              key={n.id}
              entering={FadeInDown.duration(300).delay(delay + i * 50)}
              layout={Layout.springify()}
            >
              <TouchableOpacity onPress={() => onMarkRead(n.id)} activeOpacity={0.8}>
                <Card
                  style={[
                    styles.notifCard,
                    !n.isRead ? { borderLeftWidth: 3, borderLeftColor: cfg.color } : undefined,
                  ]}
                  padding="sm"
                >
                  <View style={[styles.iconWrap, { backgroundColor: cfg.color + '22' }]}>
                    <Feather name={cfg.icon as 'info'} size={16} color={cfg.color} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTopRow}>
                      <Text
                        style={[
                          styles.notifTitle,
                          {
                            color: n.isRead ? colors.textSecondary : colors.text,
                            fontFamily: n.isRead ? 'Inter_400Regular' : 'Inter_600SemiBold',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {n.title}
                      </Text>
                      <Text style={[styles.notifTime, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                        {timeAgo(n.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.notifBody, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}
                      numberOfLines={2}
                    >
                      {n.body}
                    </Text>
                  </View>
                  {!n.isRead && (
                    <View style={[styles.dot, { backgroundColor: cfg.color }]} />
                  )}
                </Card>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 11 },
  markAll: { fontSize: 13 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifContent: { flex: 1, gap: 4 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 },
  notifTitle: { fontSize: 14, flex: 1 },
  notifTime: { fontSize: 11, flexShrink: 0 },
  notifBody: { fontSize: 12, lineHeight: 17 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
});
