---
name: SmartFitAI Auth Module
description: Key decisions and gotchas for the Supabase auth + Expo Router auth flow
---

# Auth Module — Durable Decisions

## SecureStore: native-only, needs platform adapter
`expo-secure-store` crashes on web with "getValueWithKeyAsync is not a function".
Always use a Platform.OS check: SecureStore on native, AsyncStorage on web.
**Why:** SecureStore calls native device APIs unavailable in browser JS.
**How to apply:** See `lib/supabase.ts` — check before modifying the storage adapter.

## expo-secure-store version pinning
`expo install expo-secure-store` must be used (not `pnpm add expo-secure-store`).
`pnpm add` installed v57 for Expo SDK 54, causing a Metro file-watcher crash.
Correct version for Expo 54 is ~15.x.
**Why:** PNPM resolves latest regardless of Expo SDK compatibility.
**How to apply:** Always use `pnpm exec expo install <package>` for Expo modules.

## Supabase getSession() needs error handling + fallback timeout
`supabase.auth.getSession()` can hang on web (network call for token refresh).
Without `.catch()` and a 3-second timeout, the splash screen never redirects.
**Why:** getSession attempts token refresh, which makes a network call that can fail silently.
**How to apply:** See `app/_layout.tsx` AuthProvider — always wrap with catch + setTimeout(3000).

## NativeWind metro config is disabled
`withNativeWind` in metro.config.js injects `react-native-css-interop/jsx-runtime` 
as a JSX transform. PNPM strict hoisting prevents Metro from resolving that sub-path.
Use plain `getDefaultConfig` + StyleSheet for components; NativeWind preset in babel removed.
**Why:** PNPM symlink structure + Metro's node_modules resolution conflict.
**How to apply:** Don't re-enable withNativeWind until PNPM hoisting is resolved.

## Hermes URL parsing: never use `new URL()` with custom schemes
In React Native (Hermes engine), `new URL('exp://...')` or `new URL('smartfitai://...')`
does not correctly extract `searchParams` — they come back empty even when the query string
is present. Use plain string splitting + `URLSearchParams` instead.
**Why:** Hermes's URL implementation only handles http/https schemes properly.
**How to apply:** Any code that parses OAuth redirect URLs (exp://, smartfitai://) must split
on `?` and `#` manually, then pass each part to `new URLSearchParams(part)`.

## Auth guard architecture
Root `_layout.tsx` → `AuthProvider` handles:
- Session initialization (Supabase onAuthStateChange + getSession)
- Post-init redirects (authenticated user on auth screen → tabs; unauthed on protected route → auth)
`app/index.tsx` (splash) handles: initial redirect after initialization with 600ms animation buffer.
The two work together: AuthProvider skips redirect when segments[0] is undefined (on index screen).
