import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import colors from '@/constants/colors';

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export function OTPInput({ value, onChange, length = 6, autoFocus = true }: OTPInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, length);
    onChange(cleaned);
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.container}>
      {/* Hidden real input captures all keypresses */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        caretHidden
        autoFocus={autoFocus}
      />

      {/* Visual boxes */}
      {digits.map((digit, i) => {
        const isFocused = value.length === i;
        const isFilled = !!digit;
        return (
          <View
            key={i}
            style={[
              styles.box,
              isFocused && styles.boxFocused,
              isFilled && styles.boxFilled,
            ]}
          >
            {isFilled ? (
              <TextInput
                style={styles.digit}
                value={digit}
                editable={false}
                caretHidden
              />
            ) : (
              <View
                style={[
                  styles.cursor,
                  isFocused && styles.cursorVisible,
                ]}
              />
            )}
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  box: {
    width: 50,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: colors.dark.primary,
    backgroundColor: '#1E293B',
  },
  boxFilled: {
    borderColor: colors.dark.primary + '80',
    backgroundColor: colors.dark.primary + '15',
  },
  digit: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: colors.dark.text,
    textAlign: 'center',
    width: 30,
    padding: 0,
  },
  cursor: {
    width: 2,
    height: 22,
    backgroundColor: 'transparent',
    borderRadius: 1,
  },
  cursorVisible: {
    backgroundColor: colors.dark.primary,
  },
});
