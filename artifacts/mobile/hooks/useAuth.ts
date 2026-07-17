import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
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
//
// Supabase-proxied PKCE flow (no native Google SDK required):
//
//   1. Supabase generates a Google OAuth URL with a PKCE code_challenge.
//   2. expo-web-browser opens it in a secure in-app browser session.
//   3. User authenticates with Google.
//   4. Google → Supabase server → redirects to `redirectTo?code=<auth_code>`.
//   5. openAuthSessionAsync intercepts the redirect (matches `redirectTo` scheme)
//      and returns result.url to the app without leaving the browser.
//   6. We extract `code` from result.url and call exchangeCodeForSession.
//   7. Supabase completes the PKCE exchange and issues a session.
//   8. The existing onAuthStateChange listener in _layout.tsx picks up the
//      session and the auth guard redirects the user to the tabs.

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      // createURL returns the correct scheme for the current environment:
      //   - Production / EAS build: smartfitai://
      //   - Expo Go development:    exp://<host>/--/
      const redirectTo = Linking.createURL('/');

      const url = await authService.getGoogleOAuthUrl(redirectTo);
      if (!url) throw new Error('Failed to generate Google OAuth URL');

      const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);

      if (result.type !== 'success') {
        // User cancelled or browser was dismissed — not an error.
        return;
      }

      // Extract the PKCE authorization code from the redirect URL.
      const parsed = new URL(result.url);
      const code = parsed.searchParams.get('code');

      if (!code) {
        // Supabase may have redirected with an error.
        const errorDescription = parsed.searchParams.get('error_description');
        throw new Error(errorDescription ?? 'Google sign-in failed: no code returned');
      }

      // Exchange the code for a Supabase session (PKCE verifier was stored
      // in-memory by supabase-js during step 1).
      await authService.exchangeGoogleCode(code);

      // The onAuthStateChange listener in app/_layout.tsx handles navigation.
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
