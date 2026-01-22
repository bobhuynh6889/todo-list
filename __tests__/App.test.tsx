/**
 * App Component Tests
 * Basic smoke tests for the main App component
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

/**
 * Mock React Native
 */
jest.mock('react-native', () => ({
  StatusBar: 'StatusBar',
  useColorScheme: jest.fn(() => 'light'),
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: any) => styles,
  },
  ActivityIndicator: 'ActivityIndicator',
  Alert: {
    alert: jest.fn((title, message, buttons) => {
      // Auto-press the first button if available
      if (buttons && buttons.length > 0 && buttons[0].onPress) {
        buttons[0].onPress();
      }
    }),
  },
  Platform: {
    OS: 'ios',
    select: (obj: any) => obj.ios || obj.default,
  },
  Dimensions: {
    get: jest.fn(() => ({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  Pressable: 'Pressable',
  Modal: 'Modal',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Image: 'Image',
  SafeAreaView: 'SafeAreaView',
  RefreshControl: 'RefreshControl',
}));

/**
 * Mock AsyncStorage
 */
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

/**
 * Mock expo-local-authentication
 */
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1])),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

// Import App after all mocks are set up
import App from '../App';

describe('App', () => {
  test('renders correctly', async () => {
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<App />);
    });
  });

  test('renders without crashing', async () => {
    await expect(async () => {
      await ReactTestRenderer.act(() => {
        ReactTestRenderer.create(<App />);
      });
    }).not.toThrow();
  });
});
