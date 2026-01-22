import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../../constants/colors';
import {
  padding,
  margin,
  fontSize,
  iconSize,
} from '../../utils/responsive';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📝</Text>
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      {description && (
        <Text style={[styles.description, isDark && styles.descriptionDark]}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: padding.xxxl,
    paddingVertical: padding.xxxl * 2,
  },
  icon: {
    fontSize: iconSize.xl * 2,
    marginBottom: margin.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.black,
    marginBottom: margin.sm,
    textAlign: 'center',
  },
  titleDark: {
    color: colors.white,
  },
  description: {
    fontSize: fontSize.lg,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: fontSize.lg * 1.4,
  },
  descriptionDark: {
    color: colors.gray,
  },
});
