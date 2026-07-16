/**
 * Root splash screen — shows a branded animation while Supabase
 * initialises the session, then redirects to the correct route.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import colors from '@/constants/colors';

export default function SplashScreen() {
  const { isInitialized, isAuthenticated } = useAuth();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const router = useRouter();

  // Pulse animation on the logo
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.75, { duration: 900 }),
      ),
      -1,
    );
  }, []);

  // Navigate once session is resolved
  useEffect(() => {
    if (!isInitialized) return;
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else if (!hasOnboarded) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 600); // slight buffer so the animation plays
    return () => clearTimeout(timer);
  }, [isInitialized, isAuthenticated, hasOnboarded]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0F172A', '#0C1524', '#061020']}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow circle */}
      <View style={styles.glow} />

      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <LinearGradient
          colors={[colors.dark.primary, colors.dark.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Feather name="zap" size={40} color="#0F172A" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#22C55E',
    opacity: 0.06,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
