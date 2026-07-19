import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { WorkoutCard, CategoryBanner, HistoryCard } from '@/components/workout';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useAppStore } from '@/store/useAppStore';
import { WORKOUTS, filterWorkouts } from '@/data/workouts';
import type { Workout, ExerciseCategory } from '@/types/fitness';
import { CATEGORY_CONFIG, DIFFICULTY_FILTER_OPTIONS } from '@/constants/workout';

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as ExerciseCategory[];

export default function WorkoutsScreen() {
  const colors = useColors();
  const { isFavorite, toggleFavorite, favoriteIds } = useWorkoutStore();
  const { workoutLogs } = useAppStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);

  const filtered = useMemo(
    () =>
      filterWorkouts({
        category: activeCategory === 'all' ? undefined : activeCategory,
        difficulty: activeDifficulty === 'all' ? undefined : activeDifficulty,
        search: search.trim() || undefined,
      }),
    [activeCategory, activeDifficulty, search],
  );

  const favorites = useMemo(
    () => WORKOUTS.filter((w) => favoriteIds.includes(w.id)),
    [favoriteIds],
  );

  const recentLogs = useMemo(() => workoutLogs.slice(0, 5), [workoutLogs]);

  const handleWorkoutPress = useCallback((workout: Workout) => {
    router.push(`/workout/${workout.id}`);
  }, []);

  const noFilters = activeCategory === 'all' && activeDifficulty === 'all' && !search.trim();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
            Workouts
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            {WORKOUTS.length} programs ready
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.historyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/workout/history')}
          activeOpacity={0.7}
        >
          <Feather name="clock" size={16} color={colors.primary} />
          <Text style={[styles.historyBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            History
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)}>
          <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.text, fontFamily: 'Inter_400Regular' }]}
              placeholder="Search workouts…"
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Categories horizontal scroll */}
        {noFilters && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              Browse by Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {CATEGORIES.map((cat) => (
                <CategoryBanner
                  key={cat}
                  category={cat}
                  onPress={() => setActiveCategory(cat)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Favorites */}
        {noFilters && favorites.length > 0 && (
          <Animated.View entering={FadeInDown.delay(140).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
                ❤️ Favorites
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favoritesScroll}>
              {favorites.map((w, i) => (
                <View key={w.id} style={styles.favCard}>
                  <WorkoutCard
                    workout={w}
                    isFavorite
                    onPress={() => handleWorkoutPress(w)}
                    onToggleFavorite={toggleFavorite}
                    index={i}
                  />
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Filter chips */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
              {noFilters ? 'All Workouts' : `Results (${filtered.length})`}
            </Text>
            {!noFilters && (
              <TouchableOpacity
                onPress={() => { setActiveCategory('all'); setActiveDifficulty('all'); setSearch(''); }}
              >
                <Text style={[styles.clearText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {(['all', ...CATEGORIES] as const).map((cat) => {
              const label = cat === 'all' ? 'All' : CATEGORY_CONFIG[cat].label;
              const active = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? colors.primaryForeground : colors.textSecondary, fontFamily: 'Inter_600SemiBold' },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Difficulty chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipsScroll, { marginTop: 8 }]}>
            {DIFFICULTY_FILTER_OPTIONS.map((opt) => {
              const active = activeDifficulty === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.secondary : colors.card,
                      borderColor: active ? colors.secondary : colors.border,
                    },
                  ]}
                  onPress={() => setActiveDifficulty(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? colors.primaryForeground : colors.textSecondary, fontFamily: 'Inter_600SemiBold' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Workout list */}
        {filtered.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.empty}>
            <Feather name="search" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}>
              No workouts found
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              Try adjusting your search or filters
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.list}>
            {filtered.map((workout, i) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isFavorite={isFavorite(workout.id)}
                onPress={() => handleWorkoutPress(workout)}
                onToggleFavorite={toggleFavorite}
                index={i}
              />
            ))}
          </View>
        )}

        {/* Recent history teaser */}
        {noFilters && recentLogs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
                Recent Activity
              </Text>
              <TouchableOpacity onPress={() => router.push('/workout/history')}>
                <Text style={[styles.clearText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            {recentLogs.map((log) => (
              <HistoryCard key={log.id} log={log} />
            ))}
          </Animated.View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 28 },
  subtitle: { fontSize: 13, marginTop: 2 },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  historyBtnText: { fontSize: 13 },
  scroll: { paddingHorizontal: 20 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 14 },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  clearText: { fontSize: 13 },
  categoriesScroll: { marginBottom: 24, overflow: 'visible' },
  favoritesScroll: { marginBottom: 24 },
  favCard: { width: 300, marginRight: 0 },
  chipsScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 13 },
  list: { marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 17 },
  emptyBody: { fontSize: 13, textAlign: 'center' },
});
