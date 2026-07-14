import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';

const WEEKLY_DATA = [
  { day: 'Mon', calories: 380, minutes: 45 },
  { day: 'Tue', calories: 0, minutes: 0 },
  { day: 'Wed', calories: 420, minutes: 55 },
  { day: 'Thu', calories: 290, minutes: 35 },
  { day: 'Fri', calories: 510, minutes: 60 },
  { day: 'Sat', calories: 0, minutes: 0 },
  { day: 'Sun', calories: 0, minutes: 0 },
];

const ACHIEVEMENTS = [
  { icon: 'award', label: 'First Workout', unlocked: true },
  { icon: 'zap', label: '7 Day Streak', unlocked: true },
  { icon: 'activity', label: '10 Workouts', unlocked: true },
  { icon: 'star', label: 'Elite Runner', unlocked: false },
  { icon: 'target', label: '1000 kcal', unlocked: false },
  { icon: 'trending-up', label: '30 Day Goal', unlocked: false },
];

const BODY_STATS = [
  { label: 'Weight', value: '78.5', unit: 'kg', change: '-1.2', positive: true },
  { label: 'Body Fat', value: '16.4', unit: '%', change: '-0.8', positive: true },
  { label: 'Muscle Mass', value: '36.2', unit: 'kg', change: '+0.4', positive: false },
];

const CHART_WIDTH = 310;
const CHART_HEIGHT = 90;

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const maxCal = Math.max(...WEEKLY_DATA.map((d) => d.calories), 1);

  const points = WEEKLY_DATA.map((d, i) => ({
    x: (i / (WEEKLY_DATA.length - 1)) * CHART_WIDTH,
    y: CHART_HEIGHT - (d.calories / maxCal) * CHART_HEIGHT,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;

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
        Progress
      </Text>

      {/* Weekly Activity Chart */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Weekly Activity
          </Text>
          <TouchableOpacity>
            <Text style={[styles.changeText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              This week
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartArea}>
          <Svg
            width={CHART_WIDTH}
            height={CHART_HEIGHT + 24}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + 24}`}
          >
            {/* Grid lines */}
            {[0, 0.5, 1].map((ratio, i) => (
              <Line
                key={i}
                x1={0}
                y1={CHART_HEIGHT * ratio}
                x2={CHART_WIDTH}
                y2={CHART_HEIGHT * ratio}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            ))}
            {/* Area */}
            <Path d={areaPath} fill={colors.primary + '1A'} />
            {/* Line */}
            <Path
              d={linePath}
              stroke={colors.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data points */}
            {points.map((p, i) =>
              p.calories > 0 ? (
                <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.primary} />
              ) : null
            )}
            {/* Day labels */}
            {points.map((p, i) => (
              <SvgText
                key={i}
                x={p.x}
                y={CHART_HEIGHT + 18}
                fontSize={10}
                fill={colors.mutedForeground}
                textAnchor="middle"
              >
                {p.day}
              </SvgText>
            ))}
          </Svg>
        </View>

        <View style={styles.weekStats}>
          <WeekStat icon="activity" label="Workouts" value="4" colors={colors} />
          <WeekStat icon="zap" label="Calories" value="1,600" colors={colors} />
          <WeekStat icon="clock" label="Minutes" value="195" colors={colors} />
        </View>
      </Card>

      {/* Body Metrics */}
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        Body Metrics
      </Text>
      <View style={styles.bodyStats}>
        {BODY_STATS.map((stat) => (
          <Card key={stat.label} style={styles.bodyStat}>
            <Text
              style={[
                styles.bodyStatLabel,
                { color: colors.textSecondary, fontFamily: 'Inter_400Regular' },
              ]}
            >
              {stat.label}
            </Text>
            <View style={styles.bodyValueRow}>
              <Text
                style={[styles.bodyStatValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}
              >
                {stat.value}
              </Text>
              <Text
                style={[
                  styles.bodyStatUnit,
                  { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
                ]}
              >
                {' '}
                {stat.unit}
              </Text>
            </View>
            <Text
              style={[
                styles.bodyChange,
                {
                  color: stat.positive ? colors.primary : colors.accent,
                  fontFamily: 'Inter_600SemiBold',
                },
              ]}
            >
              {stat.change} this week
            </Text>
          </Card>
        ))}
      </View>

      {/* Achievements */}
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        Achievements
      </Text>
      <View style={styles.achievements}>
        {ACHIEVEMENTS.map((a) => (
          <Card
            key={a.label}
            style={[styles.badge, { opacity: a.unlocked ? 1 : 0.38 }]}
          >
            <View
              style={[
                styles.badgeIcon,
                {
                  backgroundColor: a.unlocked ? colors.primary + '22' : colors.surface,
                },
              ]}
            >
              <Feather
                name={a.icon as 'award'}
                size={22}
                color={a.unlocked ? colors.primary : colors.mutedForeground}
              />
            </View>
            <Text
              style={[
                styles.badgeLabel,
                {
                  color: a.unlocked ? colors.text : colors.mutedForeground,
                  fontFamily: 'Inter_500Medium',
                },
              ]}
            >
              {a.label}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

function WeekStat({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.weekStat}>
      <Feather name={icon as 'activity'} size={16} color={colors.primary} />
      <Text style={[styles.weekStatValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
        {value}
      </Text>
      <Text
        style={[styles.weekStatLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, marginBottom: 18 },
  chartCard: { marginBottom: 28, gap: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16 },
  changeText: { fontSize: 13 },
  chartArea: { alignItems: 'center' },
  weekStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 4 },
  weekStat: { alignItems: 'center', gap: 6 },
  weekStatValue: { fontSize: 18 },
  weekStatLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 18, marginBottom: 14 },
  bodyStats: { gap: 12, marginBottom: 28 },
  bodyStat: { gap: 6 },
  bodyStatLabel: { fontSize: 13 },
  bodyValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  bodyStatValue: { fontSize: 28 },
  bodyStatUnit: { fontSize: 15 },
  bodyChange: { fontSize: 13 },
  achievements: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  badge: { width: '30%', alignItems: 'center', gap: 10, padding: 14 },
  badgeIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeLabel: { fontSize: 11, textAlign: 'center' },
});
