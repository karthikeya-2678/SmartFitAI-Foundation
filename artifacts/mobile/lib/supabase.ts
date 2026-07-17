import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/**
 * SecureStore has a hard 2048-byte limit per value.
 * Supabase session tokens (access + refresh + user metadata) frequently exceed
 * this — especially after Google OAuth — causing setItemAsync to fail silently,
 * which means getSession() returns null on the next render and the user is
 * logged out immediately.
 *
 * Fix: split values into 1800-byte chunks stored under numbered keys, with a
 * separate key that records the chunk count so we know how many to reassemble.
 */
const CHUNK_SIZE = 1800; // safely under the 2048 limit

const secureChunkedStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const numChunksRaw = await SecureStore.getItemAsync(`${key}_numChunks`);

      if (numChunksRaw === null) {
        // No chunked entry — fall back to reading the key directly
        // (handles any values small enough to have been stored unchunked)
        return await SecureStore.getItemAsync(key);
      }

      const n = parseInt(numChunksRaw, 10);
      const chunks = await Promise.all(
        Array.from({ length: n }, (_, i) =>
          SecureStore.getItemAsync(`${key}_chunk_${i}`)
        )
      );

      // If any chunk is missing the session is corrupted — treat as no session
      if (chunks.some((c) => c === null)) return null;
      return (chunks as string[]).join('');
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    // Split into chunks
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }

    // Write all chunks + the count key atomically (in parallel)
    await Promise.all([
      SecureStore.setItemAsync(`${key}_numChunks`, String(chunks.length)),
      ...chunks.map((chunk, i) =>
        SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk)
      ),
    ]);
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const numChunksRaw = await SecureStore.getItemAsync(`${key}_numChunks`);
      const n = numChunksRaw ? parseInt(numChunksRaw, 10) : 0;

      await Promise.all([
        // Remove the count key
        SecureStore.deleteItemAsync(`${key}_numChunks`).catch(() => {}),
        // Remove all chunks
        ...Array.from({ length: n }, (_, i) =>
          SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {})
        ),
        // Remove any legacy unchunked key
        SecureStore.deleteItemAsync(key).catch(() => {}),
      ]);
    } catch {
      // Ignore — best-effort cleanup
    }
  },
};

/**
 * Platform-aware storage adapter for Supabase auth tokens.
 * - iOS / Android: chunked SecureStore (encrypted, handles >2 KB tokens)
 * - Web:           AsyncStorage (IndexedDB-backed)
 */
const storage =
  Platform.OS === 'web'
    ? {
        getItem: (key: string) => AsyncStorage.getItem(key),
        setItem: (key: string, value: string) =>
          AsyncStorage.setItem(key, value),
        removeItem: (key: string) => AsyncStorage.removeItem(key),
      }
    : secureChunkedStorage;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
