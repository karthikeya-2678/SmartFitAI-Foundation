import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';

/**
 * Returns the design tokens for the current color scheme.
 * SmartFitAI defaults to the dark palette — falls back to dark when
 * the system scheme is null or undetected.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette = scheme === 'light' ? colors.light : colors.dark;
  return { ...palette, radius: colors.radius };
}
