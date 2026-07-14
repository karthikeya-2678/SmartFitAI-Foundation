import { useColorScheme } from 'react-native';
import { useColors } from './useColors';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { FONTS } from '@/constants/fonts';

export function useTheme() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';

  return {
    colors,
    spacing: SPACING,
    fontSize: FONT_SIZE,
    radius: BORDER_RADIUS,
    shadows: SHADOWS,
    fonts: FONTS,
    isDark,
    colorScheme: colorScheme ?? 'dark',
  };
}
