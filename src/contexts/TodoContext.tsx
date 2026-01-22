import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';
import { storageService } from '../services';

type TodoAction =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: UpdateTodoInput } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

interface TodoContextValue extends TodoState {
  addTodo: (input: CreateTodoInput) => Promise<void>;
  updateTodo: (id: string, updates: UpdateTodoInput) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
}

const initialState: TodoState = {
  todos: [],
  loading: true,
  error: null,
};

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'SET_TODOS':
      return {
        ...state,
        todos: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_TODO':
      return {
        ...state,
        todos: [action.payload, ...state.todos],
        error: null,
      };

    case 'UPDATE_TODO': {
      const { id, updates } = action.payload;
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id
            ? { ...todo, ...updates, updatedAt: Date.now() }
            : todo
        ),
        error: null,
      };
    }

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
        error: null,
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed, updatedAt: Date.now() }
            : todo
        ),
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const loadTodos = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const todos = await storageService.loadTodos();
      dispatch({ type: 'SET_TODOS', payload: todos });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to load todos' 
      });
    }
  };

  const saveTodos = useCallback(async () => {
    try {
      await storageService.saveTodos(state.todos);
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }, [state.todos]);

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      saveTodos();
    }
  }, [state.loading, saveTodos]);

  /**
   * Add a new todo
   * @param input - Data for the new todo
   */
  const addTodo = async (input: CreateTodoInput): Promise<void> => {
    const newTodo: Todo = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: input.title.trim(),
      description: input.description?.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dispatch({ type: 'ADD_TODO', payload: newTodo });
  };

  /**
   * Update an existing todo
   * @param id - ID of the todo to update
   * @param updates - Fields to update
   */
  const updateTodo = async (id: string, updates: UpdateTodoInput): Promise<void> => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, updates } });
  };

  /**
   * Delete a todo
   * @param id - ID of the todo to delete
   */
  const deleteTodo = async (id: string): Promise<void> => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  };

  /**
   * Toggle a todo's completed status
   * @param id - ID of the todo to toggle
   */
  const toggleTodo = async (id: string): Promise<void> => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };

  const value: TodoContextValue = {
    ...state,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

/**
 * Custom hook to use todo context
 * Ensures context is used within TodoProvider
 */
export function useTodoContext(): TodoContextValue {
  const context = useContext(TodoContext);
  
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  
  return context;
}
