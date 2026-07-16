import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { Input } from '@/components/ui/Input';
import { useSignUpWithEmail, useSignInWithGoogle } from '@/hooks/useAuth';
import colors from '@/constants/colors';

function PasswordStrengthBar({ password }: { password: string }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const color = ['#EF4444', '#F59E0B', '#22C55E', '#22C55E'][score - 1] ?? colors.dark.border;
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score] ?? '';

  if (!password) return null;

  return (
    <View style={sb.wrap}>
      <View style={sb.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[sb.bar, { backgroundColor: i <= score ? color : colors.dark.border }]}
          />
        ))}
      </View>
      <Text style={[sb.label, { color }]}>{label}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  bars: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 11, fontFamily: 'Inter_500Medium', width: 44, textAlign: 'right' },
});

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const signUp = useSignUpWithEmail();
  const googleLogin = useSignInWithGoogle();

  const handleSignUp = () => {
    if (!fullName.trim()) {
      return Alert.alert('Missing field', 'Please enter your name.');
    }
    if (!email.trim()) {
      return Alert.alert('Missing field', 'Please enter your email.');
    }
    if (password.length < 8) {
      return Alert.alert('Weak password', 'Password must be at least 8 characters.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Password mismatch', 'Passwords do not match.');
    }
    if (!agreed) {
      return Alert.alert('Terms required', 'Please agree to the Terms of Service.');
    }
    signUp.mutate(
      { email: email.trim().toLowerCase(), password, fullName: fullName.trim() },
      {
        onError: (e: any) =>
          Alert.alert('Sign up failed', e.message ?? 'Please try again.'),
      },
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#060E1F', '#0F172A']} style={styles.gradientHeader} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.dark.text} />
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.headerSection}>
              <View style={styles.iconBadge}>
                <LinearGradient
                  colors={[colors.dark.primary, colors.dark.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBadgeGradient}
                >
                  <Feather name="user-plus" size={22} color="#0F172A" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start your transformation today</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                leftIcon={<Feather name="user" size={18} color={colors.dark.mutedForeground} />}
              />
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                leftIcon={<Feather name="mail" size={18} color={colors.dark.mutedForeground} />}
              />
              <View>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  leftIcon={<Feather name="lock" size={18} color={colors.dark.mutedForeground} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.dark.mutedForeground} />
                    </TouchableOpacity>
                  }
                />
                <PasswordStrengthBar password={password} />
              </View>
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                leftIcon={<Feather name="lock" size={18} color={colors.dark.mutedForeground} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                    <Feather name={showConfirm ? 'eye-off' : 'eye'} size={18} color={colors.dark.mutedForeground} />
                  </TouchableOpacity>
                }
              />

              {/* Terms */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreed((a) => !a)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Feather name="check" size={12} color="#0F172A" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.primaryBtn, signUp.isPending && { opacity: 0.75 }]}
                onPress={handleSignUp}
                disabled={signUp.isPending}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.dark.primary, '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  {signUp.isPending ? (
                    <ActivityIndicator color="#0F172A" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.8}
              onPress={() => googleLogin.mutate()}
              disabled={googleLogin.isPending}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign in link */}
            <View style={styles.signinRow}>
              <Text style={styles.signinPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  headerSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 28, gap: 8 },
  iconBadge: {
    marginBottom: 8,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBadgeGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.dark.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.dark.textSecondary },
  form: { gap: 16 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.dark.primary,
    borderColor: colors.dark.primary,
  },
  termsText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.dark.textSecondary, lineHeight: 20 },
  termsLink: { color: colors.dark.primary, fontFamily: 'Inter_500Medium' },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#0F172A', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.2 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.dark.border },
  dividerText: { color: colors.dark.mutedForeground, fontSize: 13, fontFamily: 'Inter_400Regular' },
  googleBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#EA4335' },
  googleText: { color: colors.dark.text, fontSize: 15, fontFamily: 'Inter_500Medium' },
  signinRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signinPrompt: { color: colors.dark.textSecondary, fontSize: 14, fontFamily: 'Inter_400Regular' },
  signinLink: { color: colors.dark.primary, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
