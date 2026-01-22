import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types';

const STORAGE_KEYS = {
  TODOS: '@TodoList:todos',
  BIOMETRIC_SETUP: '@TodoList:biometric_setup',
  HAS_LAUNCHED: '@TodoList:has_launched',
} as const;

class StorageService {
  /**
   * Save todos to persistent storage
   * @param todos - Array of todos to save
   * @returns Promise that resolves when save is complete
   */
  async saveTodos(todos: Todo[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(todos);
      await AsyncStorage.setItem(STORAGE_KEYS.TODOS, jsonValue);
    } catch (error) {
      console.error('Error saving todos:', error);
      throw new Error('Failed to save todos to storage');
    }
  }

  /**
   * Load todos from persistent storage
   * @returns Promise resolving to array of todos
   */
  async loadTodos(): Promise<Todo[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
      
      if (jsonValue === null) {
        return [];
      }
      
      const todos = JSON.parse(jsonValue) as Todo[];
      return todos;
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  }

  /**
   * Clear all todos from storage
   * @returns Promise that resolves when clear is complete
   */
  async clearTodos(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TODOS);
    } catch (error) {
      console.error('Error clearing todos:', error);
      throw new Error('Failed to clear todos from storage');
    }
  }

  /**
   * Clear all data from storage
   * @returns Promise that resolves when clear is complete
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  /**
   * Check if this is the first time the app is being launched
   * @returns Promise resolving to true if first launch
   */
  async isFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
      return hasLaunched === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  }

  /**
   * Mark that the app has been launched
   * @returns Promise that resolves when save is complete
   */
  async setHasLaunched(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, 'true');
    } catch (error) {
      console.error('Error setting has launched:', error);
      throw new Error('Failed to save launch status');
    }
  }

  /**
   * Check if biometric setup has been completed
   * @returns Promise resolving to true if setup is complete
   */
  async isBiometricSetupComplete(): Promise<boolean> {
    try {
      const isComplete = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_SETUP);
      return isComplete === 'true';
    } catch (error) {
      console.error('Error checking biometric setup:', error);
      return false;
    }
  }

  /**
   * Mark biometric setup as complete
   * @returns Promise that resolves when save is complete
   */
  async setBiometricSetupComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_SETUP, 'true');
    } catch (error) {
      console.error('Error setting biometric setup:', error);
      throw new Error('Failed to save biometric setup status');
    }
  }
}

export const storageService = new StorageService();
