import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loading';
import type { WorkoutLog } from '@/types/fitness';

interface RecentActivityCardProps {
  logs: WorkoutLog[];
  isLoading: boolean;
  onSeeAll?: () => void;
  delay?: number;
}

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffH = Math.round(diffMs / 3_600_000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  return `${diffD} days ago`;
}

const CATEGORY_ICON: Record<string, string> = {
  hiit: 'zap',
  strength: 'trending-up',
  cardio: 'heart',
  yoga: 'wind',
  core: 'circle',
  flexibility: 'wind',
};

function guessIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('hiit') || lower.includes('cardio') || lower.includes('run')) return 'zap';
  if (lower.includes('leg') || lower.includes('lower')) return 'trending-up';
  if (lower.includes('core') || lower.includes('abs')) return 'circle';
  if (lower.includes('upper') || lower.includes('push') || lower.includes('pull')) return 'trending-up';
  return 'activity';
}

export function RecentActivityCard({ logs, isLoading, onSeeAll, delay = 550 }: RecentActivityCardProps) {
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={{ marginBottom: 24 }}>
        <View style={styles.header}>
          <Skeleton height={16} width="30%" />
          <Skeleton height={12} width="15%" />
        </View>
        {[0, 1, 2].map((i) => (
          <Card key={i} style={[styles.logCard, { marginBottom: 10 }]}>
            <Skeleton width={44} height={44} borderRadius={12} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton height={15} width="60%" />
              <Skeleton height={12} width="40%" />
            </View>
            <Skeleton height={12} width="20%" />
          </Card>
        ))}
      </View>
    );
  }

  if (!logs.length) return null;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={{ marginBottom: 24 }}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          Recent Activity
        </Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              See all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {logs.map((log, i) => {
        const icon = guessIcon(log.workoutName);
        return (
          <Animated.View key={log.id} entering={FadeInDown.duration(300).delay(delay + i * 60)}>
            <TouchableOpacity activeOpacity={0.8} style={{ marginBottom: 10 }}>
              <Card style={styles.logCard}>
                <View style={[styles.logIcon, { backgroundColor: colors.primary + '22' }]}>
                  <Feather name={icon as 'activity'} size={20} color={colors.primary} />
                </View>
                <View style={styles.logInfo}>
                  <Text style={[styles.logName, { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}>
                    {log.workoutName}
                  </Text>
                  <Text style={[styles.logMeta, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                    {log.durationMinutes ? `${log.durationMinutes} min` : ''}
                    {log.durationMinutes && log.caloriesBurned ? ' · ' : ''}
                    {log.caloriesBurned ? `${log.caloriesBurned} kcal` : ''}
                  </Text>
                </View>
                <View style={styles.logRight}>
                  <Text style={[styles.logDate, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {timeAgo(log.startedAt)}
                  </Text>
                  {log.rating ? (
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Feather
                          key={s}
                          name="star"
                          size={9}
                          color={s <= log.rating! ? '#F59E0B' : colors.border}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18 },
  seeAll: { fontSize: 14 },
  logCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logInfo: { flex: 1, gap: 4 },
  logName: { fontSize: 15 },
  logMeta: { fontSize: 13 },
  logRight: { alignItems: 'flex-end', gap: 4 },
  logDate: { fontSize: 12 },
  ratingRow: { flexDirection: 'row', gap: 2 },
});
