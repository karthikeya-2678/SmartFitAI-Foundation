import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';

/** Read-only snapshot of the current auth state. */
export function useAuth() {
  const { session, user, isLoading, isInitialized } = useAuthStore();
  return {
    session,
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!session,
  };
}

// ─── Email Sign-In ──────────────────────────────────────────────────────────

export function useSignInWithEmail() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signInWithEmail(email, password),
    onSuccess: () => {
      router.replace('/(tabs)');
    },
  });
}

// ─── Email Sign-Up ──────────────────────────────────────────────────────────

export function useSignUpWithEmail() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      email,
      password,
      fullName,
    }: {
      email: string;
      password: string;
      fullName: string;
    }) => authService.signUpWithEmail(email, password, fullName),
    onSuccess: (data, { email }) => {
      // If email confirmation is disabled in Supabase, session is returned immediately.
      if (data.session) {
        router.replace('/(tabs)');
      } else {
        // Email confirmation enabled — go to OTP / check-email screen.
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { type: 'signup', email },
        });
      }
    },
  });
}

// ─── Phone OTP ──────────────────────────────────────────────────────────────

export function useSendPhoneOTP() {
  const router = useRouter();
  return useMutation({
    mutationFn: (phone: string) => authService.sendPhoneOTP(phone),
    onSuccess: (_data, phone) => {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { type: 'sms', phone },
      });
    },
  });
}

export function useVerifyPhoneOTP() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ phone, token }: { phone: string; token: string }) =>
      authService.verifyPhoneOTP(phone, token),
    onSuccess: () => {
      router.replace('/(tabs)');
    },
  });
}

// ─── Email OTP ──────────────────────────────────────────────────────────────

export function useVerifyEmailOTP() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      email,
      token,
      type,
    }: {
      email: string;
      token: string;
      type: 'email' | 'signup';
    }) => authService.verifyEmailOTP(email, token, type),
    onSuccess: () => {
      router.replace('/(tabs)');
    },
  });
}

// ─── Forgot Password ────────────────────────────────────────────────────────

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.resetPasswordForEmail(email),
  });
}

// ─── Google OAuth ───────────────────────────────────────────────────────────

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      const url = await authService.getGoogleOAuthUrl();
      if (url) {
        await WebBrowser.openAuthSessionAsync(url);
      }
    },
  });
}

// ─── Sign Out ───────────────────────────────────────────────────────────────

export function useSignOut() {
  const resetAuth = useAuthStore((s) => s.reset);
  const resetApp = useAppStore((s) => s.reset);
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      resetAuth();
      resetApp();
      router.replace('/(auth)/welcome');
    },
    onError: () => {
      // Force local reset even if API call fails.
      resetAuth();
      resetApp();
      router.replace('/(auth)/welcome');
    },
  });
}
