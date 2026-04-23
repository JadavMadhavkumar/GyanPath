import type { ApiResponse, ApiError } from '../types';

/**
 * Wrap Supabase response into a consistent ApiResponse format.
 */
export function handleSupabaseResponse<T>(
  data: T | null,
  error: { message: string; code?: string } | null
): ApiResponse<T> {
  if (error) {
    return {
      data: null,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      },
    };
  }
  return { data, error: null };
}

/**
 * Create a standardized error response.
 */
export function createError(
  message: string,
  code: string,
  details?: Record<string, unknown>
): ApiError {
  return { message, code, details };
}

/**
 * Common error codes.
 */
export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
