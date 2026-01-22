/**
 * Authentication Type Definitions
 */
export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Callback function type for operations requiring authentication
 */
export type AuthenticatedOperation<T = void> = () => Promise<T> | T;
