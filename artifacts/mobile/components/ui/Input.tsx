import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      containerStyle,
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const colors = useColors();
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? colors.destructive
      : focused
        ? colors.primary
        : colors.border;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            style={[
              styles.label,
              { color: colors.textSecondary, fontFamily: 'Inter_500Medium' },
            ]}
          >
            {label}
          </Text>
        )}
        <View
          style={[
            styles.wrapper,
            {
              backgroundColor: colors.surface,
              borderColor,
              borderRadius: colors.radius,
            },
          ]}
        >
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: 'Inter_400Regular',
                paddingLeft: leftIcon ? 4 : 16,
                paddingRight: rightIcon ? 4 : 16,
              },
              style,
            ]}
            placeholderTextColor={colors.mutedForeground}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
        {error ? (
          <Text
            style={[
              styles.hint,
              { color: colors.destructive, fontFamily: 'Inter_400Regular' },
            ]}
          >
            {error}
          </Text>
        ) : helper ? (
          <Text
            style={[
              styles.hint,
              { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
            ]}
          >
            {helper}
          </Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, marginLeft: 2 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 13 },
  iconLeft: { paddingLeft: 14, paddingRight: 8 },
  iconRight: { paddingRight: 14, paddingLeft: 8 },
  hint: { fontSize: 12, marginLeft: 2 },
});

export default Input;
