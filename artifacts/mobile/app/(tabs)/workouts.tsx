import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';

const CATEGORIES = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Core'];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: '#22C55E',
  Intermediate: '#F59E0B',
  Advanced: '#EF4444',
};

const WORKOUTS = [
  { id: '1', name: 'Full Body Strength', category: 'Strength', duration: 45, difficulty: 'Intermediate', exercises: 10, calories: 380 },
  { id: '2', name: 'HIIT Blast', category: 'HIIT', duration: 25, difficulty: 'Advanced', exercises: 8, calories: 450 },
  { id: '3', name: 'Morning Yoga Flow', category: 'Yoga', duration: 30, difficulty: 'Beginner', exercises: 12, calories: 150 },
  { id: '4', name: 'Sprint Intervals', category: 'Cardio', duration: 35, difficulty: 'Advanced', exercises: 6, calories: 520 },
  { id: '5', name: 'Core Crusher', category: 'Core', duration: 20, difficulty: 'Intermediate', exercises: 9, calories: 200 },
  { id: '6', name: 'Upper Body Power', category: 'Strength', duration: 50, difficulty: 'Advanced', exercises: 11, calories: 420 },
  { id: '7', name: 'Low Impact Cardio', category: 'Cardio', duration: 40, difficulty: 'Beginner', exercises: 7, calories: 280 },
  { id: '8', name: 'Yoga for Recovery', category: 'Yoga', duration: 45, difficulty: 'Beginner', exercises: 14, calories: 120 },
];

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const debouncedSearch = useDebounce(search, 250);

  const filtered = WORKOUTS.filter((w) => {
    const matchesCategory = activeCategory === 'All' || w.category === activeCategory;
    const matchesSearch = w.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          Workouts
        </Text>

        {/* Search */}
        <Input
          placeholder="Search workouts..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.search}
          leftIcon={<Feather name="search" size={18} color={colors.mutedForeground} />}
        />

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor: activeCategory === cat ? colors.primary : colors.surface,
                  borderColor: activeCategory === cat ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      activeCategory === cat ? colors.primaryForeground : colors.textSecondary,
                    fontFamily: 'Inter_600SemiBold',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text
          style={[
            styles.countText,
            { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
          ]}
        >
          {filtered.length} workout{filtered.length !== 1 ? 's' : ''}
        </Text>

        {/* Workout cards */}
        {filtered.map((w) => (
          <WorkoutCard key={w.id} workout={w} colors={colors} />
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Feather name="search" size={36} color={colors.mutedForeground} />
            <Text
              style={[
                styles.emptyText,
                { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
              ]}
            >
              No workouts found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function WorkoutCard({ workout, colors }: { workout: (typeof WORKOUTS)[0]; colors: ReturnType<typeof useColors> }) {
  const diffColor = DIFFICULTY_COLOR[workout.difficulty] ?? colors.primary;

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.cardTouch}>
      <Card style={styles.workoutCard}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[styles.badgeText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              {workout.category}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: diffColor + '22' }]}>
            <Text style={[styles.badgeText, { color: diffColor, fontFamily: 'Inter_600SemiBold' }]}>
              {workout.difficulty}
            </Text>
          </View>
        </View>

        <Text style={[styles.workoutName, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
          {workout.name}
        </Text>

        <View style={styles.metaRow}>
          <MetaChip icon="clock" label={`${workout.duration} min`} colors={colors} />
          <MetaChip icon="list" label={`${workout.exercises} exercises`} colors={colors} />
          <MetaChip icon="zap" label={`${workout.calories} kcal`} colors={colors} />
        </View>

        <View
          style={[
            styles.startBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius - 4 },
          ]}
        >
          <Text
            style={[
              styles.startBtnText,
              { color: colors.primaryForeground, fontFamily: 'Inter_700Bold' },
            ]}
          >
            Start Workout
          </Text>
          <Feather name="arrow-right" size={16} color={colors.primaryForeground} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function MetaChip({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.metaChip}>
      <Feather name={icon as 'clock'} size={13} color={colors.textSecondary} />
      <Text
        style={[styles.metaChipText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, marginBottom: 18 },
  search: { marginBottom: 18 },
  categoryScroll: { marginBottom: 16 },
  categoryContent: { paddingRight: 4, gap: 10 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13 },
  countText: { fontSize: 13, marginBottom: 14 },
  cardTouch: { marginBottom: 14 },
  workoutCard: { gap: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11 },
  workoutName: { fontSize: 19 },
  metaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaChipText: { fontSize: 13 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  startBtnText: { fontSize: 14 },
  empty: { alignItems: 'center', gap: 14, paddingTop: 60 },
  emptyText: { fontSize: 15 },
});
