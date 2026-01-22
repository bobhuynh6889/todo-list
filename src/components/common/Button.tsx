import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
import {
  padding,
  fontSize,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from '../../utils/responsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: padding.md,
    paddingHorizontal: padding.xxl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_SIZE,
    backgroundColor: colors.blue,
  },
  primary: {
    backgroundColor: colors.blue,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
});
