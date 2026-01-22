import * as LocalAuthentication from 'expo-local-authentication';
import { AuthResult } from '../types';

class BiometricService {
  /**
   * Check if biometric hardware is available and enrolled on the device
   * @returns Promise resolving to true if biometrics are available
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      // Check if hardware supports biometric authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      if (!hasHardware) {
        return false;
      }

      // Check if user has enrolled biometric credentials
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      return isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get the types of biometric authentication available on the device
   * @returns Promise resolving to array of available authentication types
   */
  async getSupportedAuthenticationTypes(): Promise<
    LocalAuthentication.AuthenticationType[]
  > {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported authentication types:', error);
      return [];
    }
  }

  /**
   * Authenticate the user using biometric authentication
   * @param promptMessage - Message to display in the authentication prompt
   * @returns Promise resolving to authentication result
   */
  async authenticate(promptMessage: string = 'Authenticate to continue'): Promise<AuthResult> {
    try {
      // Check if biometrics are available first
      const isAvailable = await this.isBiometricAvailable();
      
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      // Attempt authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown authentication error',
      };
    }
  }

  /**
   * Get a user-friendly name for the biometric type available on the device
   * @returns Promise resolving to biometric type name
   */
  async getBiometricTypeName(): Promise<string> {
    const types = await this.getSupportedAuthenticationTypes();
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    
    return 'Biometric';
  }

  /**
   * Check if device has biometric hardware but user hasn't enrolled
   * @returns Promise resolving to true if hardware exists but no biometrics enrolled
   */
  async hasBiometricHardwareButNotEnrolled(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return !isEnrolled;
    } catch (error) {
      console.error('Error checking biometric enrollment:', error);
      return false;
    }
  }
}

export const biometricService = new BiometricService();
