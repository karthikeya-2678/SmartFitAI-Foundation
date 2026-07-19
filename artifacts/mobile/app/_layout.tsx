import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';

// Prevent the splash screen from auto-hiding before assets are ready.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Listens to Supabase auth state and syncs it to Zustand.
 * Also enforces route-level auth guards via expo-router.
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const { session, isInitialized } = useAuthStore();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  const router = useRouter();
  const segments = useSegments();

  // ── Initialise Supabase session & listen for changes ────────────────────────
  useEffect(() => {
    let initialized = false;

    const finish = (sess: import('@supabase/supabase-js').Session | null) => {
      if (initialized) return;
      initialized = true;
      setSession(sess);
      setInitialized();
    };

    // Subscribe first so we don't miss rapid events.
    // Only update session state for events that actually change auth status —
    // calling setSession(null) on every event (including TOKEN_REFRESHED with
    // a valid session) can race against the Google OAuth exchange and log the
    // user out immediately after they sign in.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED' ||
          event === 'SIGNED_OUT' ||
          event === 'INITIAL_SESSION'
        ) {
          setSession(newSession);
        }
        finish(newSession);
      },
    );

    // Get the current session; fall back to null on error
    supabase.auth
      .getSession()
      .then(({ data }) => finish(data.session))
      .catch(() => finish(null));

    // Safety: always resolve within 3 s so the splash never hangs
    const timeout = setTimeout(() => finish(null), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // ── Protected route guard ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onIndex = segments[0] === undefined;
    const isAuthed = !!session;

    if (isAuthed && inAuthGroup) {
      // Logged-in user lands on an auth screen → push to tabs
      router.replace('/(tabs)');
    } else if (!isAuthed && !inAuthGroup && !onIndex) {
      // Logged-out user is trying to access a protected route
      if (!hasOnboarded) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(auth)/welcome');
      }
    }
  }, [isInitialized, session, segments, hasOnboarded]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Initial splash/redirect screen */}
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        {/* Auth group */}
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        {/* Main app */}
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        {/* Workout screens */}
        <Stack.Screen name="workout/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="workout/active" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="workout/complete" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="workout/history" options={{ animation: 'slide_from_right' }} />
        {/* Exercise screens */}
        <Stack.Screen name="exercise/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <RootLayoutNav />
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
