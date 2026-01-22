import { Alert } from 'react-native';
import { useTodoContext } from '../contexts';
import { useAuth } from './useAuth';
import { CreateTodoInput, UpdateTodoInput } from '../types';

interface UseTodosReturn {
  todos: ReturnType<typeof useTodoContext>['todos'];
  loading: ReturnType<typeof useTodoContext>['loading'];
  error: ReturnType<typeof useTodoContext>['error'];
  isAuthenticating: boolean;
  biometricType: string;
  handleAddTodo: (input: CreateTodoInput) => Promise<void>;
  handleUpdateTodo: (id: string, updates: UpdateTodoInput) => Promise<void>;
  handleDeleteTodo: (id: string) => Promise<void>;
  handleToggleTodo: (id: string) => Promise<void>;
}

/**
 * Custom hook that provides todo operations with authentication
 */
export function useTodos(): UseTodosReturn {
  const { todos, loading, error, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodoContext();
  const { isAuthenticating, biometricType, authenticateAndExecute } = useAuth();

  // Add a new todo with authentication
  const handleAddTodo = async (input: CreateTodoInput) => {
    if (!input.title.trim()) {
      Alert.alert('Invalid Input', 'Please enter a title for the todo');
      return;
    }

    await authenticateAndExecute(
      () => addTodo(input),
      'Authenticate to add a new todo'
    );
  };

  // Update a todo with authentication
  const handleUpdateTodo = async (id: string, updates: UpdateTodoInput) => {
    await authenticateAndExecute(
      () => updateTodo(id, updates),
      'Authenticate to update this todo'
    );
  };

  // Delete a todo with authentication and confirmation
  const handleDeleteTodo = async (id: string) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await authenticateAndExecute(
              () => deleteTodo(id),
              'Authenticate to delete this todo'
            );
          },
        },
      ]
    );
  };

  // Toggle todo completion status
  // Checking off todos is a frequent action and shouldn't require auth
  const handleToggleTodo = async (id: string) => {
    await toggleTodo(id);
  };

  return {
    todos,
    loading,
    error,
    isAuthenticating,
    biometricType,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleToggleTodo,
  };
}
