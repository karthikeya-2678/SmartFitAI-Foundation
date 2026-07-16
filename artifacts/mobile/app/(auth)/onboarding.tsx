import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Rect,
  Line,
  Path,
  G,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedDot } from '@/components/auth/AnimatedDot';
import { useAppStore } from '@/store/useAppStore';
import colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Illustrations ────────────────────────────────────────────────────────────

function DumbbellIllustration() {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Defs>
        <RadialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
          <Stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={110} cy={110} r={90} fill="url(#glow1)" />
      {/* Bar */}
      <Rect x={55} y={105} width={110} height={10} rx={5} fill="#22C55E" opacity={0.9} />
      {/* Left weight */}
      <Rect x={38} y={86} width={22} height={48} rx={7} fill="#16A34A" />
      <Rect x={30} y={94} width={14} height={32} rx={5} fill="#22C55E" />
      {/* Right weight */}
      <Rect x={160} y={86} width={22} height={48} rx={7} fill="#16A34A" />
      <Rect x={176} y={94} width={14} height={32} rx={5} fill="#22C55E" />
      {/* Shine */}
      <Rect x={70} y={107} width={40} height={3} rx={1.5} fill="white" opacity={0.2} />
    </Svg>
  );
}

function ChartIllustration() {
  const bars = [40, 65, 50, 80, 60, 100, 75];
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Defs>
        <RadialGradient id="glow2" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
          <Stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={110} cy={110} r={90} fill="url(#glow2)" />
      {[40, 70, 100, 130].map((y) => (
        <Line key={y} x1={30} y1={y + 40} x2={190} y2={y + 40} stroke="#06B6D4" strokeWidth={0.5} opacity={0.2} />
      ))}
      {bars.map((h, i) => (
        <G key={i}>
          <Rect x={30 + i * 24} y={170 - h} width={16} height={h} rx={5} fill="#06B6D4" opacity={i === 5 ? 1 : 0.5} />
          {i === 5 && <Rect x={30 + i * 24} y={170 - h} width={16} height={8} rx={5} fill="#67E8F9" />}
        </G>
      ))}
      <Path d="M 38 145 Q 62 130 86 120 Q 110 100 134 90 Q 158 80 174 70" stroke="#06B6D4" strokeWidth={2.5} fill="none" strokeDasharray="5 3" opacity={0.6} />
    </Svg>
  );
}

function TrophyIllustration() {
  return (
    <Svg width={220} height={220} viewBox="0 0 220 220">
      <Defs>
        <RadialGradient id="glow3" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#A855F7" stopOpacity={0.3} />
          <Stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={110} cy={110} r={90} fill="url(#glow3)" />
      <Path d="M 75 70 L 75 130 Q 75 155 110 155 Q 145 155 145 130 L 145 70 Z" fill="#A855F7" opacity={0.9} />
      <Path d="M 85 75 L 85 125 Q 85 145 95 150" stroke="white" strokeWidth={3} fill="none" opacity={0.2} strokeLinecap="round" />
      <Path d="M 75 85 Q 50 85 50 105 Q 50 125 75 125" stroke="#9333EA" strokeWidth={8} fill="none" strokeLinecap="round" />
      <Path d="M 145 85 Q 170 85 170 105 Q 170 125 145 125" stroke="#9333EA" strokeWidth={8} fill="none" strokeLinecap="round" />
      <Rect x={95} y={155} width={30} height={12} rx={3} fill="#7C3AED" />
      <Rect x={82} y={167} width={56} height={8} rx={4} fill="#A855F7" opacity={0.8} />
      <Path d="M 110 90 L 115 103 L 129 103 L 118 112 L 122 125 L 110 117 L 98 125 L 102 112 L 91 103 L 105 103 Z" fill="white" opacity={0.9} />
    </Svg>
  );
}

// ─── Slide data ───────────────────────────────────────────────────────────────

const slides = [
  {
    id: '1',
    title: 'Track Every Rep',
    description: 'Log workouts in seconds. Every set, every rep — captured effortlessly so you stay focused on lifting.',
    accent: ['#22C55E', '#16A34A'] as [string, string],
    dotColor: '#22C55E',
    illustration: <DumbbellIllustration />,
  },
  {
    id: '2',
    title: 'Visualise Progress',
    description: 'Beautiful charts reveal your strength gains, cardio improvements and body transformation over time.',
    accent: ['#06B6D4', '#0891B2'] as [string, string],
    dotColor: '#06B6D4',
    illustration: <ChartIllustration />,
  },
  {
    id: '3',
    title: 'Crush Your Goals',
    description: 'AI-powered plans that adapt to your schedule, recovery and performance. Your coach, always on.',
    accent: ['#A855F7', '#9333EA'] as [string, string],
    dotColor: '#A855F7',
    illustration: <TrophyIllustration />,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const idx = viewableItems[0]?.index;
      if (idx !== null && idx !== undefined) setCurrentIndex(idx);
    },
  ).current;

  const finish = () => {
    setHasOnboarded(true);
    router.replace('/(auth)/welcome');
  };

  const next = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      finish();
    }
  };

  const currentAccent = slides[currentIndex]?.accent ?? [colors.dark.primary, colors.dark.accent];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0A1628', '#0F172A']} style={StyleSheet.absoluteFill} />

      {/* Skip */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={finish} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.illustrationWrap}>{item.illustration}</View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Footer */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {/* Animated dots — each is a real component so hooks are legal */}
        <View style={styles.dots}>
          {slides.map((slide, i) => (
            <AnimatedDot
              key={slide.id}
              index={i}
              scrollX={scrollX}
              screenWidth={SCREEN_WIDTH}
              activeColor={slide.dotColor}
            />
          ))}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity onPress={next} activeOpacity={0.85}>
          <LinearGradient
            colors={currentAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    position: 'absolute',
    top: 0,
    right: 24,
    zIndex: 10,
    paddingTop: 56,
  },
  skipText: {
    color: colors.dark.textSecondary,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 160,
  },
  illustrationWrap: {
    marginBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: colors.dark.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 20,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  nextButton: {
    width: SCREEN_WIDTH - 48,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: '#0F172A',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
});
