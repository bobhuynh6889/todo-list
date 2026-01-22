import React, { useEffect, useState, useCallback } from 'react';
import { 
  StatusBar, 
  useColorScheme, 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TodoProvider } from './src/contexts';
import TodoListScreen from './src/screens/TodoListScreen';
import { biometricService, storageService } from './src/services';
import { colors } from './src/constants/colors';

function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleFirstTimeBiometricSetup = useCallback(async () => {
    try {
      // Check if biometric authentication is available
      const isAvailable = await biometricService.isBiometricAvailable();

      if (!isAvailable) {
        Alert.alert(
          'Biometric Authentication',
          'Biometric authentication is not available on this device. You can still use the app, but sensitive operations will not be protected.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await storageService.setBiometricSetupComplete();
                setIsAuthenticated(true);
              },
            },
          ]
        );
        return;
      }

      // Get biometric type name
      const biometricType = await biometricService.getBiometricTypeName();

      // Show alert explaining biometric setup
      Alert.alert(
        `Enable ${biometricType}`,
        `This app uses ${biometricType} to protect your sensitive data. Please authenticate to continue.`,
        [
          {
            text: 'Skip',
            style: 'cancel',
            onPress: async () => {
              await storageService.setBiometricSetupComplete();
              setIsAuthenticated(true);
            },
          },
          {
            text: 'Authenticate',
            onPress: async () => {
              const result = await biometricService.authenticate(
                `Authenticate with ${biometricType} to secure your todos`
              );

              if (result.success) {
                // Authentication successful
                await storageService.setBiometricSetupComplete();
                setIsAuthenticated(true);
                Alert.alert(
                  'Success',
                  `${biometricType} has been enabled for this app.`
                );
              } else {
                // Authentication failed, but allow user to proceed
                Alert.alert(
                  'Authentication Failed',
                  'You can still use the app. You can try authenticating again later.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await storageService.setBiometricSetupComplete();
                        setIsAuthenticated(true);
                      },
                    },
                  ]
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in biometric setup:', error);
      // Allow user to proceed even if setup fails
      await storageService.setBiometricSetupComplete();
      setIsAuthenticated(true);
    }
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      const isFirstLaunch = await storageService.isFirstLaunch();
      const isSetupComplete = await storageService.isBiometricSetupComplete();

      if (isFirstLaunch || !isSetupComplete) {
        await handleFirstTimeBiometricSetup();
      } else {
        setIsAuthenticated(true);
      }

      if (isFirstLaunch) {
        await storageService.setHasLaunched();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsAuthenticated(true);
    } finally {
      setIsInitializing(false);
    }
  }, [handleFirstTimeBiometricSetup]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Show loading screen while initializing
  if (isInitializing || !isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Initializing...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TodoProvider>
        <TodoListScreen />
      </TodoProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.antiFlashWhite,
  },
  loadingContainerDark: {
    backgroundColor: colors.black,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray,
  },
});

export default App;
