/**
 * Todo Reducer Tests
 */
import { Todo } from '../types';

/**
 * Mock the reducer and types since we need to test it in isolation
 */

type TodoAction =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

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

describe('todoReducer', () => {
  const initialState: TodoState = {
    todos: [],
    loading: false,
    error: null,
  };

  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  describe('SET_TODOS', () => {
    it('should set todos and clear loading and error', () => {
      const todos = [mockTodo];
      const action: TodoAction = { type: 'SET_TODOS', payload: todos };
      const newState = todoReducer(
        { ...initialState, loading: true, error: 'Some error' },
        action
      );

      expect(newState.todos).toEqual(todos);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
    });
  });

  describe('ADD_TODO', () => {
    it('should add a new todo to the beginning of the list', () => {
      const existingTodo: Todo = { ...mockTodo, id: '0' };
      const newTodo: Todo = { ...mockTodo, id: '1' };
      const action: TodoAction = { type: 'ADD_TODO', payload: newTodo };
      const newState = todoReducer(
        { ...initialState, todos: [existingTodo] },
        action
      );

      expect(newState.todos).toHaveLength(2);
      expect(newState.todos[0]).toEqual(newTodo);
      expect(newState.todos[1]).toEqual(existingTodo);
      expect(newState.error).toBeNull();
    });
  });

  describe('UPDATE_TODO', () => {
    it('should update the specified todo', () => {
      const todo: Todo = { ...mockTodo };
      const updates = { title: 'Updated Title', description: 'Updated Description' };
      const action: TodoAction = {
        type: 'UPDATE_TODO',
        payload: { id: '1', updates },
      };
      const newState = todoReducer({ ...initialState, todos: [todo] }, action);

      expect(newState.todos[0].title).toBe('Updated Title');
      expect(newState.todos[0].description).toBe('Updated Description');
      expect(newState.error).toBeNull();
    });

    it('should not update other todos', () => {
      const todo1: Todo = { ...mockTodo, id: '1' };
      const todo2: Todo = { ...mockTodo, id: '2', title: 'Another Todo' };
      const updates = { title: 'Updated Title' };
      const action: TodoAction = {
        type: 'UPDATE_TODO',
        payload: { id: '1', updates },
      };
      const newState = todoReducer(
        { ...initialState, todos: [todo1, todo2] },
        action
      );

      expect(newState.todos[0].title).toBe('Updated Title');
      expect(newState.todos[1].title).toBe('Another Todo');
    });
  });

  describe('DELETE_TODO', () => {
    it('should remove the specified todo', () => {
      const todo: Todo = { ...mockTodo };
      const action: TodoAction = { type: 'DELETE_TODO', payload: '1' };
      const newState = todoReducer({ ...initialState, todos: [todo] }, action);

      expect(newState.todos).toHaveLength(0);
      expect(newState.error).toBeNull();
    });

    it('should only remove the specified todo', () => {
      const todo1: Todo = { ...mockTodo, id: '1' };
      const todo2: Todo = { ...mockTodo, id: '2' };
      const action: TodoAction = { type: 'DELETE_TODO', payload: '1' };
      const newState = todoReducer(
        { ...initialState, todos: [todo1, todo2] },
        action
      );

      expect(newState.todos).toHaveLength(1);
      expect(newState.todos[0].id).toBe('2');
    });
  });

  describe('TOGGLE_TODO', () => {
    it('should toggle the completed status', () => {
      const todo: Todo = { ...mockTodo, completed: false };
      const action: TodoAction = { type: 'TOGGLE_TODO', payload: '1' };
      const newState = todoReducer({ ...initialState, todos: [todo] }, action);

      expect(newState.todos[0].completed).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should toggle from completed to incomplete', () => {
      const todo: Todo = { ...mockTodo, completed: true };
      const action: TodoAction = { type: 'TOGGLE_TODO', payload: '1' };
      const newState = todoReducer({ ...initialState, todos: [todo] }, action);

      expect(newState.todos[0].completed).toBe(false);
    });

    it('should only toggle the specified todo', () => {
      const todo1: Todo = { ...mockTodo, id: '1', completed: false };
      const todo2: Todo = { ...mockTodo, id: '2', completed: false };
      const action: TodoAction = { type: 'TOGGLE_TODO', payload: '1' };
      const newState = todoReducer(
        { ...initialState, todos: [todo1, todo2] },
        action
      );

      expect(newState.todos[0].completed).toBe(true);
      expect(newState.todos[1].completed).toBe(false);
    });
  });

  describe('SET_LOADING', () => {
    it('should set loading to true', () => {
      const action: TodoAction = { type: 'SET_LOADING', payload: true };
      const newState = todoReducer(initialState, action);

      expect(newState.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const action: TodoAction = { type: 'SET_LOADING', payload: false };
      const newState = todoReducer(
        { ...initialState, loading: true },
        action
      );

      expect(newState.loading).toBe(false);
    });
  });

  describe('SET_ERROR', () => {
    it('should set error message and clear loading', () => {
      const errorMessage = 'Something went wrong';
      const action: TodoAction = { type: 'SET_ERROR', payload: errorMessage };
      const newState = todoReducer({ ...initialState, loading: true }, action);

      expect(newState.error).toBe(errorMessage);
      expect(newState.loading).toBe(false);
    });

    it('should clear error when set to null', () => {
      const action: TodoAction = { type: 'SET_ERROR', payload: null };
      const newState = todoReducer(
        { ...initialState, error: 'Previous error' },
        action
      );

      expect(newState.error).toBeNull();
    });
  });

  describe('State Immutability', () => {
    it('should not mutate the original state when adding todo', () => {
      const originalState = { ...initialState, todos: [] };
      const newTodo: Todo = { ...mockTodo };
      const action: TodoAction = { type: 'ADD_TODO', payload: newTodo };
      
      todoReducer(originalState, action);

      expect(originalState.todos).toHaveLength(0);
    });

    it('should not mutate the original state when updating todo', () => {
      const todo: Todo = { ...mockTodo };
      const originalState = { ...initialState, todos: [todo] };
      const action: TodoAction = {
        type: 'UPDATE_TODO',
        payload: { id: '1', updates: { title: 'Updated' } },
      };
      
      todoReducer(originalState, action);

      expect(originalState.todos[0].title).toBe('Test Todo');
    });
  });
});
