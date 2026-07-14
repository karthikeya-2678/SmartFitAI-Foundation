import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    onPressIn?.({ nativeEvent: {} } as Parameters<typeof onPressIn>[0]);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    onPressOut?.({ nativeEvent: {} } as Parameters<typeof onPressOut>[0]);
  };

  const containerStyle: ViewStyle = {
    borderRadius: colors.radius,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...SIZE_STYLES[size],
    ...variantContainer(variant, colors),
    ...(fullWidth ? { alignSelf: 'stretch' } : {}),
    ...(disabled || loading ? { opacity: 0.5 } : {}),
  };

  const labelStyle: TextStyle = {
    ...SIZE_TEXT[size],
    ...variantText(variant, colors),
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, containerStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'danger'
              ? colors.primaryForeground
              : colors.primary
          }
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[labelStyle, textStyle]}>{label}</Text>
          {rightIcon}
        </>
      )}
    </AnimatedTouchable>
  );
}

const SIZE_STYLES: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
  md: { paddingVertical: 13, paddingHorizontal: 24, minHeight: 48 },
  lg: { paddingVertical: 16, paddingHorizontal: 32, minHeight: 56 },
};

const SIZE_TEXT: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: 13, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2 },
  md: { fontSize: 15, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2 },
  lg: { fontSize: 17, fontFamily: 'Inter_700Bold', letterSpacing: 0.2 },
};

function variantContainer(
  variant: ButtonVariant,
  colors: ReturnType<typeof useColors>
): ViewStyle {
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.primary };
    case 'secondary':
      return { backgroundColor: colors.surface };
    case 'outline':
      return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'danger':
      return { backgroundColor: colors.destructive };
  }
}

function variantText(
  variant: ButtonVariant,
  colors: ReturnType<typeof useColors>
): TextStyle {
  switch (variant) {
    case 'primary':
      return { color: colors.primaryForeground };
    case 'secondary':
      return { color: colors.foreground };
    case 'outline':
    case 'ghost':
      return { color: colors.primary };
    case 'danger':
      return { color: colors.destructiveForeground };
  }
}

export default Button;
