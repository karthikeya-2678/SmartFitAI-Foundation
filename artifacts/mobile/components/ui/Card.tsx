import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { useColors } from '@/hooks/useColors';

export type CardVariant = 'default' | 'surface' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | number;

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
}

const PADDING_MAP: Record<string, number> = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24,
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  const colors = useColors();

  const bgColor =
    variant === 'surface'
      ? colors.surface
      : colors.card;

  const paddingValue =
    typeof padding === 'number' ? padding : PADDING_MAP[padding];

  const shadowStyle: ViewStyle =
    variant === 'elevated'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 8,
        }
      : {};

  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: colors.radius,
          padding: paddingValue,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default Card;
