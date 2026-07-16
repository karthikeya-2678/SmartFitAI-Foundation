import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Input } from '@/components/ui/Input';
import { useResetPassword } from '@/hooks/useAuth';
import colors from '@/constants/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const resetPassword = useResetPassword();

  // Success animation
  const successScale = useSharedValue(0.6);
  const successOpacity = useSharedValue(0);

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert('Missing field', 'Please enter your email address.');
      return;
    }
    resetPassword.mutate(email.trim().toLowerCase(), {
      onSuccess: () => {
        setSent(true);
        successScale.value = withSpring(1, { damping: 14 });
        successOpacity.value = withTiming(1, { duration: 400 });
      },
      onError: (e: any) =>
        Alert.alert('Error', e.message ?? 'Failed to send reset link. Please try again.'),
    });
  };

  const successStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [{ scale: successScale.value }],
  }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#060E1F', '#0F172A']} style={styles.gradientHeader} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.dark.text} />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.body}
        >
          {!sent ? (
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconWrap}>
                <LinearGradient
                  colors={[colors.dark.accent, '#0891B2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Feather name="key" size={28} color="#0F172A" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the email associated with your account and we'll send you a reset link.
              </Text>

              <View style={styles.form}>
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                  autoFocus
                  leftIcon={<Feather name="mail" size={18} color={colors.dark.mutedForeground} />}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, resetPassword.isPending && { opacity: 0.75 }]}
                  onPress={handleReset}
                  disabled={resetPassword.isPending}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.dark.accent, '#0891B2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBtn}
                  >
                    {resetPassword.isPending ? (
                      <ActivityIndicator color="#0F172A" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                <Feather name="arrow-left" size={14} color={colors.dark.primary} />
                <Text style={styles.backLinkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Success state */
            <Animated.View style={[styles.content, successStyle]}>
              <View style={styles.successIcon}>
                <LinearGradient
                  colors={[colors.dark.primary, '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <Feather name="check" size={32} color="#0F172A" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              <Text style={styles.hint}>
                Didn't receive the email? Check your spam folder or
              </Text>
              <TouchableOpacity onPress={() => setSent(false)}>
                <Text style={styles.resendLink}>try a different email address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 32 }]}
                onPress={() => router.replace('/(auth)/login')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.dark.primary, '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.primaryBtnText}>Back to Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  gradientHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  safeArea: { flex: 1 },
  backBtn: {
    marginLeft: 20,
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  body: { flex: 1, justifyContent: 'center' },
  content: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 24,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  successIcon: {
    marginBottom: 24,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: colors.dark.text,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emailHighlight: {
    color: colors.dark.text,
    fontFamily: 'Inter_600SemiBold',
  },
  form: { width: '100%', gap: 16 },
  primaryBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#0F172A', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.2 },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  backLinkText: {
    color: colors.dark.primary,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  hint: {
    color: colors.dark.mutedForeground,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  resendLink: {
    color: colors.dark.primary,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
