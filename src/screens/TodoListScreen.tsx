import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TodoItem, TodoForm, EmptyState } from '../components';
import { useTodos } from '../hooks';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/colors';
import {
  padding,
  margin,
  fontSize,
  borderRadius,
  getShadow,
  TOUCH_TARGET_SIZE,
  getNumColumns,
} from '../utils/responsive';

export default function TodoListScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get auth state and check availability on mount
  const { checkAvailability, biometricType } = useAuth();

  // Get todo operations with authentication
  const {
    todos,
    loading,
    error,
    isAuthenticating,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleToggleTodo,
  } = useTodos();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const handleOpenAddForm = () => {
    setEditingTodo(undefined);
    setIsFormVisible(true);
  };

  const handleOpenEditForm = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingTodo(todo);
      setIsFormVisible(true);
    }
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setEditingTodo(undefined);
  };

  const handleFormSubmit = async (data: CreateTodoInput | UpdateTodoInput) => {
    if (editingTodo) {
      await handleUpdateTodo(editingTodo.id, data);
    } else {
      await handleAddTodo(data as CreateTodoInput);
    }
    handleCloseForm();
  };

  const numColumns = getNumColumns();

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={numColumns > 1 ? styles.columnWrapper : undefined}>
      <TodoItem
        todo={item}
        onToggle={handleToggleTodo}
        onEdit={handleOpenEditForm}
        onDelete={handleDeleteTodo}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    return (
      <EmptyState
        title="No todos yet"
        description="Tap the + button to create your first todo"
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View>
          <Text style={[styles.title, isDark && styles.titleDark]}>My Todos</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
            {' • '}
            Protected by {biometricType}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleOpenAddForm}
          accessibilityLabel="Add new todo"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Loading indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.loadingText}>
            Loading todos...
          </Text>
        </View>
      ) : (
        /* Todo list */
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item: Todo) => item.id}
          numColumns={numColumns}
          key={numColumns}
          contentContainerStyle={[
            styles.listContent,
            todos.length === 0 && styles.listContentEmpty,
          ]}
          columnWrapperStyle={numColumns > 1 ? styles.columnContainer : undefined}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Authenticating overlay */}
      {isAuthenticating && (
        <View style={styles.authenticatingOverlay}>
          <View style={[styles.authenticatingCard, isDark && styles.authenticatingCardDark]}>
            <ActivityIndicator size="large" color={colors.blue} />
            <Text style={[styles.authenticatingText, isDark && styles.authenticatingTextDark]}>
              Authenticating...
            </Text>
          </View>
        </View>
      )}

      {/* Todo form modal */}
      <TodoForm
        visible={isFormVisible}
        todo={editingTodo}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.antiFlashWhite,
  },
  containerDark: {
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: padding.xl,
    paddingVertical: padding.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerDark: {
    backgroundColor: colors.eerieBlack,
    borderBottomColor: colors.darkGray,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: 'bold',
    color: colors.black,
  },
  titleDark: {
    color: colors.white,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.gray,
    marginTop: margin.xs,
  },
  subtitleDark: {
    color: colors.gray,
  },
  addButton: {
    width: TOUCH_TARGET_SIZE,
    height: TOUCH_TARGET_SIZE,
    borderRadius: TOUCH_TARGET_SIZE / 2,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadow(4),
  },
  addButtonText: {
    fontSize: fontSize.hero,
    color: colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
  errorContainer: {
    backgroundColor: colors.red,
    paddingHorizontal: padding.lg,
    paddingVertical: padding.md,
  },
  errorText: {
    color: colors.white,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: margin.lg,
    fontSize: fontSize.lg,
    color: colors.gray,
  },
  loadingTextDark: {
    color: colors.gray,
  },
  listContent: {
    padding: padding.lg,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  columnContainer: {
    justifyContent: 'space-between',
    paddingHorizontal: padding.xs,
  },
  columnWrapper: {
    flex: 1,
    marginHorizontal: margin.xs,
  },
  authenticatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authenticatingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: padding.xxxl,
    alignItems: 'center',
    ...getShadow(8),
  },
  authenticatingCardDark: {
    backgroundColor: colors.eerieBlack,
  },
  authenticatingText: {
    marginTop: margin.lg,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.black,
  },
  authenticatingTextDark: {
    color: colors.white,
  },
});
