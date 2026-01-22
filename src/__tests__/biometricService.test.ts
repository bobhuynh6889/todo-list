/**
 * Biometric Service Tests
 * Comprehensive tests for the actual biometricService implementation
 */

// Mock expo-local-authentication BEFORE importing
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

import * as LocalAuthentication from 'expo-local-authentication';
import { biometricService } from '../services/biometricService';

describe('BiometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockClear();
  });

  describe('isBiometricAvailable', () => {
    it('should return true when hardware is available and enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await biometricService.isBiometricAvailable();

      expect(result).toBe(true);
      expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalled();
      expect(LocalAuthentication.isEnrolledAsync).toHaveBeenCalled();
    });

    it('should return false when hardware is not available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const result = await biometricService.isBiometricAvailable();

      expect(result).toBe(false);
      expect(LocalAuthentication.isEnrolledAsync).not.toHaveBeenCalled();
    });

    it('should return false when not enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await biometricService.isBiometricAvailable();

      expect(result).toBe(false);
    });

    it('should return false on error and log error', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockRejectedValue(
        new Error('Hardware check failed')
      );

      const result = await biometricService.isBiometricAvailable();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error checking biometric availability:', expect.any(Error));
    });
  });

  describe('getSupportedAuthenticationTypes', () => {
    it('should return supported authentication types', async () => {
      const mockTypes = [LocalAuthentication.AuthenticationType.FINGERPRINT];
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue(mockTypes);

      const result = await biometricService.getSupportedAuthenticationTypes();

      expect(result).toEqual(mockTypes);
      expect(LocalAuthentication.supportedAuthenticationTypesAsync).toHaveBeenCalled();
    });

    it('should return empty array on error and log error', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockRejectedValue(
        new Error('Failed to get types')
      );

      const result = await biometricService.getSupportedAuthenticationTypes();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error getting supported authentication types:', expect.any(Error));
    });

    it('should return multiple authentication types', async () => {
      const mockTypes = [
        LocalAuthentication.AuthenticationType.FINGERPRINT,
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ];
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue(mockTypes);

      const result = await biometricService.getSupportedAuthenticationTypes();

      expect(result).toHaveLength(2);
      expect(result).toContain(LocalAuthentication.AuthenticationType.FINGERPRINT);
      expect(result).toContain(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    });
  });

  describe('authenticate', () => {
    it('should return success when authentication succeeds', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await biometricService.authenticate('Test message');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Test message',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
    });

    it('should use default prompt message', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      await biometricService.authenticate();

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
    });

    it('should return error when biometric is not available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Biometric authentication is not available on this device');
    });

    it('should return error when authentication fails with error message', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'User cancelled',
      });

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled');
    });

    it('should return default error message when authentication fails without error', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
      });

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });

    it('should handle Error exceptions and log them', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
        new Error('Authentication error')
      );

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication error');
      expect(console.error).toHaveBeenCalledWith('Authentication error:', expect.any(Error));
    });

    it('should handle unknown error types', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue('Unknown error');

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown authentication error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getBiometricTypeName', () => {
    it('should return "Face ID" for facial recognition', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);

      const result = await biometricService.getBiometricTypeName();

      expect(result).toBe('Face ID');
    });

    it('should return "Touch ID" for fingerprint', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      const result = await biometricService.getBiometricTypeName();

      expect(result).toBe('Touch ID');
    });

    it('should return "Iris" for iris', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.IRIS,
      ]);

      const result = await biometricService.getBiometricTypeName();

      expect(result).toBe('Iris');
    });

    it('should return "Biometric" for unknown types', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([]);

      const result = await biometricService.getBiometricTypeName();

      expect(result).toBe('Biometric');
    });

    it('should prioritize Face ID over other types', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        LocalAuthentication.AuthenticationType.IRIS,
      ]);

      const result = await biometricService.getBiometricTypeName();

      expect(result).toBe('Face ID');
    });

    it('should prioritize Touch ID over Iris', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
        LocalAuthentication.AuthenticationType.IRIS,
      ]);

      const result = await biometricService.getBiometricTypeName();

      expect(result).toBe('Touch ID');
    });
  });

  describe('hasBiometricHardwareButNotEnrolled', () => {
    it('should return true when hardware exists but not enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await biometricService.hasBiometricHardwareButNotEnrolled();

      expect(result).toBe(true);
      expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalled();
      expect(LocalAuthentication.isEnrolledAsync).toHaveBeenCalled();
    });

    it('should return false when no hardware', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const result = await biometricService.hasBiometricHardwareButNotEnrolled();

      expect(result).toBe(false);
      expect(LocalAuthentication.isEnrolledAsync).not.toHaveBeenCalled();
    });

    it('should return false when hardware exists and is enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await biometricService.hasBiometricHardwareButNotEnrolled();

      expect(result).toBe(false);
    });

    it('should return false on error and log error', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockRejectedValue(
        new Error('Hardware check failed')
      );

      const result = await biometricService.hasBiometricHardwareButNotEnrolled();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error checking biometric enrollment:', expect.any(Error));
    });
  });
});
