import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, G, Ellipse } from 'react-native-svg';
import { useSignInWithGoogle } from '@/hooks/useAuth';
import colors from '@/constants/colors';

const { width: W, height: H } = Dimensions.get('window');

function HeroGraphic() {
  return (
    <Svg width={W} height={H * 0.52} viewBox={`0 0 ${W} ${H * 0.52}`}>
      <Defs>
        <RadialGradient id="bg" cx="50%" cy="60%" r="70%">
          <Stop offset="0%" stopColor="#22C55E" stopOpacity={0.12} />
          <Stop offset="100%" stopColor="#0F172A" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="accent" cx="80%" cy="20%" r="40%">
          <Stop offset="0%" stopColor="#06B6D4" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={W / 2} cy={H * 0.3} r={H * 0.35} fill="url(#bg)" />
      <Circle cx={W * 0.8} cy={H * 0.08} r={H * 0.2} fill="url(#accent)" />

      {/* Decorative rings */}
      <Circle cx={W / 2} cy={H * 0.26} r={130} stroke="#22C55E" strokeWidth={1} fill="none" opacity={0.08} />
      <Circle cx={W / 2} cy={H * 0.26} r={160} stroke="#22C55E" strokeWidth={0.5} fill="none" opacity={0.05} />
      <Circle cx={W / 2} cy={H * 0.26} r={190} stroke="#06B6D4" strokeWidth={0.5} fill="none" opacity={0.04} />
    </Svg>
  );
}

function StatPill({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={statStyles.pill}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  icon: { fontSize: 14 },
  label: {
    color: colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
});

export default function WelcomeScreen() {
  const router = useRouter();
  const googleAuth = useSignInWithGoogle();
  const { isPending: googleLoading } = googleAuth;

  const handleGoogleSignIn = () => {
    googleAuth.mutate(undefined, {
      onError: (e: any) =>
        Alert.alert('Google Sign-In Failed', e.message ?? 'Please try again.'),
    });
  };

  // Entrance animations
  const heroOpacity = useSharedValue(0);
  const heroY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(30);

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 600 });
    heroY.value = withSpring(0, { damping: 20 });
    contentOpacity.value = withDelay(250, withTiming(1, { duration: 600 }));
    contentY.value = withDelay(250, withSpring(0, { damping: 20 }));
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#060E1F', '#0F172A', '#0A1628']} style={StyleSheet.absoluteFill} />

      {/* Hero graphic */}
      <Animated.View style={[styles.heroWrap, heroStyle]}>
        <HeroGraphic />

        {/* Floating logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[colors.dark.primary, colors.dark.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Feather name="zap" size={32} color="#0F172A" />
          </LinearGradient>
          <Text style={styles.appName}>SmartFitAI</Text>
          <Text style={styles.tagline}>Transform Your Body & Mind</Text>
        </View>
      </Animated.View>

      {/* Bottom content */}
      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        <Animated.View style={[styles.content, contentStyle]}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatPill icon="🏋️" label="200+ Workouts" />
            <StatPill icon="🔥" label="50k+ Athletes" />
            <StatPill icon="⚡" label="AI-Powered" />
          </View>

          {/* CTA Buttons */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.88}
            onPress={() => router.push('/(auth)/signup')}
          >
            <LinearGradient
              colors={[colors.dark.primary, '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.primaryBtnText}>Get Started — It's Free</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.8}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  heroWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.55,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  appName: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    color: colors.dark.text,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.dark.textSecondary,
    letterSpacing: 0.2,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#0F172A',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryBtnText: {
    color: colors.dark.text,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.dark.border,
  },
  dividerText: {
    color: colors.dark.mutedForeground,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  googleBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#EA4335',
  },
  googleText: {
    color: colors.dark.text,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
