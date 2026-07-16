import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { OTPInput } from '@/components/auth/OTPInput';
import { useVerifyPhoneOTP, useVerifyEmailOTP } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import colors from '@/constants/colors';

const RESEND_DELAY = 60;

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type: 'sms' | 'email' | 'signup';
    phone?: string;
    email?: string;
  }>();

  const { type = 'sms', phone, email } = params;
  const contact = phone ?? email ?? '';
  const maskedContact = contact.length > 6
    ? contact.slice(0, 3) + '•••' + contact.slice(-4)
    : contact;

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const [canResend, setCanResend] = useState(false);

  const verifyPhone = useVerifyPhoneOTP();
  const verifyEmail = useVerifyEmailOTP();
  const isLoading = verifyPhone.isPending || verifyEmail.isPending;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Shake animation for wrong code
  const shakeX = useSharedValue(0);
  const shake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  };
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleVerify = useCallback(async (code: string) => {
    if (code.length < 6) return;

    if (type === 'sms' && phone) {
      verifyPhone.mutate(
        { phone, token: code },
        {
          onError: (e: any) => {
            shake();
            setOtp('');
            Alert.alert('Invalid code', e.message ?? 'Please check the code and try again.');
          },
        },
      );
    } else if ((type === 'email' || type === 'signup') && email) {
      verifyEmail.mutate(
        { email, token: code, type: type === 'signup' ? 'signup' : 'email' },
        {
          onError: (e: any) => {
            shake();
            setOtp('');
            Alert.alert('Invalid code', e.message ?? 'Please check the code and try again.');
          },
        },
      );
    }
  }, [type, phone, email]);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify(otp);
    }
  }, [otp]);

  const handleResend = async () => {
    if (!canResend) return;
    try {
      if (type === 'sms' && phone) {
        await authService.sendPhoneOTP(phone);
      } else if (email) {
        await authService.sendEmailOTP(email);
      }
      setOtp('');
      setCountdown(RESEND_DELAY);
      setCanResend(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to resend code.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#060E1F', '#0F172A']} style={styles.gradientBg} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.dark.text} />
        </TouchableOpacity>

        <View style={styles.body}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[colors.dark.primary, colors.dark.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Feather name={type === 'sms' ? 'message-square' : 'mail'} size={28} color="#0F172A" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.contact}>{maskedContact}</Text>
          </Text>

          {/* OTP Input */}
          <Animated.View style={[styles.otpWrap, shakeStyle]}>
            <OTPInput value={otp} onChange={setOtp} length={6} autoFocus />
          </Animated.View>

          {/* Verify button (also triggers via auto-submit) */}
          <TouchableOpacity
            style={[styles.primaryBtn, (isLoading || otp.length < 6) && { opacity: 0.6 }]}
            onPress={() => handleVerify(otp)}
            disabled={isLoading || otp.length < 6}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.dark.primary, '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              {isLoading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>Didn't get the code? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdown}>Resend in {countdown}s</Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  gradientBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
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
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  iconWrap: {
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
    marginBottom: 36,
  },
  contact: {
    color: colors.dark.text,
    fontFamily: 'Inter_600SemiBold',
  },
  otpWrap: {
    width: '100%',
    marginBottom: 32,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  gradientBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#0F172A', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.2 },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendPrompt: { color: colors.dark.textSecondary, fontSize: 14, fontFamily: 'Inter_400Regular' },
  resendLink: { color: colors.dark.primary, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  countdown: { color: colors.dark.mutedForeground, fontSize: 14, fontFamily: 'Inter_500Medium' },
});
