import { useState, useCallback } from 'react';
import { Alert, Linking, Platform, AlertButton } from 'react-native';
import { biometricService } from '../services';
import { AuthenticatedOperation } from '../types';

interface UseAuthReturn {
  isAvailable: boolean;
  isAuthenticating: boolean;
  biometricType: string;
  checkAvailability: () => Promise<void>;
  authenticateAndExecute: <T = void>(
    operation: AuthenticatedOperation<T>,
    promptMessage?: string
  ) => Promise<T | undefined>;
}

interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
}

interface AlertConfig {
  title: string;
  message: string;
  buttons: AlertButton[];
}

/**
 * Get platform-specific biometric settings path
 */
const getBiometricSettingsPath = (): string => {
  return Platform.OS === 'ios' ? 'Face ID & Passcode' : 'Security';
};

/**
 * Generate alert configuration based on biometric status
 */
const generateAlertConfig = (
  status: BiometricStatus,
  biometricTypeName: string,
  onCancel: () => void,
  onOpenSettings: () => Promise<void>,
  onContinueWithoutAuth: () => Promise<void>
): AlertConfig => {
  const { hasHardware, isEnrolled } = status;

  if (!hasHardware) {
    // No biometric hardware available - allow user to continue without auth
    return {
      title: 'Biometric Not Available',
      message: 'Your device does not support biometric authentication. The operation will proceed without authentication.',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Continue',
          onPress: onContinueWithoutAuth,
        },
      ],
    };
  }

  if (!isEnrolled) {
    // Hardware exists but no biometrics enrolled
    return {
      title: `${biometricTypeName} Not Set Up`,
      message: `Please set up ${biometricTypeName} on your device first. Go to Settings > ${getBiometricSettingsPath()} to enable ${biometricTypeName}.`,
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Open Settings',
          onPress: onOpenSettings,
        },
      ],
    };
  }

  // Hardware exists, biometrics enrolled, but permission might be denied
  return {
    title: `Enable ${biometricTypeName}`,
    message: `This app needs permission to use ${biometricTypeName}. Please enable it in your device settings.`,
    buttons: [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Open Settings',
        onPress: onOpenSettings,
      },
    ],
  };
};

/**
 * Custom hook for managing biometric authentication
 */
export function useAuth(): UseAuthReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  // Check if biometric authentication is available on the device
  const checkAvailability = useCallback(async () => {
    try {
      const available = await biometricService.isBiometricAvailable();
      setIsAvailable(available);

      if (available) {
        const type = await biometricService.getBiometricTypeName();
        setBiometricType(type);
      }

      // Development-only logging
      if (__DEV__) {
        console.log('Biometric availability:', available);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  }, []);

  // Open device settings
  const openAppSettings = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening settings:', error);
      Alert.alert('Error', 'Unable to open settings');
      throw error;
    }
  }, []);

  // Get current biometric status (hardware availability and enrollment)
  const getBiometricStatus = useCallback(async (): Promise<BiometricStatus> => {
    try {
      const [types, notEnrolled] = await Promise.all([
        biometricService.getSupportedAuthenticationTypes(),
        biometricService.hasBiometricHardwareButNotEnrolled(),
      ]);

      return {
        hasHardware: types.length > 0,
        isEnrolled: !notEnrolled,
      };
    } catch (error) {
      console.error('Error getting biometric status:', error);
      return { hasHardware: false, isEnrolled: false };
    }
  }, []);

  // Execute operation without authentication
  const executeOperationWithoutAuth = useCallback(
    async <T = void>(operation: AuthenticatedOperation<T>): Promise<T | undefined> => {
      try {
        return await operation();
      } catch (error) {
        console.error('Operation failed:', error);
        Alert.alert('Error', 'Failed to complete operation');
        return undefined;
      }
    },
    []
  );

  // Handle biometric authentication not available scenario
  const handleBiometricNotAvailable = useCallback(
    async <T = void>(
      operation: AuthenticatedOperation<T>,
      biometricTypeName: string
    ): Promise<T | undefined> => {
      try {
        const status = await getBiometricStatus();

        return new Promise<T | undefined>((resolve) => {
          const alertConfig = generateAlertConfig(
            status,
            biometricTypeName,
            // onCancel
            () => resolve(undefined),
            // onOpenSettings
            async () => {
              try {
                await openAppSettings();
              } catch (error) {
                // Error already logged in openAppSettings
              } finally {
                resolve(undefined);
              }
            },
            // onContinueWithoutAuth
            async () => {
              const result = await executeOperationWithoutAuth(operation);
              resolve(result);
            }
          );

          Alert.alert(alertConfig.title, alertConfig.message, alertConfig.buttons);
        });
      } catch (error) {
        console.error('Error handling biometric unavailability:', error);
        return undefined;
      }
    },
    [getBiometricStatus, openAppSettings, executeOperationWithoutAuth]
  );

  /**
   * Authenticate user and execute an operation if successful
   * @param operation - The operation to execute after authentication
   * @param promptMessage - Message to show in authentication prompt
   * @returns Result of the operation if successful, undefined otherwise
   */
  const authenticateAndExecute = useCallback(
    async <T = void>(
      operation: AuthenticatedOperation<T>,
      promptMessage: string = 'Authenticate to continue'
    ): Promise<T | undefined> => {
      try {
        setIsAuthenticating(true);

        // Check if biometric authentication is available right before using it
        const available = await biometricService.isBiometricAvailable();

        // Update state to reflect current availability
        if (available !== isAvailable) {
          setIsAvailable(available);
          if (available) {
            const type = await biometricService.getBiometricTypeName();
            setBiometricType(type);
          }
        }

        // If biometric auth is not available, handle it appropriately
        if (!available) {
          setIsAuthenticating(false);
          const currentBiometricType = await biometricService.getBiometricTypeName();
          return await handleBiometricNotAvailable(operation, currentBiometricType);
        }

        // Attempt authentication
        const authResult = await biometricService.authenticate(promptMessage);

        if (authResult.success) {
          // Authentication successful, execute the operation
          return await operation();
        } else {
          // Authentication failed - show error to user
          Alert.alert(
            'Authentication Failed',
            authResult.error || 'Please try again',
            [{ text: 'OK' }]
          );
          return undefined;
        }
      } catch (error) {
        console.error('Authentication error:', error);
        Alert.alert('Error', 'An error occurred during authentication');
        return undefined;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isAvailable, handleBiometricNotAvailable]
  );

  return {
    isAvailable,
    isAuthenticating,
    biometricType,
    checkAvailability,
    authenticateAndExecute,
  };
}
