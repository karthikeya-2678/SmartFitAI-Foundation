import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import {
  useSignInWithEmail,
  useSendPhoneOTP,
  useSignInWithGoogle,
} from '@/hooks/useAuth';
import colors from '@/constants/colors';

const { width: W } = Dimensions.get('window');

type AuthTab = 'email' | 'phone';

export default function LoginScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>('email');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone state
  const [phone, setPhone] = useState('');

  const signInEmail = useSignInWithEmail();
  const sendOTP = useSendPhoneOTP();
  const googleLogin = useSignInWithGoogle();

  const handleEmailLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    signInEmail.mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onError: (e: any) =>
          Alert.alert('Sign in failed', e.message ?? 'Please check your credentials.'),
      },
    );
  };

  const handlePhoneLogin = () => {
    const cleaned = phone.trim().replace(/\s/g, '');
    if (!cleaned) {
      Alert.alert('Missing field', 'Please enter your phone number.');
      return;
    }
    sendOTP.mutate(cleaned, {
      onError: (e: any) =>
        Alert.alert('Error', e.message ?? 'Failed to send OTP.'),
    });
  };

  const isEmailLoading = signInEmail.isPending;
  const isPhoneLoading = sendOTP.isPending;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Subtle gradient header */}
      <LinearGradient
        colors={['#060E1F', '#0F172A']}
        style={styles.gradientHeader}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.dark.text} />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
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
                  <Feather name="zap" size={22} color="#0F172A" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
            </View>

            {/* Tab switcher */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, tab === 'email' && styles.tabActive]}
                onPress={() => setTab('email')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, tab === 'email' && styles.tabTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, tab === 'phone' && styles.tabActive]}
                onPress={() => setTab('phone')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, tab === 'phone' && styles.tabTextActive]}>
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            {tab === 'email' ? (
              <View style={styles.form}>
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
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleEmailLogin}
                  leftIcon={<Feather name="lock" size={18} color={colors.dark.mutedForeground} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.dark.mutedForeground}
                      />
                    </TouchableOpacity>
                  }
                />

                {/* Forgot password */}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotBtn}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign in button */}
                <TouchableOpacity
                  style={[styles.primaryBtn, isEmailLoading && { opacity: 0.75 }]}
                  onPress={handleEmailLogin}
                  disabled={isEmailLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.dark.primary, '#16A34A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBtn}
                  >
                    {isEmailLoading ? (
                      <ActivityIndicator color="#0F172A" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  returnKeyType="done"
                  onSubmitEditing={handlePhoneLogin}
                  placeholder="+1 555 000 0000"
                  leftIcon={<Feather name="phone" size={18} color={colors.dark.mutedForeground} />}
                  helper="We'll send a one-time code via SMS"
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, isPhoneLoading && { opacity: 0.75 }]}
                  onPress={handlePhoneLogin}
                  disabled={isPhoneLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.dark.primary, '#16A34A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBtn}
                  >
                    {isPhoneLoading ? (
                      <ActivityIndicator color="#0F172A" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Send Code</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

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
              onPress={() =>
                googleLogin.mutate(undefined, {
                  onError: (e: any) =>
                    Alert.alert('Google Sign-In Failed', e.message ?? 'Please try again.'),
                })
              }
              disabled={googleLogin.isPending}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign up link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>New here? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
                <Text style={styles.signupLink}>Create Account</Text>
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
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
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
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    gap: 8,
  },
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.dark.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.dark.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.dark.primary,
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.dark.mutedForeground,
  },
  tabTextActive: {
    color: '#0F172A',
    fontFamily: 'Inter_700Bold',
  },
  form: { gap: 16 },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotText: {
    color: colors.dark.primary,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
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
    backgroundColor: 'rgba(255,255,255,0.04)',
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
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupPrompt: {
    color: colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  signupLink: {
    color: colors.dark.primary,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
