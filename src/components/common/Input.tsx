import React from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TextInputProps,
  useColorScheme,
} from 'react-native';
import { colors } from '../../constants/colors';
import {
  padding,
  margin,
  fontSize,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from '../../utils/responsive';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isDark ? styles.inputDark : styles.inputLight,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={isDark ? colors.gray : colors.lightGray}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: margin.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: margin.sm,
    color: colors.black,
  },
  labelDark: {
    color: colors.white,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: padding.lg,
    paddingVertical: padding.md,
    fontSize: fontSize.lg,
    minHeight: TOUCH_TARGET_SIZE,
  },
  inputLight: {
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
    color: colors.black,
  },
  inputDark: {
    backgroundColor: colors.black,
    borderColor: colors.darkGray,
    color: colors.white,
  },
  inputError: {
    borderColor: colors.red,
  },
  errorText: {
    color: colors.red,
    fontSize: fontSize.sm,
    marginTop: margin.xs,
  },
});
