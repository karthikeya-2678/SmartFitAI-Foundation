import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { authService } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';
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
//   8. We navigate directly to /(tabs); onAuthStateChange in _layout.tsx also
//      picks up the session as a safety net.

type GoogleSignInResult = 'authenticated' | 'cancelled';

export function useSignInWithGoogle() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (): Promise<GoogleSignInResult> => {
      // createURL returns the correct scheme for the current environment:
      //   - Production / EAS build: smartfitai://
      //   - Expo Go development:    exp://<host>/--/
      const redirectTo = Linking.createURL('/');

      const url = await authService.getGoogleOAuthUrl(redirectTo);
      if (!url) throw new Error('Failed to generate Google OAuth URL');

      // maybeCompleteAuthSession is required on Android to dismiss the browser
      // when the redirect is intercepted by the app scheme.
      WebBrowser.maybeCompleteAuthSession();

      const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);

      if (result.type !== 'success') {
        // User cancelled or browser was dismissed — not an error, no navigation.
        return 'cancelled';
      }

      // Extract the PKCE authorization code from the redirect URL.
      // Supabase returns it as a query param (?code=xxx) in PKCE flow, but
      // also check hash fragments (#code=xxx) as a fallback for older configs.
      //
      // NOTE: new URL() is NOT used here — Hermes (React Native's JS engine)
      // does not correctly parse custom schemes such as exp:// or smartfitai://,
      // causing searchParams to be empty even when the query string is present.
      // URLSearchParams on its own works correctly on all platforms.
      const rawUrl = result.url;
      const queryString = rawUrl.includes('?') ? rawUrl.split('?')[1] ?? '' : '';
      const queryPart = queryString.includes('#') ? queryString.split('#')[0] : queryString;
      const hashPart = rawUrl.includes('#') ? rawUrl.split('#')[1] ?? '' : '';

      const queryParams = new URLSearchParams(queryPart);
      const hashParams = new URLSearchParams(hashPart);

      const code = queryParams.get('code') ?? hashParams.get('code') ?? null;

      // ── PKCE flow (primary): ?code=xxx ────────────────────────────────────
      // ── Implicit flow (fallback): #access_token=xxx&refresh_token=xxx ─────
      //
      // With flowType:'pkce' set on the Supabase client, Supabase should always
      // redirect with ?code=xxx. The implicit-flow fallback handles edge cases
      // where the Supabase project is still configured for implicit flow, or
      // where an older cached OAuth URL without a PKCE challenge is used.

      let session: import('@supabase/supabase-js').Session | null = null;

      if (code) {
        // PKCE: exchange the authorization code for a session.
        const result = await authService.exchangeGoogleCode(code);
        session = result.session;
      } else {
        // Check for implicit-flow tokens in the URL hash / query.
        const accessToken =
          hashParams.get('access_token') ?? queryParams.get('access_token') ?? null;
        const refreshToken =
          hashParams.get('refresh_token') ?? queryParams.get('refresh_token') ?? null;

        if (accessToken && refreshToken) {
          // Set the session directly from the tokens Supabase returned.
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          session = data.session;
        } else {
          // Neither code nor tokens found — surface the error Supabase sent, or
          // a generic message so the user sees something actionable.
          const errorDescription =
            queryParams.get('error_description') ??
            hashParams.get('error_description') ??
            null;
          throw new Error(errorDescription ?? 'Google sign-in failed: no code returned');
        }
      }

      if (!session) {
        throw new Error('Google sign-in failed: no session returned after code exchange');
      }

      // Eagerly update Zustand so the auth guard and any subscribers are in
      // sync before we navigate — don't rely solely on onAuthStateChange
      // which may fire slightly later.
      setSession(session);

      return 'authenticated';
    },
    onSuccess: (status) => {
      // Only navigate when the user actually authenticated.
      // Cancelled flows return 'cancelled' and must not redirect.
      if (status === 'authenticated') {
        router.replace('/(tabs)');
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
