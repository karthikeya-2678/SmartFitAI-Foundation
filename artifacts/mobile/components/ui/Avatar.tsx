import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 96,
};

export interface AvatarProps {
  source?: ImageSourcePropType;
  /** Display name — used to derive initials when no image is provided */
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  const colors = useColors();
  const dim = SIZE_MAP[size];
  const fontSize = Math.round(dim * 0.34);

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() ?? '')
        .join('')
    : '?';

  return (
    <View
      style={[
        styles.container,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: colors.primary + '22',
          borderColor: colors.primary + '55',
        },
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            { fontSize, color: colors.primary, fontFamily: 'Inter_700Bold' },
          ]}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  initials: {
    letterSpacing: 0.5,
  },
});

export default Avatar;
