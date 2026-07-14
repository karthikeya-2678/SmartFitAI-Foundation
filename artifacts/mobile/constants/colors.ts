/**
 * SmartFitAI design tokens.
 * Dark-first palette with a complementary light palette.
 * Access via the useColors() hook — never hardcode hex values in components.
 */

const colors = {
  dark: {
    // Brand
    primary: '#22C55E',
    primaryForeground: '#0F172A',
    accent: '#06B6D4',
    accentForeground: '#0F172A',

    // Surfaces
    background: '#0F172A',
    foreground: '#FFFFFF',
    surface: '#1E293B',
    surfaceForeground: '#FFFFFF',
    card: '#334155',
    cardForeground: '#FFFFFF',

    // Typography
    text: '#FFFFFF',
    textSecondary: '#CBD5E1',
    mutedForeground: '#94A3B8',

    // Status
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Structural
    border: '#334155',
    input: '#1E293B',
    muted: '#1E293B',

    // Legacy aliases (for useColors compatibility)
    tint: '#22C55E',
    secondary: '#1E293B',
    secondaryForeground: '#CBD5E1',
  },

  light: {
    // Brand
    primary: '#16A34A',
    primaryForeground: '#FFFFFF',
    accent: '#0891B2',
    accentForeground: '#FFFFFF',

    // Surfaces
    background: '#F8FAFC',
    foreground: '#0F172A',
    surface: '#FFFFFF',
    surfaceForeground: '#0F172A',
    card: '#FFFFFF',
    cardForeground: '#0F172A',

    // Typography
    text: '#0F172A',
    textSecondary: '#475569',
    mutedForeground: '#94A3B8',

    // Status
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    success: '#16A34A',
    warning: '#D97706',
    info: '#2563EB',

    // Structural
    border: '#E2E8F0',
    input: '#F1F5F9',
    muted: '#F1F5F9',

    // Legacy aliases
    tint: '#16A34A',
    secondary: '#F1F5F9',
    secondaryForeground: '#475569',
  },

  // Shared
  radius: 12,
} as const;

export default colors;
