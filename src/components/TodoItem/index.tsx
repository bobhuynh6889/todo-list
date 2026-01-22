import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Todo } from '../../types';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils';
import {
  padding,
  margin,
  fontSize,
  borderRadius,
  iconSize,
  getShadow,
  TOUCH_TARGET_SIZE,
} from '../../utils/responsive';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Checkbox and content */}
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={() => onToggle(todo.id)}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <View
            style={[
              styles.checkbox,
              todo.completed && styles.checkboxChecked,
              isDark && styles.checkboxDark,
            ]}
          >
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              todo.completed && styles.titleCompleted,
              isDark && styles.titleDark,
            ]}
            numberOfLines={2}
          >
            {todo.title}
          </Text>
          {todo.description && (
            <Text
              style={[
                styles.description,
                todo.completed && styles.descriptionCompleted,
                isDark && styles.descriptionDark,
              ]}
              numberOfLines={2}
            >
              {todo.description}
            </Text>
          )}
          <Text style={[styles.timestamp, isDark && styles.timestampDark]}>
            {formatDate(todo.updatedAt)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(todo.id)}
          accessibilityLabel="Edit todo"
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(todo.id)}
          accessibilityLabel="Delete todo"
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: padding.lg,
    marginBottom: margin.md,
    ...getShadow(3),
  },
  containerDark: {
    backgroundColor: colors.eerieBlack,
    ...getShadow(5),
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  checkboxContainer: {
    paddingTop: padding.xs / 2,
    marginRight: margin.md,
  },
  checkbox: {
    width: iconSize.md,
    height: iconSize.md,
    borderRadius: iconSize.md / 2,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDark: {
    borderColor: colors.darkGray,
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkmark: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.black,
    marginBottom: margin.xs,
  },
  titleDark: {
    color: colors.white,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.gray,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.gray,
    marginBottom: margin.xs,
    lineHeight: fontSize.md * 1.4,
  },
  descriptionDark: {
    color: colors.gray,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  timestamp: {
    fontSize: fontSize.sm,
    color: colors.lightGray,
  },
  timestampDark: {
    color: colors.gray,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: margin.sm,
  },
  actionButton: {
    padding: padding.sm,
    marginLeft: margin.xs,
    minWidth: TOUCH_TARGET_SIZE,
    minHeight: TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: iconSize.sm,
  },
});
