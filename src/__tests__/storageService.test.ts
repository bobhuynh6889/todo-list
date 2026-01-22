/**
 * Storage Service Tests
 * Comprehensive tests for the actual storageService implementation
 */

// Mock AsyncStorage BEFORE importing
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../services/storageService';
import { Todo } from '../types';

describe('StorageService', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockClear();
  });

  describe('saveTodos', () => {
    it('should save todos to AsyncStorage successfully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const todos = [mockTodo];

      await storageService.saveTodos(todos);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@TodoList:todos',
        JSON.stringify(todos)
      );
    });

    it('should save empty array', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveTodos([]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@TodoList:todos',
        JSON.stringify([])
      );
    });

    it('should save multiple todos', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const todos = [
        mockTodo,
        { ...mockTodo, id: '2', title: 'Second Todo' },
      ];

      await storageService.saveTodos(todos);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@TodoList:todos',
        JSON.stringify(todos)
      );
    });

    it('should throw error on failure and log it', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save failed'));

      await expect(storageService.saveTodos([mockTodo])).rejects.toThrow(
        'Failed to save todos to storage'
      );
      expect(console.error).toHaveBeenCalledWith('Error saving todos:', expect.any(Error));
    });
  });

  describe('loadTodos', () => {
    it('should load todos from AsyncStorage successfully', async () => {
      const todos = [mockTodo];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(todos));

      const result = await storageService.loadTodos();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@TodoList:todos');
      expect(result).toEqual(todos);
    });

    it('should return empty array when no todos are stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.loadTodos();

      expect(result).toEqual([]);
    });

    it('should parse stored JSON correctly for multiple todos', async () => {
      const todos = [
        mockTodo,
        { ...mockTodo, id: '2', title: 'Second Todo' },
        { ...mockTodo, id: '3', title: 'Third Todo', completed: true },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(todos));

      const result = await storageService.loadTodos();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
      expect(result[2].completed).toBe(true);
    });

    it('should return empty array on error and log it', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Load failed'));

      const result = await storageService.loadTodos();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error loading todos:', expect.any(Error));
    });
  });

  describe('clearTodos', () => {
    it('should remove todos from AsyncStorage successfully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.clearTodos();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@TodoList:todos');
    });

    it('should throw error on failure and log it', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Remove failed'));

      await expect(storageService.clearTodos()).rejects.toThrow(
        'Failed to clear todos from storage'
      );
      expect(console.error).toHaveBeenCalledWith('Error clearing todos:', expect.any(Error));
    });
  });

  describe('clearAll', () => {
    it('should clear all AsyncStorage data successfully', async () => {
      (AsyncStorage.clear as jest.Mock).mockResolvedValue(undefined);

      await storageService.clearAll();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should throw error on failure and log it', async () => {
      (AsyncStorage.clear as jest.Mock).mockRejectedValue(new Error('Clear failed'));

      await expect(storageService.clearAll()).rejects.toThrow('Failed to clear storage');
      expect(console.error).toHaveBeenCalledWith('Error clearing storage:', expect.any(Error));
    });
  });

  describe('isFirstLaunch', () => {
    it('should return true when hasLaunched is null (first launch)', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.isFirstLaunch();

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@TodoList:has_launched');
    });

    it('should return false when hasLaunched is set', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const result = await storageService.isFirstLaunch();

      expect(result).toBe(false);
    });

    it('should return false when hasLaunched has any value', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');

      const result = await storageService.isFirstLaunch();

      expect(result).toBe(false);
    });

    it('should return false on error and log it', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Get failed'));

      const result = await storageService.isFirstLaunch();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error checking first launch:', expect.any(Error));
    });
  });

  describe('setHasLaunched', () => {
    it('should set hasLaunched flag to true', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.setHasLaunched();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@TodoList:has_launched', 'true');
    });

    it('should throw error on failure and log it', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Set failed'));

      await expect(storageService.setHasLaunched()).rejects.toThrow(
        'Failed to save launch status'
      );
      expect(console.error).toHaveBeenCalledWith('Error setting has launched:', expect.any(Error));
    });
  });

  describe('isBiometricSetupComplete', () => {
    it('should return true when biometric setup is complete', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const result = await storageService.isBiometricSetupComplete();

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@TodoList:biometric_setup');
    });

    it('should return false when biometric setup is not complete (null)', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.isBiometricSetupComplete();

      expect(result).toBe(false);
    });

    it('should return false when value is not "true"', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');

      const result = await storageService.isBiometricSetupComplete();

      expect(result).toBe(false);
    });

    it('should return false when value is any other string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('something');

      const result = await storageService.isBiometricSetupComplete();

      expect(result).toBe(false);
    });

    it('should return false on error and log it', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Get failed'));

      const result = await storageService.isBiometricSetupComplete();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error checking biometric setup:', expect.any(Error));
    });
  });

  describe('setBiometricSetupComplete', () => {
    it('should set biometric setup flag to true', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.setBiometricSetupComplete();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@TodoList:biometric_setup', 'true');
    });

    it('should throw error on failure and log it', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Set failed'));

      await expect(storageService.setBiometricSetupComplete()).rejects.toThrow(
        'Failed to save biometric setup status'
      );
      expect(console.error).toHaveBeenCalledWith('Error setting biometric setup:', expect.any(Error));
    });
  });

  describe('Error Handling - Additional Coverage', () => {
    it('should handle JSON parse errors in loadTodos', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await storageService.loadTodos();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle complex todo objects', async () => {
      const complexTodo: Todo = {
        id: 'complex-1',
        title: 'Complex Todo with special chars !@#$%',
        description: 'Description with\nnewlines\tand\ttabs',
        completed: true,
        createdAt: 1234567890,
        updatedAt: 9876543210,
      };
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveTodos([complexTodo]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@TodoList:todos',
        JSON.stringify([complexTodo])
      );
    });
  });
});
